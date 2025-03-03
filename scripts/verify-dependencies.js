#!/usr/bin/env node

/**
 * Dependency verification script
 *
 * This script scans the project files for import statements and checks if the imported
 * packages are properly listed in package.json. It helps prevent build failures due to
 * missing dependencies.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Read package.json to get current dependencies
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const allDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Find all TS/JS/TSX/JSX files in the project
const findFiles = () => {
  try {
    const result = execSync(
      'find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"',
      { encoding: "utf8" }
    );
    return result.trim().split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error finding files:", error.message);
    return [];
  }
};

// Extract imports from a file
const extractImports = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const imports = [];

    // Match import statements
    const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^.'"][^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      // Exclude relative imports and alias imports (starting with @/)
      if (
        !importPath.startsWith("./") &&
        !importPath.startsWith("../") &&
        !importPath.startsWith("@/")
      ) {
        // Extract the package name (first part of the import path)
        const packageName = importPath.split("/")[0];
        // Handle scoped packages
        const fullPackageName = importPath.startsWith("@")
          ? `${importPath.split("/")[0]}/${importPath.split("/")[1]}`
          : packageName;

        imports.push(fullPackageName);
      }
    }

    return imports;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return [];
  }
};

// Main function
const main = () => {
  console.log("Verifying package dependencies...");

  const files = findFiles();
  if (files.length === 0) {
    console.error("No source files found.");
    process.exit(1);
  }

  console.log(`Found ${files.length} files to scan.`);

  // Collect all unique imports
  const allImports = new Set();
  files.forEach((file) => {
    const imports = extractImports(file);
    imports.forEach((imp) => allImports.add(imp));
  });

  // Check if all imports are in package.json
  const missingDependencies = [];
  allImports.forEach((dependency) => {
    if (!allDependencies[dependency]) {
      missingDependencies.push(dependency);
    }
  });

  if (missingDependencies.length > 0) {
    console.error("\n⚠️ Missing dependencies detected:");
    missingDependencies.forEach((dep) => console.error(`- ${dep}`));
    console.error(
      "\nThese packages are imported in the code but not listed in package.json."
    );
    console.error("Consider adding them to package.json with:");
    console.error(`npm install --save ${missingDependencies.join(" ")}`);
    process.exit(1);
  } else {
    console.log(
      "✅ All imported packages are properly listed in package.json."
    );
  }
};

main();
