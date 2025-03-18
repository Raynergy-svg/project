#!/usr/bin/env node

/**
 * Clean development environment and start Next.js
 * This script ensures we're using a clean Next.js environment
 */

import { spawn, execSync } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ES modules equivalent of __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

console.log("🧹 Cleaning development environment...");

// Stop any running processes on port 3000
try {
  console.log("Stopping any processes on port 3000...");

  if (process.platform === "win32") {
    execSync(
      "FOR /F \"tokens=5\" %P IN ('netstat -ano ^| findstr :3000') DO taskkill /F /PID %P",
      { stdio: "ignore" }
    );
  } else {
    execSync("lsof -i:3000 -t | xargs kill -9 || true", { stdio: "ignore" });
  }
} catch (error) {
  // Ignore errors if no process was found
}

// Clean Next.js cache
try {
  console.log("Cleaning Next.js cache...");

  // Delete the .next directory
  if (fs.existsSync(`${projectRoot}/.next`)) {
    execSync(`rm -rf ${projectRoot}/.next`, { stdio: "inherit" });
  }
} catch (error) {
  console.error("Error cleaning Next.js cache:", error);
}

console.log("🚀 Starting Next.js development server...");

// Start Next.js in development mode
const nextDev = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  cwd: projectRoot,
  env: {
    ...process.env,
    // Force using HTTP
    HTTPS: "false",
    // Disable TSL/SSL verification
    NODE_TLS_REJECT_UNAUTHORIZED: "0",
    // Disable HTTPS
    NEXT_SKIP_INITIAL_SETUP: "1",
    // Improve file watching
    NEXT_WEBPACK_USEPOLLING: "true",
    // Disable telemetry
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

// Handle process exit
nextDev.on("close", (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
  process.exit(code);
});

// Handle signals
process.on("SIGINT", () => {
  console.log("Received SIGINT. Shutting down Next.js dev server...");
  nextDev.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Shutting down Next.js dev server...");
  nextDev.kill("SIGTERM");
});
