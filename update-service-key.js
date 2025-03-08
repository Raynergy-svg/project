import fs from "fs";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptForKey() {
  return new Promise((resolve) => {
    console.log("");
    console.log("===== Supabase Service Role Key Update =====");
    console.log("");
    console.log(
      "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
    );
    console.log(
      '2. Open your project and navigate to "Project Settings" > "API"'
    );
    console.log(
      '3. Find and copy the "service_role key" (NOT the anon/public key)'
    );
    console.log("");

    rl.question("Paste your Supabase service role key here: ", (key) => {
      if (!key || !key.startsWith("eyJ")) {
        console.log('Invalid key format. The key should start with "eyJ"');
        promptForKey().then(resolve);
      } else {
        resolve(key.trim());
      }
    });
  });
}

function updateEnvFile(filePath, serviceKey) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Update SUPABASE_SERVICE_ROLE_KEY
    content = content.replace(
      /^SUPABASE_SERVICE_ROLE_KEY=.*/m,
      `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`
    );

    // Update VITE_SUPABASE_SERVICE_ROLE_KEY
    content = content.replace(
      /^VITE_SUPABASE_SERVICE_ROLE_KEY=.*/m,
      `VITE_SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`
    );

    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  const serviceKey = await promptForKey();

  console.log("\nUpdating environment files...");

  const envPath = path.resolve(process.cwd(), ".env");
  const envLocalPath = path.resolve(process.cwd(), ".env.local");

  let envUpdated = updateEnvFile(envPath, serviceKey);

  // Check if .env.local exists, if not create it with the service key
  if (!fs.existsSync(envLocalPath)) {
    try {
      fs.writeFileSync(
        envLocalPath,
        `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}\nVITE_SUPABASE_SERVICE_ROLE_KEY=${serviceKey}\n`,
        "utf8"
      );
      console.log(`.env.local created with service role key`);
    } catch (error) {
      console.error(`Error creating .env.local:`, error.message);
    }
  } else {
    let envLocalUpdated = updateEnvFile(envLocalPath, serviceKey);

    // If no SUPABASE_SERVICE_ROLE_KEY in .env.local, add it
    if (envLocalUpdated) {
      const envLocalContent = fs.readFileSync(envLocalPath, "utf8");
      if (!envLocalContent.includes("SUPABASE_SERVICE_ROLE_KEY=")) {
        try {
          fs.appendFileSync(
            envLocalPath,
            `\nSUPABASE_SERVICE_ROLE_KEY=${serviceKey}\nVITE_SUPABASE_SERVICE_ROLE_KEY=${serviceKey}\n`,
            "utf8"
          );
          console.log(`Added service role keys to .env.local`);
        } catch (error) {
          console.error(`Error appending to .env.local:`, error.message);
        }
      }
    }
  }

  console.log(
    "\nUpdate complete! You can now run the check-supabase-creds.js script again to verify the connection."
  );
  rl.close();
}

main().catch(console.error);
