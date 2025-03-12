/**
 * Supabase Cleanup Script
 *
 * This script cleans up Supabase file structure and updates imports throughout the codebase.
 * It can:
 * 1. Add deprecation notices to old files
 * 2. Fix imports to use the new consolidated files
 * 3. Optionally remove redundant files
 *
 * Usage:
 *   node scripts/cleanup-supabase-files.mjs           # Preview changes
 *   node scripts/cleanup-supabase-files.mjs --fix     # Update imports
 *   node scripts/cleanup-supabase-files.mjs --remove  # Update imports and remove redundant files
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import readline from "readline";

// Get directory paths with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");

// Files to add deprecation notices to
const filesToDeprecate = [
  "src/lib/supabase/client.ts",
  "src/lib/supabase.ts",
  "src/utils/supabase-client.ts",
];

// Files to eventually remove after migration is complete
const filesToRemove = [
  "src/lib/supabase/client.ts",
  "src/lib/supabase.ts",
  "src/utils/supabase-client.ts",
  "src/server/supabase.ts",
];

// Import mappings for replacement
const importMappings = [
  {
    from: /@\/lib\/supabase\/client/g,
    to: "@/utils/supabase/client",
  },
  {
    from: /@\/lib\/supabase'/g,
    to: "@/utils/supabase/client'",
  },
  {
    from: /@\/lib\/supabase"/g,
    to: '@/utils/supabase/client"',
  },
  {
    from: /@\/utils\/supabase-client/g,
    to: "@/utils/supabase/client",
  },
  {
    from: /@\/server\/supabase/g,
    to: "@/utils/supabase/admin",
  },
  {
    from: /createClient } from '@supabase\/ssr'/g,
    to: "createClient } from @/utils/supabase/server'",
  },
];

// Template for deprecation notice
const deprecationNotice = `/**
 * DEPRECATED: This file is maintained for backward compatibility only.
 * Please use the consolidated Supabase files instead:
 * 
 * - @/utils/supabase/client.ts (client-side)
 * - @/utils/supabase/server.ts (server-side)
 * - @/utils/supabase/admin.ts (admin operations)
 * - @/types/supabase.types.ts (for types)
 */

`;

// List all TypeScript files in directory recursively
function findTsFiles(dir, filelist = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      filelist = findTsFiles(filePath, filelist);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      filelist.push(filePath);
    }
  });

  return filelist;
}

// Add deprecation notice to specified files
function addDeprecationNotices() {
  console.log("Adding deprecation notices to old files...");

  filesToDeprecate.forEach((filePath) => {
    const fullPath = path.join(rootDir, filePath);

    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, "utf8");

        if (!content.includes("DEPRECATED")) {
          content = deprecationNotice + content;
          fs.writeFileSync(fullPath, content);
          console.log(`✓ Added deprecation notice to ${filePath}`);
        } else {
          console.log(`- Deprecation notice already exists in ${filePath}`);
        }
      } catch (err) {
        console.error(`✗ Error adding deprecation notice to ${filePath}:`, err);
      }
    } else {
      console.log(`- File not found: ${filePath}`);
    }
  });
}

// Update imports throughout the codebase
function updateImports(fix = false) {
  console.log(
    `${fix ? "Updating" : "Checking"} imports throughout the codebase...`
  );

  // Get all TypeScript files
  const tsFiles = findTsFiles(srcDir);
  let totalFiles = 0;
  let totalMatches = 0;

  tsFiles.forEach((filePath) => {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      let originalContent = content;
      let fileMatches = 0;

      // Apply all import mappings
      importMappings.forEach((mapping) => {
        // Count matches before replacement
        const matches = (content.match(mapping.from) || []).length;
        fileMatches += matches;

        // Replace imports if fix is true
        if (fix && matches > 0) {
          content = content.replace(mapping.from, mapping.to);
        }
      });

      // Update file if it was changed and fix is true
      if (fix && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Updated imports in ${path.relative(rootDir, filePath)}`);
        totalFiles++;
      }

      // Log matches if any were found
      if (fileMatches > 0 && !fix) {
        console.log(
          `- Found ${fileMatches} imports to update in ${path.relative(
            rootDir,
            filePath
          )}`
        );
        totalMatches += fileMatches;
      }
    } catch (err) {
      console.error(`✗ Error processing ${filePath}:`, err);
    }
  });

  if (fix) {
    console.log(`✓ Updated imports in ${totalFiles} files`);
  } else {
    console.log(
      `- Found ${totalMatches} imports to update in ${tsFiles.length} files`
    );
    console.log("Run with --fix to update these imports");
  }
}

// Remove specified files
function removeFiles() {
  console.log("Removing redundant files...");

  filesToRemove.forEach((filePath) => {
    const fullPath = path.join(rootDir, filePath);

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✓ Removed ${filePath}`);
      } catch (err) {
        console.error(`✗ Error removing ${filePath}:`, err);
      }
    } else {
      console.log(`- File not found: ${filePath}`);
    }
  });
}

// Ask user for confirmation
async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

// Main function
async function main() {
  console.log("Supabase Files Cleanup");
  console.log("=====================");

  const args = process.argv.slice(2);
  const shouldFix = args.includes("--fix") || args.includes("--remove");
  const shouldRemove = args.includes("--remove");

  // Add deprecation notices
  addDeprecationNotices();

  // Update imports
  updateImports(shouldFix);

  // Remove files if requested
  if (shouldRemove) {
    console.log("\nWARNING: You are about to remove the following files:");
    filesToRemove.forEach((file) => console.log(`- ${file}`));
    console.log("This operation cannot be undone.");

    // Confirm removal
    const proceed = await askConfirmation("Do you want to proceed? (y/N) ");

    if (proceed) {
      removeFiles();
      console.log("\n✓ Cleanup complete!");
    } else {
      console.log("\n- Skipped file removal. Cleanup incomplete.");
    }
  } else {
    if (!shouldFix) {
      console.log("\nRun with --fix to update imports without removing files");
      console.log(
        "Run with --remove to update imports and remove redundant files"
      );
    } else {
      console.log("\n✓ Import updates complete!");
      console.log("Run with --remove to also remove redundant files");
    }
  }
}

// Run the script
main();
