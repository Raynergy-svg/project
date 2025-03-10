#!/usr/bin/env node

/**
 * This script helps clean up Vite-related files after migrating to Next.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = path.resolve(process.cwd());
const backupDir = path.join(rootDir, ".old-vite-files");

// Make sure the backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// List of common Vite-related files
const viteFiles = [
  "vite.config.ts",
  "vite.config.js",
  "vitest.config.ts",
  "vitest.config.js",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "index.html",
  "src/vite-env.d.ts",
  "src/main.tsx",
  "src/main.jsx",
  "src/App.tsx",
  "src/App.jsx",
  "public/vite.svg",
];

// List of directories to remove
const viteDirectories = ["dev-dist"];

console.log("Cleaning up Vite-related files...");

// Move files to backup directory
viteFiles.forEach((file) => {
  const filePath = path.join(rootDir, file);
  const destPath = path.join(backupDir, file);

  if (fs.existsSync(filePath)) {
    // Create parent directories in the backup folder if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    try {
      fs.renameSync(filePath, destPath);
      console.log(`✅ Moved ${file} to backup directory`);
    } catch (err) {
      console.error(`❌ Error moving ${file}: ${err.message}`);
    }
  }
});

// Remove directories
viteDirectories.forEach((dir) => {
  const dirPath = path.join(rootDir, dir);

  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`🗑️ Removed ${dir} directory`);
    } catch (err) {
      console.error(`❌ Error removing ${dir}: ${err.message}`);
    }
  }
});

// Update package.json to remove Vite dependencies
try {
  console.log("Updating package.json to remove Vite dependencies...");

  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // List of Vite-related dependencies to remove
  const viteDevDeps = [
    "@vitejs/plugin-react",
    "@vitest/coverage-v8",
    "@vitest/ui",
    "happy-dom",
    "vite",
    "vite-bundle-analyzer",
    "vite-plugin-image-optimizer",
    "vite-plugin-pwa",
    "vitest",
  ];

  // List of dependencies to remove
  const viteDeps = [
    "react-router-dom",
    "react-router",
    "workbox-cacheable-response",
    "workbox-core",
    "workbox-expiration",
    "workbox-precaching",
    "workbox-routing",
    "workbox-strategies",
    "workbox-window",
  ];

  let modified = false;

  // Remove dev dependencies
  if (packageJson.devDependencies) {
    viteDevDeps.forEach((dep) => {
      if (packageJson.devDependencies[dep]) {
        delete packageJson.devDependencies[dep];
        console.log(`🗑️ Removed dev dependency: ${dep}`);
        modified = true;
      }
    });
  }

  // Remove dependencies
  if (packageJson.dependencies) {
    viteDeps.forEach((dep) => {
      if (packageJson.dependencies[dep]) {
        delete packageJson.dependencies[dep];
        console.log(`🗑️ Removed dependency: ${dep}`);
        modified = true;
      }
    });
  }

  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json successfully");
    console.log(
      '⚠️ You may want to run "npm install" to update your node_modules'
    );
  } else {
    console.log("✅ No Vite dependencies found in package.json");
  }
} catch (err) {
  console.error(`❌ Error updating package.json: ${err.message}`);
}

console.log(
  "\nCleanup complete! All Vite-related files have been backed up to .old-vite-files/"
);
console.log(
  'If your app starts successfully with "npm run dev", you can delete the .old-vite-files directory'
);
console.log("To delete the backup files, run: rm -rf .old-vite-files");
