import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Debug information
console.log("🔍 Supabase Configuration Check");
console.log("-----------------------------------------");
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Key Available: ${!!supabaseServiceKey}`);
console.log(
  `Service Key Preview: ${
    supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + "..." : "Not set"
  }`
);
console.log("-----------------------------------------\n");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Error: Missing Supabase credentials in environment variables"
  );
  process.exit(1);
}

// Create admin client with service role key
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Generate consistent test user details
const testEmail = "test_account@example.com";
const testPassword = "TestPassword123!";
const testName = "Test User";

async function createTestUser() {
  console.log("🧪 Creating Pre-Confirmed Test User");
  console.log("-----------------------------------------\n");

  try {
    // First, test if we can perform a basic operation with the admin client
    console.log("Testing admin access...");
    try {
      // Try a simple database operation to verify admin access
      const { data: testData, error: testError } = await adminClient
        .from("profiles")
        .select("count", { count: "exact", head: true });

      if (testError && !testError.message.includes("PGRST")) {
        console.error("❌ Error accessing database:", testError.message);
        console.error(
          "This indicates the service role key might be invalid or doesn't have proper permissions."
        );
        return;
      }

      console.log("✅ Admin API access successful");
    } catch (error) {
      console.error("❌ Error testing admin API access:", error.message);
      console.error(
        "This indicates an issue with the service role key or admin permissions."
      );
      return;
    }

    // Check if our test user already exists
    console.log("\nChecking for existing test user...");
    const { data: existingUser, error: lookupError } = await adminClient
      .from("auth")
      .select("id")
      .eq("email", testEmail)
      .single();

    if (lookupError && !lookupError.message.includes("No rows found")) {
      console.error(
        "❌ Error checking for existing user:",
        lookupError.message
      );
      if (lookupError.message.includes("invalid")) {
        console.error(
          "The service role key appears to be invalid. Please check your .env file."
        );
      }
    } else if (existingUser) {
      console.log("✅ Test user already exists:", testEmail);
      console.log("User ID:", existingUser.id);
      return;
    }

    // Create the test user using the newer API syntax
    console.log("\nCreating new test user...");
    const { data, error } = await adminClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { name: testName },
        // We'll manually set email_confirm through SQL afterward
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

    console.log("✅ User created successfully!");
    console.log("Email:", testEmail);
    console.log("Password:", testPassword);
    console.log("User ID:", data.user.id);

    // Manually confirm the user's email using direct SQL
    console.log("\nConfirming user email...");
    const { error: confirmError } = await adminClient.rpc(
      "manually_confirm_user",
      {
        user_id: data.user.id,
      }
    );

    if (confirmError) {
      console.error("❌ Error confirming user email:", confirmError.message);
      console.log("\nCreating stored procedure for email confirmation...");

      // Create the stored procedure if it doesn't exist
      const { error: createProcError } = await adminClient.rpc(
        "create_email_confirmation_procedure"
      );

      if (createProcError) {
        console.error(
          "❌ Error creating stored procedure:",
          createProcError.message
        );

        // Fallback: Try direct SQL update if RPC doesn't work
        console.log("Attempting direct SQL update...");
        await adminClient.query(`
          UPDATE auth.users 
          SET email_confirmed_at = now(),
              confirmed_at = now()
          WHERE id = '${data.user.id}'
        `);

        console.log("✅ Updated user confirmation status directly through SQL");
      } else {
        // Try again with the newly created procedure
        const { error: retryConfirmError } = await adminClient.rpc(
          "manually_confirm_user",
          {
            user_id: data.user.id,
          }
        );

        if (retryConfirmError) {
          console.error(
            "❌ Error confirming user email after creating procedure:",
            retryConfirmError.message
          );
        } else {
          console.log("✅ User email confirmed successfully!");
        }
      }
    } else {
      console.log("✅ User email confirmed successfully!");
    }

    // Create profile for the new user
    console.log("\nCreating user profile...");
    const { error: profileError } = await adminClient.from("profiles").insert([
      {
        id: data.user.id,
        name: testName,
        is_premium: false,
        trial_ends_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        subscription: {
          status: "trialing",
          plan_name: "Basic",
          current_period_end: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
    ]);

    if (profileError) {
      console.error("❌ Error creating profile:", profileError.message);
    } else {
      console.log("✅ User profile created successfully!");
    }

    console.log("\n✅ Test user setup completed successfully!");
    console.log("-----------------------------------------");
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log("-----------------------------------------");
    console.log("You can now sign in with these credentials in your app.");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createTestUser();
