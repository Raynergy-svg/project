/**
 * Cleanup Auth Files Script
 *
 * This script will help safely remove redundant auth files from the project
 * after the consolidation process is complete.
 *
 * IMPORTANT: Only run this script after confirming the app works with the consolidated auth files.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that can be safely removed
const filesToRemove = [
  // Redundant utility files
  "src/lib/supabase/auth.ts",
  "src/lib/supabase-auth.ts",
  "src/utils/auth-simple.ts",
  "src/utils/next-auth-adapter.ts",

  // Now redundant backup files
  "src/auth-backup",
];

// Files to mark as deprecated but not remove
const filesToDeprecate = [
  "src/contexts/auth-adapter.tsx",
  "src/contexts/next-auth-context.tsx",
];

// Files to add warnings about server vs client usage
const filesToAddUsageWarnings = [
  "src/utils/auth.ts",
  "src/utils/auth-server.ts",
];

// Deprecation notice to add at the top of files
const deprecationNotice = `/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Use the consolidated auth system in src/contexts/AuthContext.tsx and src/utils/auth.ts instead.
 */
`;

// Server usage warning notice
const serverUsageWarning = `/**
 * IMPORTANT: Server-side auth utilities
 * This file should ONLY be imported in server components or API routes.
 * DO NOT import this in client components or the pages/ directory.
 */
`;

// Client usage warning notice
const clientUsageWarning = `/**
 * IMPORTANT: Client-side auth utilities
 * This file contains only client-safe code that can be used in both client and server contexts.
 * For server-only functionality, use auth-server.ts instead.
 */
`;

function removeFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    if (fs.existsSync(fullPath)) {
      if (fs.lstatSync(fullPath).isDirectory()) {
        // Remove directory recursively
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${filePath}`);
      } else {
        // Remove single file
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed file: ${filePath}`);
      }
    } else {
      console.log(`⚠️ File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
  }
}

function deprecateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");

      // Only add deprecation notice if it doesn't already exist
      if (!content.includes("@deprecated")) {
        const newContent = deprecationNotice + content;
        fs.writeFileSync(fullPath, newContent);
        console.log(`✅ Marked as deprecated: ${filePath}`);
      } else {
        console.log(`ℹ️ Already marked as deprecated: ${filePath}`);
      }
    } else {
      console.log(`⚠️ File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deprecating ${filePath}:`, error.message);
  }
}

function addUsageWarning(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");

      // Determine which warning to add
      const isServerFile = filePath.includes("auth-server");
      const warningNotice = isServerFile
        ? serverUsageWarning
        : clientUsageWarning;

      // Only add warning if it doesn't already exist
      if (!content.includes("IMPORTANT:")) {
        // Find the first comment block to replace
        const commentStart = content.indexOf("/**");
        if (commentStart >= 0) {
          const commentEnd = content.indexOf("*/", commentStart) + 2;
          const newContent =
            warningNotice + content.substring(commentEnd).trim();
          fs.writeFileSync(fullPath, newContent);
          console.log(`✅ Added usage warning to: ${filePath}`);
        } else {
          // If no existing comment, add at the top
          const newContent = warningNotice + content;
          fs.writeFileSync(fullPath, newContent);
          console.log(`✅ Added usage warning to: ${filePath}`);
        }
      } else {
        console.log(`ℹ️ Already has usage warning: ${filePath}`);
      }
    } else {
      console.log(`⚠️ File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(
      `❌ Error adding usage warning to ${filePath}:`,
      error.message
    );
  }
}

function main() {
  console.log("🚀 Starting auth files cleanup...");

  // Add usage warnings to auth files
  console.log("\n⚠️ Adding usage warnings to auth files...");
  filesToAddUsageWarnings.forEach(addUsageWarning);

  // Mark files as deprecated
  console.log("\n📝 Marking files as deprecated...");
  filesToDeprecate.forEach(deprecateFile);

  // Ask for confirmation before removing files
  console.log("\n⚠️ The following files will be removed:");
  filesToRemove.forEach((file) => console.log(`   - ${file}`));
  console.log("\n⚠️ WARNING: This operation cannot be undone!");
  console.log("\nTo proceed with removal, run this script with --remove flag:");
  console.log("Example: node scripts/cleanup-auth-files.js --remove");
}

// Function to remove the files
function removeAuthFiles() {
  console.log("\n🗑️ Removing redundant files...");
  filesToRemove.forEach(removeFile);
  console.log("\n✅ Auth files cleanup complete!");
}

// Run the main function when the script is executed directly
if (process.argv.includes("--remove")) {
  removeAuthFiles();
} else {
  main();
}

export { removeAuthFiles };
