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

  // Test email and password - CHANGE THESE TO YOUR PREFERRED CREDENTIALS
  const testEmail = "test@example.com";
  const testPassword = "Password123!";
  const testName = "Test User";

  console.log(`\nCreating test user: ${testEmail}`);

  try {
    // Step 1: Check if user already exists
    console.log("Checking if user already exists...");
    const { data: existingUsers } = await supabase.auth.admin.listUsers();

    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === testEmail.toLowerCase()
    );

    let userId;

    if (existingUser) {
      console.log(
        `User ${testEmail} already exists with ID: ${existingUser.id}`
      );
      userId = existingUser.id;
    } else {
      // Step 2: Create user
      console.log("Creating new user...");
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true, // Auto-confirm email
        });

      if (userError) throw userError;

      console.log(`User created with ID: ${userData.user.id}`);
      userId = userData.user.id;
    }

    // Step 3: Check if profile exists
    console.log("\nChecking if profile exists...");
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError && !profileError.message.includes("No rows found")) {
      throw profileError;
    }

    // Set current time for timestamps
    const now = new Date().toISOString();
    // Set trial end date to 7 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    const trialEndsAtISO = trialEndsAt.toISOString();

    if (existingProfile) {
      console.log("Profile already exists. Updating...");

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: testName,
          is_premium: true,
          trial_ends_at: trialEndsAtISO,
          subscription: {
            status: "trialing",
            plan_name: "Basic",
            current_period_end: trialEndsAtISO,
          },
          updated_at: now,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      console.log("Profile updated successfully");
    } else {
      console.log("Creating new profile...");

      // Create profile with all required fields
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        name: testName,
        is_premium: true,
        trial_ends_at: trialEndsAtISO,
        subscription: {
          status: "trialing",
          plan_name: "Basic",
          current_period_end: trialEndsAtISO,
        },
        created_at: now,
        updated_at: now,
        last_sign_in_at: null,
        raw_app_meta_data: null,
        raw_user_meta_data: null,
      });

      if (insertError) throw insertError;

      console.log("Profile created successfully");
    }

    console.log("\n✅ Test user setup complete!");
    console.log("───────────────────────────────────");
    console.log("Email:    ", testEmail);
    console.log("Password: ", testPassword);
    console.log("User ID:  ", userId);
    console.log("───────────────────────────────────");
    console.log("You can now log in with these credentials");
  } catch (error) {
    console.error("ERROR:", error);
  }
}

main();
