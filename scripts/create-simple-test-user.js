/**
 * Create a Supabase Test User (Simple Version)
 *
 * This script creates a test user without requiring service role permissions.
 * After running this script, you'll need to manually confirm the user's email
 * in the Supabase dashboard.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

// Get credentials from environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Missing Supabase credentials in environment variables");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate test user details with a timestamp to avoid conflicts
const timestamp = Date.now();
const testEmail = `jane.doe${timestamp}@company-name.com`;
const testPassword = "TestPassword123!";
const testName = "Test User";

async function createTestUser() {
  console.log("🧪 Creating Test User");
  console.log("-----------------------------------------");
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Password: ${testPassword}`);
  console.log("-----------------------------------------\n");

  try {
    // Create user with sign up
    console.log("Signing up test user...");
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
        },
      },
    });

    if (error) {
      console.error("❌ Error creating test user:", error.message);
      if (error.details) {
        console.error("Error details:", error.details);
      }
      return;
    }

    if (!data.user) {
      console.error("❌ User creation returned no user object");
      return;
    }

    // Success!
    console.log("✅ Test user created successfully!");
    console.log(`User ID: ${data.user.id}`);
    console.log(
      `Email confirmation sent: ${
        data.user.confirmation_sent_at ? "Yes" : "No"
      }`
    );

    // Check if profile was created via trigger
    try {
      // Sign in to check if we can access the profiles table
      console.log("\nAttempting to sign in...");
      // This will likely fail since email is not confirmed, but we try anyway
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          console.log("⚠️ Expected error: Email not confirmed");
        } else {
          console.log("❌ Sign in error:", signInError.message);
        }
      } else {
        console.log("✅ Signed in successfully!");

        // Check for profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.log("❌ Error checking profile:", profileError.message);
        } else if (profileData) {
          console.log("✅ Profile was created automatically!");
          console.log("Profile data:", profileData);
        } else {
          console.log("⚠️ No profile found for this user");
        }

        // Sign out
        await supabase.auth.signOut();
        console.log("Signed out");
      }
    } catch (err) {
      console.error("Error during profile check:", err);
    }

    console.log("\n-----------------------------------------");
    console.log("🔹 MANUAL STEPS NEEDED 🔹");
    console.log("-----------------------------------------");
    console.log(
      "To use this test user, you need to confirm the email manually:"
    );
    console.log("1. Go to your Supabase dashboard: https://app.supabase.com");
    console.log("2. Open your project and navigate to Authentication > Users");
    console.log(`3. Find the user with email: ${testEmail}`);
    console.log("4. Click the three dots (...) and select 'Confirm email'");
    console.log("5. Once confirmed, you can use these credentials to sign in:");
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createTestUser();
