#!/usr/bin/env node

/**
 * This script fixes dependency conflicts in package.json
 * Run it before the build to ensure compatibility
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(process.cwd(), "package.json");

console.log("📦 Fixing dependency conflicts...");

try {
  // Read the current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Fix TypeScript version to be compatible with eslint plugin
  if (packageJson.devDependencies && packageJson.devDependencies.typescript) {
    const currentTypescriptVersion = packageJson.devDependencies.typescript;

    if (currentTypescriptVersion.includes("5.8")) {
      console.log(
        "⚠️  TypeScript version > 5.7.x found, downgrading to ^5.7.3"
      );
      packageJson.devDependencies.typescript = "^5.7.3";
    }
  }

  // Fix React version to be compatible with react-plaid-link
  if (packageJson.dependencies && packageJson.dependencies.react) {
    const currentReactVersion = packageJson.dependencies.react;

    if (currentReactVersion.includes("19")) {
      console.log("⚠️  React version 19.x found, downgrading to ^18.2.0");
      packageJson.dependencies.react = "^18.2.0";
      packageJson.dependencies["react-dom"] = "^18.2.0";
    }
  }

  // Fix React Router version to be compatible
  if (
    packageJson.dependencies &&
    packageJson.dependencies["react-router-dom"]
  ) {
    const currentRouterVersion = packageJson.dependencies["react-router-dom"];

    if (currentRouterVersion.includes("7.")) {
      console.log("⚠️  React Router version 7.x found, downgrading to ^6.22.0");
      packageJson.dependencies["react-router-dom"] = "^6.22.0";
    }
  }

  // Fix React types to match React version
  if (
    packageJson.devDependencies &&
    packageJson.devDependencies["@types/react"]
  ) {
    if (packageJson.dependencies.react.includes("18")) {
      console.log("⚠️  Updating React types to match React 18");
      packageJson.devDependencies["@types/react"] = "^18.2.43";
      packageJson.devDependencies["@types/react-dom"] = "^18.2.17";
    }
  }

  // Fix ESLint and TypeScript ESLint plugin versions
  if (
    packageJson.devDependencies &&
    packageJson.devDependencies["@typescript-eslint/eslint-plugin"]
  ) {
    if (
      packageJson.devDependencies["@typescript-eslint/eslint-plugin"].includes(
        "8."
      )
    ) {
      console.log("⚠️  Downgrading @typescript-eslint/eslint-plugin to ^7.0.0");
      packageJson.devDependencies["@typescript-eslint/eslint-plugin"] =
        "^7.0.0";
      packageJson.devDependencies["@typescript-eslint/parser"] = "^7.0.0";
    }
  }

  // Write the updated package.json
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );

  console.log("✅ Dependencies fixed successfully");
} catch (error) {
  console.error("❌ Error fixing dependencies:", error);
  process.exit(1);
}
