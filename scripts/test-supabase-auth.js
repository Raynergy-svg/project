/**
 * Test Script for Supabase Authentication
 *
 * This script tests the Supabase authentication flow to ensure sign-up and sign-in work correctly.
 * Run this script with: node scripts/test-supabase-auth.js
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

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

// Test email and password for authentication tests
// Using the email format that is confirmed to work with Supabase validation
const timestamp = Date.now();
const testEmail = `jane.doe${timestamp}@company-name.com`;
const testPassword = "TestPassword123!";
const testName = "Test User";

async function runTests() {
  console.log("🧪 Starting Supabase Authentication Tests");
  console.log("-----------------------------------------\n");

  console.log(`Test User: ${testEmail}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log("\n");

  try {
    // Test 1: Sign Up
    console.log("Test 1: Sign Up");
    console.log("--------------");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: testName,
          },
        },
      }
    );

    if (signUpError) {
      console.error("❌ Sign Up failed:", signUpError.message);
      // Print additional error details if available
      if (signUpError.details) {
        console.error("Error details:", signUpError.details);
      }
    } else {
      console.log("✅ Sign Up successful");
      console.log(`User ID: ${signUpData.user?.id}`);
      console.log(
        `Confirmation Status: ${
          signUpData.user?.confirmed_at ? "Confirmed" : "Not Confirmed"
        }`
      );
      console.log(
        `Email Confirmation Sent: ${
          signUpData.user?.confirmation_sent_at ? "Yes" : "No"
        }`
      );
    }
    console.log("\n");

    // Test 2: Sign In
    console.log("Test 2: Sign In");
    console.log("--------------");
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (signInError) {
      console.error("❌ Sign In failed:", signInError.message);
      // Print additional error details if available
      if (signInError.details) {
        console.error("Error details:", signInError.details);
      }
    } else {
      console.log("✅ Sign In successful");
      console.log(`User ID: ${signInData.user?.id}`);
      console.log(`Session: ${signInData.session ? "Created" : "Not Created"}`);
      console.log(
        `Access Token: ${
          signInData.session?.access_token ? "Generated" : "Not Generated"
        }`
      );
    }
    console.log("\n");

    // Test 3: Get User
    console.log("Test 3: Get User");
    console.log("--------------");
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Get User failed:", userError.message);
    } else {
      console.log("✅ Get User successful");
      console.log(`User ID: ${userData.user?.id}`);
      console.log(`Email: ${userData.user?.email}`);
      console.log(`User Metadata:`, userData.user?.user_metadata);
    }
    console.log("\n");

    // Test 4: Sign Out
    console.log("Test 4: Sign Out");
    console.log("--------------");
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("❌ Sign Out failed:", signOutError.message);
    } else {
      console.log("✅ Sign Out successful");
    }
    console.log("\n");

    // Test 5: Verify Signed Out
    console.log("Test 5: Verify Signed Out");
    console.log("-----------------------");
    const { data: verifyData, error: verifyError } =
      await supabase.auth.getUser();

    if (verifyError) {
      console.log(
        "❌ Get User after sign out returned an error:",
        verifyError.message
      );
    } else if (!verifyData.user) {
      console.log("✅ User is correctly signed out (no user data)");
    } else {
      console.log("❓ Unexpected: User data still exists after sign out");
      console.log(`User ID: ${verifyData.user?.id}`);
    }
    console.log("\n");

    // Test 6: Session Persistence
    console.log("Test 6: Session Persistence");
    console.log("-------------------------");
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("❌ Get Session error:", sessionError.message);
    } else if (!sessionData.session) {
      console.log("✅ No active session (as expected after sign out)");
    } else {
      console.log("❓ Unexpected: Session still exists after sign out");
    }

    console.log("\n-----------------------------------------");
    console.log("🧪 Supabase Authentication Tests Completed");
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

runTests();
