#!/usr/bin/env node
/**
 * Setup Turbopack as the default bundler
 * 
 * This script configures Next.js to use Turbopack as the default bundler
 * by setting the necessary environment variables and ensuring the project
 * is properly configured.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.cyan}Setting up Turbopack as the default bundler${colors.reset}`);

// Ensure .env.local exists
const envPath = path.resolve(path.dirname(__dirname), '.env.local');
let envContent = '';

try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
} catch (error) {
  console.error(`${colors.red}Error reading .env.local: ${error.message}${colors.reset}`);
}

// Check if FORCE_TURBOPACK is already set
if (!envContent.includes('FORCE_TURBOPACK=1')) {
  console.log(`${colors.green}Adding FORCE_TURBOPACK=1 to .env.local${colors.reset}`);
  fs.appendFileSync(envPath, '\n# Force Turbopack usage\nFORCE_TURBOPACK=1\n');
}

// Set EXPERIMENTAL_TURBOPACK=1 if it doesn't exist
if (!envContent.includes('EXPERIMENTAL_TURBOPACK=1')) {
  console.log(`${colors.green}Adding EXPERIMENTAL_TURBOPACK=1 to .env.local${colors.reset}`);
  fs.appendFileSync(envPath, '\n# Enable experimental Turbopack features\nEXPERIMENTAL_TURBOPACK=1\n');
}

// Check if the current architecture can use Turbopack efficiently
try {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].slice(1), 10);
  
  if (major < 16) {
    console.warn(`${colors.yellow}Warning: Node.js version ${nodeVersion} detected. Turbopack works best with Node.js 16 or higher.${colors.reset}`);
  } else {
    console.log(`${colors.green}Node.js version ${nodeVersion} is compatible with Turbopack.${colors.reset}`);
  }
} catch (error) {
  console.warn(`${colors.yellow}Warning: Could not determine Node.js version.${colors.reset}`);
}

// Verify Next.js version compatibility
try {
  const packagePath = path.resolve(path.dirname(__dirname), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const nextVersion = packageJson.dependencies.next || '';
  
  if (nextVersion) {
    const versionNumber = nextVersion.replace(/[^0-9.]/g, '');
    const major = parseInt(versionNumber.split('.')[0], 10);
    
    if (major < 13) {
      console.warn(`${colors.yellow}Warning: Next.js version ${nextVersion} detected. Turbopack requires Next.js 13 or higher for optimal performance.${colors.reset}`);
    } else {
      console.log(`${colors.green}Next.js version ${nextVersion} is compatible with Turbopack.${colors.reset}`);
    }
  }
} catch (error) {
  console.warn(`${colors.yellow}Warning: Could not determine Next.js version: ${error.message}${colors.reset}`);
}

console.log(`${colors.bright}${colors.green}Turbopack setup complete!${colors.reset}`);
console.log(`
${colors.bright}Run your development server with:${colors.reset}
  ${colors.cyan}npm run dev${colors.reset}           # Uses Turbopack with standard configuration
  ${colors.cyan}npm run dev:force${colors.reset}     # Forces Turbopack usage with environment variables
  
${colors.bright}For production builds:${colors.reset}
  ${colors.cyan}npm run build${colors.reset}         # Standard Next.js build
  ${colors.cyan}npm run build:turbo${colors.reset}   # Experimental Turbopack production build
`);
