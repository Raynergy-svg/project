/**
 * Supabase Connection Diagnostic Script
 *
 * This script tests various Supabase operations to diagnose
 * authentication and permission issues.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log("🔍 Supabase Diagnostic Tool");
console.log("========================================");
console.log("Supabase URL:", supabaseUrl || "Not set");
console.log("Anon Key Available:", !!supabaseAnonKey);
console.log("Service Key Available:", !!supabaseServiceKey);
console.log("========================================\n");

// Create clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostics() {
  console.log("Starting Diagnostics...\n");

  // Test 1: Check if we can get a session (basic operation)
  console.log("Test 1: Basic Session Check (Anon Client)");
  try {
    const { data: sessionData, error: sessionError } =
      await anonClient.auth.getSession();
    if (sessionError) {
      console.log("❌ Session Check Failed:", sessionError.message);
    } else {
      console.log("✅ Session Check Passed");
      console.log("   Session:", sessionData.session ? "Active" : "None");
    }
  } catch (e) {
    console.log("❌ Session Check Exception:", e.message);
  }
  console.log("");

  // Test 2: Try to access the profiles table with anon client (should fail if not authenticated)
  console.log("Test 2: Database Access Check (Anon Client)");
  try {
    const { data: profilesData, error: profilesError } = await anonClient
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (profilesError) {
      // Expected to fail due to RLS, but let's check the error type
      if (profilesError.code === "PGRST301") {
        console.log("✅ Expected RLS restriction (not authenticated)");
      } else if (
        profilesError.code.includes("42P01") ||
        profilesError.message.includes('relation "profiles" does not exist')
      ) {
        console.log("❌ Table 'profiles' does not exist");
      } else {
        console.log(
          "❌ Unexpected Error:",
          profilesError.message,
          "Code:",
          profilesError.code
        );
      }
    } else {
      console.log(
        "⚠️ Unexpected success - profiles table accessible without auth"
      );
      console.log("   This might indicate RLS is not properly configured");
    }
  } catch (e) {
    console.log("❌ Database Access Exception:", e.message);
  }
  console.log("");

  // Test 3: Check if service role client can access auth API
  console.log("Test 3: Auth API Access (Service Client)");
  try {
    const { data: userList, error: userListError } =
      await serviceClient.auth.admin.listUsers();

    if (userListError) {
      // Check if this is a method not found error (older Supabase client)
      if (
        userListError.message &&
        userListError.message.includes("not a function")
      ) {
        console.log("⚠️ Admin API not available in this client version");

        // Alternative test using auth.getUser()
        const { data: userData, error: userError } =
          await serviceClient.auth.getUser();
        if (userError) {
          console.log("❌ Alternative Auth Check Failed:", userError.message);
        } else {
          console.log("✅ Alternative Auth Check Passed");
        }
      } else {
        console.log("❌ User List Failed:", userListError.message);
        if (
          userListError.message.includes("invalid") ||
          userListError.message.includes("JWT")
        ) {
          console.log("   This suggests the service role key is invalid");
        } else if (userListError.message.includes("permission")) {
          console.log(
            "   This suggests missing permissions for the service role"
          );
        }
      }
    } else {
      console.log("✅ Successfully accessed user list");
      console.log(
        `   Found ${userList?.users?.length || 0} users in the database`
      );
    }
  } catch (e) {
    console.log("❌ Auth API Exception:", e.message);

    // Check specifically for admin method missing
    if (e.message.includes("admin") && e.message.includes("undefined")) {
      console.log(
        "   The admin API is not available in your Supabase JS client version"
      );
      console.log(
        "   Consider updating to the latest @supabase/supabase-js version"
      );
    }
  }
  console.log("");

  // Test 4: Service role access to the database
  console.log("Test 4: Database Access (Service Client)");
  try {
    // First check if the profiles table exists
    const { data: tableData, error: tableError } = await serviceClient
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "profiles");

    if (tableError) {
      console.log("❌ Schema Query Failed:", tableError.message);
      if (tableError.message.includes("permission denied")) {
        console.log("   Service role doesn't have permission to query schema");
      }
    } else {
      const profilesTableExists = tableData && tableData.length > 0;
      console.log(
        profilesTableExists
          ? "✅ Found 'profiles' table in the database"
          : "❌ Could not find 'profiles' table in the database"
      );

      // If profiles exists, try to query it
      if (profilesTableExists) {
        const { data: profilesData, error: profilesError } = await serviceClient
          .from("profiles")
          .select("count", { count: "exact", head: true });

        if (profilesError) {
          console.log("❌ Profiles Query Failed:", profilesError.message);
        } else {
          console.log("✅ Successfully queried profiles table");
        }
      }
    }
  } catch (e) {
    console.log("❌ Database Access Exception:", e.message);
  }
  console.log("");

  // Test 5: Try a simple SQL query using service role (if available)
  console.log("Test 5: Direct SQL Query (Service Client)");
  try {
    const { data: sqlData, error: sqlError } = await serviceClient.rpc(
      "version"
    );

    if (sqlError) {
      console.log("❌ SQL Query Failed:", sqlError.message);

      if (
        sqlError.message.includes("function") &&
        sqlError.message.includes("does not exist")
      ) {
        // Try another simple query
        try {
          const { data: currentData, error: currentError } =
            await serviceClient.rpc("current_database");

          if (currentError) {
            console.log(
              "❌ Alternative SQL Query Failed:",
              currentError.message
            );
          } else {
            console.log("✅ Alternative SQL Query Succeeded:", currentData);
          }
        } catch (altErr) {
          console.log("❌ Alternative SQL Exception:", altErr.message);
        }
      }
    } else {
      console.log("✅ SQL Query Succeeded:", sqlData);
    }
  } catch (e) {
    console.log("❌ SQL Query Exception:", e.message);
  }
  console.log("");

  console.log("Diagnostics Complete!");
  console.log("========================================");

  // Provide summary of findings
  console.log("\n📊 Summary of Findings:");
  console.log(
    "1. Check your .env file to ensure SUPABASE_SERVICE_ROLE_KEY is correct"
  );
  console.log(
    "2. If using an older version of @supabase/supabase-js, the admin API might not be available"
  );
  console.log("3. Make sure the 'profiles' table exists in your database");
  console.log(
    "4. Double-check if you have proper permissions set up for the service role"
  );
  console.log(
    "\nFor more detailed help, visit the Supabase docs: https://supabase.com/docs/reference/javascript/auth-admin"
  );
}

runDiagnostics();
