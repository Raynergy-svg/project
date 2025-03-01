#!/usr/bin/env node

// This is a simple wrapper script to start the server
// It handles the TypeScript compilation and module resolution issues
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

console.log("Starting server with tsx...");

// Use tsx to run the TypeScript file directly
const server = spawn("npx", ["tsx", "src/server/index.ts"], {
  stdio: "inherit",
  shell: true,
});

server.on("close", (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle termination signals
process.on("SIGINT", () => {
  console.log("Stopping server...");
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("Stopping server...");
  server.kill("SIGTERM");
});
