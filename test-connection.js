import { createClient } from "@supabase/supabase-js";

// Use the same URL and key from your application
const supabaseUrl = "https://gnwdahoiauduyncppbdb.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test various operations to identify where the issue is
async function runTests() {
  console.log("=== SUPABASE CONNECTION TEST ===");
  console.log(`URL: ${supabaseUrl}`);
  console.log(`API Key: ${supabaseAnonKey.substring(0, 10)}...`);

  try {
    // Test 1: Basic health check
    console.log("\n1. Testing basic connection...");
    const { data: healthData, error: healthError } = await supabase
      .from("_pgrst_reserved_reflection")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (healthError) {
      console.log("❌ Basic connection test failed:", healthError);
    } else {
      console.log("✅ Basic connection successful");
    }

    // Test 2: Try to directly access bank_accounts
    console.log("\n2. Testing bank_accounts table access...");
    const { data: accountsData, error: accountsError } = await supabase
      .from("bank_accounts")
      .select("id")
      .limit(1);

    if (accountsError) {
      console.log("❌ Bank accounts access failed:", accountsError);
    } else {
      console.log("✅ Bank accounts table is accessible");
      console.log("Data:", accountsData);
    }

    // Test 3: Try alternative method to check if table exists
    console.log("\n3. Testing SQL RPC to check table existence...");
    const { data: rpcData, error: rpcError } = await supabase
      .rpc("rpc_check_table_exists", { table_name: "bank_accounts" })
      .single();

    if (rpcError) {
      console.log(
        "❌ RPC call failed (this is expected if you haven't created this function):",
        rpcError
      );
    } else {
      console.log("✅ RPC call successful");
      console.log("Table exists:", rpcData);
    }

    // Test 4: Create test user (anonymous)
    console.log("\n4. Testing if we can insert data...");
    const testId = Math.random().toString(36).substring(7);
    const { data: insertData, error: insertError } = await supabase
      .from("bank_accounts")
      .insert({
        id: "00000000-0000-0000-0000-000000000000",
        user_id: "00000000-0000-0000-0000-000000000001",
        name: `Test Account ${testId}`,
        type: "checking",
        balance: 100.0,
        institution: "Test Bank",
      })
      .select();

    if (insertError) {
      console.log("❌ Data insertion failed:", insertError);
    } else {
      console.log("✅ Data insertion successful");
      console.log("Inserted data:", insertData);

      // Clean up the test data
      console.log("Cleaning up test data...");
      await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", "00000000-0000-0000-0000-000000000000");
    }
  } catch (err) {
    console.error("Unexpected error during tests:", err);
  }
}

runTests();
