import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, ".env.local") });

async function fixDatabaseSchema() {
  console.log("Verifying and fixing Supabase database schema...");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in environment variables");
    process.exit(1);
  }

  console.log("Connecting to Supabase...");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Step 1: Check if the profiles table exists
  console.log("\nStep 1: Checking if profiles table exists...");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === "42P01") {
        // Table does not exist
        console.log("❌ Profiles table does not exist. Creating it...");

        // Create the table
        try {
          const sql = `
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            name TEXT,
            is_premium BOOLEAN DEFAULT false,
            trial_ends_at TIMESTAMPTZ,
            subscription JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ,
            last_sign_in_at TIMESTAMPTZ,
            raw_app_meta_data JSONB,
            raw_user_meta_data JSONB
          );
          
          -- Set RLS policies
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own profile" 
            ON public.profiles FOR SELECT 
            USING (auth.uid() = id);
            
          CREATE POLICY "Users can update their own profile" 
            ON public.profiles FOR UPDATE 
            USING (auth.uid() = id);
            
          -- Grant access to authenticated users
          GRANT SELECT, UPDATE ON public.profiles TO authenticated;
          `;

          // Write SQL to a file for reference
          fs.writeFileSync("create-profiles-table.sql", sql);
          console.log("✓ Wrote SQL to create-profiles-table.sql");

          // Warning - cannot run this SQL directly via supabase client
          console.log(
            "❕ You need to run this SQL script from the Supabase dashboard SQL editor"
          );
          console.log(
            "❕ We have written the SQL to create-profiles-table.sql"
          );
        } catch (err) {
          console.error("❌ Error creating profiles table SQL:", err);
        }
      } else {
        console.error("❌ Error checking profiles table:", error);
      }
    } else {
      console.log("✅ Profiles table exists");

      if (data.length > 0) {
        console.log("✅ Sample profile:", data[0]);
      } else {
        console.log("ℹ️ No profiles found in table");
      }
    }
  } catch (err) {
    console.error("❌ Error checking profiles table:", err);
  }

  // Step 2: Check for the auth.users triggers that create profiles
  console.log("\nStep 2: Checking for auth triggers...");
  try {
    // We cannot directly query for triggers, but we can try to create one and see what happens
    console.log("Checking if profile creation trigger exists...");

    // Generate SQL for the trigger
    const createTriggerSQL = `
    -- This function is called when a new user is created
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, name, created_at)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NOW()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Drop the trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Create the trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    // Write SQL to a file
    fs.writeFileSync("create-user-trigger.sql", createTriggerSQL);
    console.log("✓ Wrote trigger SQL to create-user-trigger.sql");
    console.log(
      "❕ You need to run this SQL script from the Supabase dashboard SQL editor"
    );
  } catch (err) {
    console.error("❌ Error checking auth triggers:", err);
  }

  // Step 3: Test user creation
  console.log("\nStep 3: Testing user creation...");
  const testEmail = `test_${Date.now()}@example.com`;

  try {
    console.log(`Creating test user with email ${testEmail}...`);
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: "Test1234!",
        email_confirm: true,
        user_metadata: {
          name: "Test User",
        },
      });

    if (userError) {
      console.error("❌ Error creating test user:", userError);
    } else {
      console.log("✅ Test user created successfully:", userData.user.id);

      // Check for profile
      console.log("Checking if profile was created automatically...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        console.error(
          "❌ Profile was not created automatically:",
          profileError
        );
        console.log("Creating profile manually...");

        const { error: insertError } = await supabase.from("profiles").insert({
          id: userData.user.id,
          email: testEmail,
          name: "Test User",
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("❌ Error creating profile manually:", insertError);
        } else {
          console.log("✅ Profile created manually");
        }
      } else {
        console.log("✅ Profile was created automatically:", profileData);
      }

      // Clean up the test user
      console.log("Cleaning up test user...");
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        userData.user.id
      );

      if (deleteError) {
        console.error("❌ Error deleting test user:", deleteError);
      } else {
        console.log("✅ Test user deleted successfully");
      }
    }
  } catch (err) {
    console.error("❌ Error in user creation test:", err);
  }

  console.log("\nSummary of actions:");
  console.log("1. We've checked if the profiles table exists");
  console.log(
    "2. Generated SQL scripts for creating the profiles table if needed"
  );
  console.log("3. Generated SQL for creating a user creation trigger");
  console.log("4. Tested user creation and profile generation");
  console.log("\nNext steps:");
  console.log(
    "1. If the profiles table doesn't exist, run the SQL in create-profiles-table.sql"
  );
  console.log(
    "2. Run the trigger SQL in create-user-trigger.sql to ensure profiles are created automatically"
  );
  console.log(
    "3. Update your client code to handle potential signup errors better"
  );
}

fixDatabaseSchema().catch(console.error);
