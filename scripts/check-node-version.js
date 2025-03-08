#!/usr/bin/env node

/**
 * This script checks if the current Node.js version meets the requirements
 * specified in package.json.
 */

import { exec } from "child_process";
import { readFile } from "fs/promises";
import { join } from "path";
import semver from "semver";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function checkNodeVersion() {
  try {
    // Get the current Node.js version
    const currentVersion = process.version;

    // Read package.json to get required Node.js version
    const packageJsonPath = join(__dirname, "..", "package.json");
    const packageJsonContent = await readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    // Extract Node.js version requirement
    const requiredNodeVersion = packageJson.engines?.node || ">=18.20.3";

    console.log(
      `${colors.blue}Checking Node.js version compatibility...${colors.reset}`
    );
    console.log(
      `${colors.cyan}Current Node.js version:${colors.reset} ${currentVersion}`
    );
    console.log(
      `${colors.cyan}Required Node.js version:${colors.reset} ${requiredNodeVersion}`
    );

    // Check if current version satisfies the required version
    const isCompatible = semver.satisfies(currentVersion, requiredNodeVersion);

    if (isCompatible) {
      console.log(
        `\n${colors.green}${colors.bold}✓ Node.js version is compatible!${colors.reset}`
      );
    } else {
      console.error(
        `\n${colors.red}${colors.bold}✗ Node.js version is NOT compatible!${colors.reset}`
      );
      console.error(
        `\n${colors.yellow}When using Bolt.new, you're limited to the available Node.js version.${colors.reset}`
      );
      console.error(
        `\n${colors.yellow}If you're using Bolt.new, we recommend:${colors.reset}`
      );
      console.error(
        `1. Continue using Node.js v18.20.3 with older package versions`
      );
      console.error(
        `2. Try a different environment that supports Node.js v20+`
      );

      process.exit(1);
    }
  } catch (error) {
    console.error(
      `${colors.red}Error checking Node.js version:${colors.reset}`,
      error
    );
    process.exit(1);
  }
}

// Run the check
checkNodeVersion();
