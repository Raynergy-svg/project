#!/usr/bin/env node

/**
 * Start Next.js development server with HTTP (no SSL)
 * This script ensures we use HTTP instead of HTTPS to avoid SSL errors
 */

import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

// ES modules equivalent of __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("Starting Next.js dev server with HTTP...");

// Force HTTP mode
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Spawn Next.js dev server with proper arguments
const nextDev = spawn("npx", ["next", "dev", "--port", "3000"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_WEBPACK_USEPOLLING: "true", // Helps with file watching
    NEXT_TELEMETRY_DISABLED: "1", // Disable telemetry
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
