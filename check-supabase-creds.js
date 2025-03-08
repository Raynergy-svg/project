import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load environment variables from a file
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

// Main function
async function checkSupabaseCreds() {
  console.log("Loading environment variables...");

  // Load environment variables from .env and .env.local
  const envPath = path.resolve(process.cwd(), ".env");
  const envLocalPath = path.resolve(process.cwd(), ".env.local");

  loadEnvFile(envPath);
  loadEnvFile(envLocalPath);

  // Check if Supabase credentials are set
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_ANON_KEY;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SERVICE_ROLE_KEY;

  console.log("\nSupabase Credentials Status:");
  console.log(`URL: ${supabaseUrl ? "✓ Set" : "✗ Not Set"}`);
  console.log(`Anon Key: ${supabaseAnonKey ? "✓ Set" : "✗ Not Set"}`);
  console.log(`Service Key: ${supabaseServiceKey ? "✓ Set" : "✗ Not Set"}`);

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.log("\n❌ Error: Missing Supabase credentials!");
    console.log(
      "Please check your .env and .env.local files and make sure they contain:"
    );
    console.log("SUPABASE_URL=your-project-id.supabase.co");
    console.log("SUPABASE_ANON_KEY=your-anon-key");
    console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
    console.log("(Or the equivalent with VITE_ or NEXT_PUBLIC_ prefixes)");
    return;
  }

  console.log("\nTesting Supabase Connection...");

  // Test public client connection
  console.log("\n1. Testing Public/Anon Client:");
  try {
    const publicClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: publicData, error: publicError } = await publicClient
      .from("profiles")
      .select("id")
      .limit(1);

    if (publicError && publicError.code === "42P01") {
      console.log(
        "⚠️ The profiles table does not exist, but the connection was successful"
      );
    } else if (publicError) {
      console.log(
        `❌ Anon client error: ${publicError.message || publicError}`
      );
    } else {
      console.log("✅ Anon client connection successful");
    }
  } catch (error) {
    console.log(`❌ Anon client error: ${error.message}`);
  }

  // Test service role client connection
  console.log("\n2. Testing Service Role Client:");
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: serviceData, error: serviceError } = await serviceClient
      .from("profiles")
      .select("id")
      .limit(1);

    if (serviceError && serviceError.code === "42P01") {
      console.log(
        "⚠️ The profiles table does not exist, but the connection was successful"
      );
    } else if (
      serviceError &&
      serviceError.message &&
      serviceError.message.includes("invalid API key")
    ) {
      console.log(`❌ Service client error: Invalid API key`);
      console.log(
        "\n⚠️ SERVICE KEY ERROR: Your service role key appears to be invalid."
      );
      console.log(
        "   Check that you have the correct key in your .env/.env.local files."
      );
      console.log(
        '   This key starts with "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc..." and is longer than the anon key.'
      );
    } else if (serviceError) {
      console.log(
        `❌ Service client error: ${serviceError.message || serviceError}`
      );
    } else {
      console.log("✅ Service role client connection successful");
    }

    // Try accessing profiles table
    const { data: profilesData, error: profilesError } = await serviceClient
      .from("profiles")
      .select("id")
      .limit(1);

    if (profilesError) {
      console.log(
        `❌ Profiles table query error: ${
          profilesError.message || profilesError
        }`
      );
    } else {
      console.log(
        `✅ Profiles table query successful: ${
          profilesData ? profilesData.length : 0
        } records found`
      );
    }
  } catch (error) {
    console.log(`❌ Service client error: ${error.message}`);
  }

  console.log("\nSummary of environment variables that should be set:");
  console.log("In .env.local:");
  console.log(`VITE_SUPABASE_URL=${supabaseUrl}`);
  console.log(`VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`);
  console.log(
    "VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  );
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  );
}

checkSupabaseCreds().catch(console.error);
