import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, ".env.local") });

async function checkSchema() {
  console.log("Checking database schema...");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables");
    process.exit(1);
  }

  console.log("Connecting to Supabase...");
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("\nChecking public.profiles table...");
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  if (profilesError) {
    console.error("Error accessing profiles table:", profilesError);
  } else {
    console.log("✅ Profiles table is accessible");
    if (profiles.length > 0) {
      console.log("Sample profile:", profiles[0]);
    } else {
      console.log("No profiles found in table");
    }
  }

  console.log("\nGetting profiles table structure...");
  const { data: profilesStructure, error: structureError } = await supabase
    .rpc("get_table_structure", { table_name: "profiles" })
    .catch(() => {
      return { data: null, error: { message: "RPC function not available" } };
    });

  if (structureError) {
    console.log(
      "Could not get table structure with RPC, trying regular query instead"
    );

    try {
      // Using raw SQL as fallback
      const { data, error } = await supabase
        .from("_temp_info")
        .select()
        .limit(1)
        .then(() => {
          // This will likely fail, but we'll catch it
          return { data: null, error: { message: "Table does not exist" } };
        })
        .catch(() => {
          // This is expected
          return { data: null, error: null };
        });

      console.log(
        "Profiles table appears to exist, but we can't directly query its structure"
      );
    } catch (err) {
      console.error("Error with fallback query:", err);
    }
  } else if (profilesStructure) {
    console.log("Profiles table structure:", profilesStructure);
  }

  console.log("\nTrying to create a test user...");
  const testEmail = `test_${Date.now()}@example.com`;
  const { data: userData, error: userError } =
    await supabase.auth.admin.createUser({
      email: testEmail,
      password: "Test1234!",
      email_confirm: true,
    });

  if (userError) {
    console.error("Error creating test user:", userError);

    // Check if there's a trigger failing
    console.log("\nChecking for database triggers...");
    try {
      const { data, error } = await supabase.rpc("list_triggers");

      if (error) {
        console.log("Cannot check triggers via RPC, trying another approach");
      } else if (data) {
        console.log("Found triggers:", data);
      }
    } catch (err) {
      console.error("Error checking triggers:", err);
    }
  } else {
    console.log("✅ Test user created successfully:", userData.user.id);

    console.log("\nChecking if profiles row was created...");
    const { data: newProfile, error: newProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (newProfileError) {
      console.error("Error finding profile for new user:", newProfileError);

      console.log("\nTrying to create a profile manually...");
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userData.user.id,
        email: testEmail,
        name: "Test User",
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating profile manually:", insertError);
      } else {
        console.log("✅ Profile created manually");
      }
    } else {
      console.log("✅ Profile was automatically created:", newProfile);
    }

    console.log("\nCleaning up test user...");
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userData.user.id
    );
    if (deleteError) {
      console.error("Error deleting test user:", deleteError);
    } else {
      console.log("✅ Test user deleted successfully");
    }
  }
}

checkSchema().catch(console.error);
