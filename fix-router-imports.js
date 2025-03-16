/**
 * This script finds all react-router-dom imports and replaces them with imports from our empty-module.js
 */
const fs = require("fs");
const { promisify } = require("util");
const { exec } = require("child_process");
const path = require("path");

const execPromise = promisify(exec);
const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);

// Find all files that import from react-router-dom
async function findReactRouterImports() {
  try {
    const { stdout } = await execPromise(
      'grep -r "from [\'\\"]react-router-dom[\'\\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/'
    );
    return stdout.split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error finding imports:", error);
    return [];
  }
}

// Replace imports in a file
async function replaceImportsInFile(filePath) {
  try {
    // Extract the file path from the grep result
    const filePathMatch = filePath.match(/^([^:]+):/);
    if (!filePathMatch) return;

    const actualFilePath = filePathMatch[1];
    console.log(`Processing ${actualFilePath}`);

    // Read the file content
    const content = await readFilePromise(actualFilePath, "utf-8");

    // Replace the import line
    // This handles multiple styles of imports from react-router-dom
    const replacedContent = content
      .replace(
        /import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"]/g,
        "import {$1} from '@/empty-module'"
      )
      .replace(
        /import\s+([^{}\s,]+)\s+from\s+['"]react-router-dom['"]/g,
        "import $1 from '@/empty-module'"
      );

    // Write the updated content back to the file
    await writeFilePromise(actualFilePath, replacedContent, "utf-8");
    console.log(`Updated imports in ${actualFilePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Main function
async function main() {
  try {
    const files = await findReactRouterImports();
    console.log(`Found ${files.length} files with react-router-dom imports`);

    for (const file of files) {
      await replaceImportsInFile(file);
    }

    console.log("All imports have been updated successfully");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
main();
