/**
 * Environment Variables Check Script
 *
 * This script verifies that all necessary environment variables are set for
 * the Supabase authentication system to work properly.
 */

import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Load existing environment variables
config();

const requiredVars = [
  {
    name: "SUPABASE_URL",
    fallback: "VITE_SUPABASE_URL",
    defaultValue: "https://gnwdahoiauduyncppbdb.supabase.co",
    description: "URL for your Supabase project",
  },
  {
    name: "SUPABASE_ANON_KEY",
    fallback: "VITE_SUPABASE_ANON_KEY",
    description: "Anonymous API key for client-side requests",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    fallback: "VITE_SUPABASE_SERVICE_ROLE_KEY",
    description:
      "Service role key for admin operations (needed for test user creation)",
  },
];

console.log("🔍 Environment Variables Check");
console.log("------------------------------------------");

let allVariablesPresent = true;
let dotenvUpdated = false;
let dotenvPath = path.resolve(process.cwd(), ".env");
let dotenvContent = "";

// Read .env file if it exists
if (fs.existsSync(dotenvPath)) {
  dotenvContent = fs.readFileSync(dotenvPath, "utf8");
} else {
  console.log("⚠️ No .env file found. Creating a new one.");
  dotenvContent = "# Supabase Environment Variables\n\n";
}

// Check required variables
for (const variable of requiredVars) {
  let valueFound = process.env[variable.name] || process.env[variable.fallback];

  console.log(`${variable.name}:`);

  if (valueFound) {
    const maskedValue =
      valueFound.substring(0, 7) +
      "..." +
      (valueFound.length > 15
        ? valueFound.substring(valueFound.length - 3)
        : "");
    console.log(`  ✅ Set: ${maskedValue}`);
  } else {
    console.log(`  ❌ Not set`);
    console.log(`  - Description: ${variable.description}`);

    if (variable.defaultValue) {
      console.log(`  - Using default: ${variable.defaultValue}`);

      // Add to .env if not already there
      if (!dotenvContent.includes(variable.name)) {
        dotenvContent += `${variable.name}=${variable.defaultValue}\n`;
        dotenvUpdated = true;
      }
    } else {
      console.log(`  - No default available. You must set this manually.`);

      // Add a placeholder to .env if not already there
      if (!dotenvContent.includes(variable.name)) {
        dotenvContent += `# ${variable.description}\n${variable.name}=\n`;
        dotenvUpdated = true;
      }

      allVariablesPresent = false;
    }
  }
  console.log("");
}

// Update .env file if needed
if (dotenvUpdated) {
  fs.writeFileSync(dotenvPath, dotenvContent);
  console.log(
    "📝 Updated .env file with missing variables. Please fill in the empty values."
  );
}

// Service role key special instructions
if (
  !process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
) {
  console.log("⚠️ SUPABASE_SERVICE_ROLE_KEY is not set.");
  console.log("To obtain your service role key:");
  console.log("1. Go to your Supabase project dashboard");
  console.log("2. Navigate to Project Settings > API");
  console.log('3. Find and copy the "service_role key"');
  console.log(
    "4. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
  );
  console.log("\n⚠️ WARNING: The service role key has admin privileges.");
  console.log(
    "   It should NEVER be exposed to the client or included in public code."
  );
}

console.log("------------------------------------------");
if (allVariablesPresent) {
  console.log("✅ All required environment variables are set.");
} else {
  console.log("⚠️ Some required environment variables are missing.");
  console.log("   Please update your .env file with the missing values.");
}
