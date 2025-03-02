/**
 * Clean Debug Files Script
 *
 * This script is used before production builds to remove debug files and components
 * that should not be included in production.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug files that should not be included in production builds
const DEBUG_FILES = [
  "debug.html",
  "test.html",
  "src/debug.tsx",
  "src/index.html",
  "src/DebugApp.tsx",
];

// Debug directories that should not be included in production builds
const DEBUG_DIRECTORIES = ["src/components/debug"];

// Create a backup directory
const BACKUP_DIR = path.join(__dirname, "../.debug-backup");
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Function to back up and "disable" a file for production build
const disableFile = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  if (!fileExists(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const backupPath = path.join(BACKUP_DIR, filePath);
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Copy the file to backup
  fs.copyFileSync(fullPath, backupPath);
  console.log(`Backed up: ${filePath}`);

  // Replace with a dummy production-safe version
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    fs.writeFileSync(
      fullPath,
      "// This file is excluded from production builds\nexport {};\n"
    );
  } else if (filePath.endsWith(".html")) {
    fs.writeFileSync(
      fullPath,
      "<!-- This file is excluded from production builds -->\n"
    );
  }
  console.log(`Disabled: ${filePath}`);
};

// Function to back up and "disable" a directory for production build
const disableDirectory = (dirPath) => {
  const fullPath = path.join(__dirname, "..", dirPath);
  if (!fileExists(fullPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }

  // Create a .productionignore file in the directory
  fs.writeFileSync(
    path.join(fullPath, ".productionignore"),
    "# This directory is excluded from production builds\n"
  );
  console.log(`Marked directory as ignored: ${dirPath}`);

  // Create index files that export nothing
  fs.writeFileSync(
    path.join(fullPath, "index.ts"),
    "// This directory is excluded from production builds\nexport {};\n"
  );
  console.log(`Created empty exports for: ${dirPath}`);
};

// Disable all debug files and directories
console.log("Disabling debug files for production build...");
DEBUG_FILES.forEach(disableFile);
DEBUG_DIRECTORIES.forEach(disableDirectory);

// Check if there are any imports of debug components still in the codebase
try {
  console.log("\nChecking for any remaining debug imports...");
  const grepResult = execSync(
    'grep -r "debug/" --include="*.tsx" --include="*.ts" --exclude-dir="node_modules" src/'
  ).toString();
  if (grepResult.trim()) {
    console.warn(
      "\nWARNING: The following files still import debug components:"
    );
    console.warn(grepResult);
    console.warn(
      "Please update these files to conditionally import debug components only in development mode."
    );
  } else {
    console.log("No debug imports found. All clear!");
  }
} catch (err) {
  // grep returns non-zero exit code if no matches are found, which is actually good in this case
  console.log("No debug imports found. All clear!");
}

console.log("\nDebug files have been disabled for production build.");
console.log(
  "After the build, run `npm run restore-debug` to restore the debug files for development."
);

// Add restore functionality to package.json if it doesn't exist yet
const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
if (!packageJson.scripts["restore-debug"]) {
  packageJson.scripts["restore-debug"] = "node scripts/restore-debug.js";
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );
  console.log("Added restore-debug script to package.json");

  // Create the restore script as an ESM module
  const restoreScriptPath = path.join(__dirname, "restore-debug.js");
  fs.writeFileSync(
    restoreScriptPath,
    `/**
 * Restore Debug Files Script
 * 
 * This script restores debug files that were disabled before a production build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../.debug-backup');
if (!fs.existsSync(BACKUP_DIR)) {
  console.log('No backup directory found. Nothing to restore.');
  process.exit(0);
}

// Function to restore a file from backup
const restoreFile = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  const backupPath = path.join(BACKUP_DIR, filePath);
  
  if (!fs.existsSync(backupPath)) {
    console.log(\`No backup found for: \${filePath}\`);
    return;
  }
  
  fs.copyFileSync(backupPath, fullPath);
  console.log(\`Restored: \${filePath}\`);
};

// Function to restore a directory
const restoreDirectory = (dirPath) => {
  const fullPath = path.join(__dirname, '..', dirPath);
  
  // Remove the .productionignore file
  const ignoreFile = path.join(fullPath, '.productionignore');
  if (fs.existsSync(ignoreFile)) {
    fs.unlinkSync(ignoreFile);
    console.log(\`Removed .productionignore from: \${dirPath}\`);
  }
  
  // Remove the empty index file
  const indexFile = path.join(fullPath, 'index.ts');
  if (fs.existsSync(indexFile)) {
    // Only remove if it's our placeholder
    const content = fs.readFileSync(indexFile, 'utf8');
    if (content.includes('excluded from production builds')) {
      fs.unlinkSync(indexFile);
      console.log(\`Removed placeholder index.ts from: \${dirPath}\`);
    }
  }
};

// Restore all files and directories in the backup
console.log('Restoring debug files...');

// Walk through the backup directory and restore all files
const walkAndRestore = (dir, basePath = '') => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullBackupPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      walkAndRestore(fullBackupPath, relativePath);
    } else {
      const targetPath = path.join(__dirname, '..', relativePath);
      const targetDir = path.dirname(targetPath);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(fullBackupPath, targetPath);
      console.log(\`Restored: \${relativePath}\`);
    }
  }
};

if (fs.existsSync(BACKUP_DIR)) {
  walkAndRestore(BACKUP_DIR);
  
  // Restore directory settings for debug directories
  const dirs = ${JSON.stringify(DEBUG_DIRECTORIES)};
  dirs.forEach(restoreDirectory);
  
  console.log('Debug files have been restored.');
}
`
  );
  console.log("Created restore-debug.js script");
}
