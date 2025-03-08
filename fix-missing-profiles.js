import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Loading env from: ${filePath}`);
    const envConfig = dotenv.parse(fs.readFileSync(filePath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
    return true;
  }
  return false;
}

async function main() {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), ".env");
  const envLocalPath = path.resolve(process.cwd(), ".env.local");

  loadEnvFile(envPath);
  loadEnvFile(envLocalPath);

  // Get Supabase credentials
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("ERROR: Supabase credentials missing!");
    process.exit(1);
  }

  console.log("Creating Supabase client with service role key...");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("\nFinding auth users without profiles...");

  try {
    // Step 1: Get all auth users
    console.log("Fetching all auth users...");
    const { data: allUsers, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    console.log(`Found ${allUsers.users.length} total auth users`);

    // Step 2: Get all existing profiles
    console.log("Fetching existing profiles...");
    const { data: existingProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id");

    if (profileError) throw profileError;

    console.log(`Found ${existingProfiles.length} existing profiles`);

    // Step 3: Find users without profiles
    const existingProfileIds = existingProfiles.map((profile) => profile.id);
    const usersWithoutProfiles = allUsers.users.filter(
      (user) => !existingProfileIds.includes(user.id)
    );

    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);

    if (usersWithoutProfiles.length === 0) {
      console.log("All users have profiles! No fixes needed.");
      return;
    }

    // Step 4: Create missing profiles
    console.log("\nCreating missing profiles:");

    // Set current time for timestamps
    const now = new Date().toISOString();
    // Set trial end date to 7 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    const trialEndsAtISO = trialEndsAt.toISOString();

    for (const user of usersWithoutProfiles) {
      console.log(`Creating profile for ${user.email} (${user.id})...`);

      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        is_premium: true,
        trial_ends_at: trialEndsAtISO,
        subscription: {
          status: "trialing",
          plan_name: "Basic",
          current_period_end: trialEndsAtISO,
        },
        created_at: user.created_at || now,
        updated_at: now,
        last_sign_in_at: null,
        raw_app_meta_data: null,
        raw_user_meta_data: null,
      });

      if (insertError) {
        console.error(`Error creating profile for ${user.id}:`, insertError);
      } else {
        console.log(`✅ Created profile for ${user.email}`);
      }
    }

    console.log("\nProfile creation process complete!");
  } catch (error) {
    console.error("ERROR:", error);
  }
}

main();
