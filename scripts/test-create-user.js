/**
 * Test Script for Creating a Supabase User
 *
 * This script attempts to create a user with a standard email format
 * to isolate and diagnose the email validation issue.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config();

// Get credentials from environment
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://gnwdahoiauduyncppbdb.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Missing Supabase credentials in environment variables");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test with different email formats to identify what's accepted
const testEmails = [
  "user123@example.com", // Standard format
  "user.name@example.com", // With dot separator
  "user+test@example.com", // With plus sign (used for email filtering)
  "user@subdomain.example.com", // With subdomain
  "jane.doe@company-name.com", // With hyphen in domain
  "support@project-name.app", // With modern TLD
];

async function testUserCreation() {
  console.log("🧪 Testing Supabase User Creation");
  console.log("----------------------------------\n");

  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Anon Key Available: ${!!supabaseAnonKey}`);
  console.log("\n");

  // Test each email format
  for (const email of testEmails) {
    console.log(`Testing email: ${email}`);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: "TestPassword123!",
        options: {
          data: {
            name: "Test User",
          },
        },
      });

      if (error) {
        console.log(`❌ Failed: ${error.message}`);
        if (error.details) {
          console.log(`   Details: ${error.details}`);
        }
      } else {
        console.log("✅ Success!");
        console.log(`   User ID: ${data.user?.id}`);
        console.log(
          `   Confirmation Status: ${
            data.user?.confirmation_sent_at ? "Email sent" : "No email sent"
          }`
        );
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }

    console.log("\n");
  }

  // Check if Auth is enabled
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log("Auth Service Status:");
    if (error) {
      console.log(`❌ Error: ${error.message}`);
    } else {
      console.log("✅ Auth service is accessible");
    }
  } catch (err) {
    console.log(`❌ Error accessing auth service: ${err.message}`);
  }

  // Check if database is accessible
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count", { head: true });
    console.log("\nDatabase Status:");
    if (error) {
      if (error.code === "PGRST301") {
        console.log(
          "⚠️ Database is accessible but RLS is preventing access (expected if not authenticated)"
        );
      } else if (error.message.includes('relation "profiles" does not exist')) {
        console.log(
          "❌ The 'profiles' table does not exist - migrations may not have been applied"
        );
      } else {
        console.log(`❌ Database error: ${error.message}`);
      }
    } else {
      console.log("✅ Database and 'profiles' table are accessible");
    }
  } catch (err) {
    console.log(`❌ Error accessing database: ${err.message}`);
  }

  console.log("\n----------------------------------");
  console.log("🧪 Testing Completed");
}

testUserCreation();
