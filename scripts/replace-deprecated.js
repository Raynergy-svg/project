#!/usr/bin/env node

/**
 * This script helps identify and replace usage of deprecated packages like
 * abab (for atob/btoa) and domexception with native implementations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { globSync } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("Searching for usage of deprecated packages...");

// Define patterns to search for
const patterns = [
  {
    name: "abab",
    regex: /(?:import|require)\s*\(?\s*['"]abab['"](?:\s*\))?\s*;?/g,
    replacement:
      "// Using native methods instead of abab\nimport { atob, btoa } from '@/utils/polyfills';",
  },
  {
    name: "atob function from abab",
    regex: /(?:import\s*{\s*)?(?:atob)(?:\s*}\s*from\s*['"]abab['"])/g,
    replacement: "atob } from '@/utils/polyfills'",
  },
  {
    name: "btoa function from abab",
    regex: /(?:import\s*{\s*)?(?:btoa)(?:\s*}\s*from\s*['"]abab['"])/g,
    replacement: "btoa } from '@/utils/polyfills'",
  },
  {
    name: "domexception",
    regex: /(?:import|require)\s*\(?\s*['"]domexception['"](?:\s*\))?\s*;?/g,
    replacement:
      "// Using native DOMException\nimport { createDOMException } from '@/utils/polyfills';",
  },
  {
    name: "DOMException from domexception",
    regex:
      /(?:import\s*{\s*)?(?:DOMException)(?:\s*}\s*from\s*['"]domexception['"])/g,
    replacement: "createDOMException } from '@/utils/polyfills'",
  },
  {
    name: "new DOMException",
    regex: /new\s+DOMException\s*\(\s*([^,)]+)(?:\s*,\s*([^)]+))?\s*\)/g,
    replacement: "createDOMException($1, $2)",
  },
];

// Find typescript and javascript files
const files = globSync("src/**/*.{ts,tsx,js,jsx}", {
  cwd: rootDir,
  ignore: ["**/node_modules/**", "**/.next/**", "**/.old-vite-files/**"],
});

console.log(`Scanning ${files.length} files...`);

let totalMatches = 0;
let totalReplacements = 0;
const matchedFiles = new Set();

// Process each file
files.forEach((file) => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let fileChanged = false;

  // Check for each pattern
  patterns.forEach((pattern) => {
    const matches = content.match(pattern.regex);

    if (matches && matches.length > 0) {
      totalMatches += matches.length;
      matchedFiles.add(file);

      console.log(
        `Found ${matches.length} usages of ${pattern.name} in ${file}`
      );

      // Perform replacement if requested
      if (pattern.replacement) {
        content = content.replace(pattern.regex, pattern.replacement);
        totalReplacements += matches.length;
        fileChanged = true;
      }
    }
  });

  // Save the file if changed
  if (fileChanged) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated file: ${file}`);
  }
});

// Summary
console.log("\nScan complete!");
console.log(
  `Found ${totalMatches} potential usages of deprecated packages in ${matchedFiles.size} files.`
);

if (totalReplacements > 0) {
  console.log(`Made ${totalReplacements} replacements.`);
  console.log(
    "\nPlease check the updated files to ensure the replacements work as expected."
  );
  console.log(
    "You may need to make additional manual adjustments in some cases."
  );
} else if (totalMatches > 0) {
  console.log("\nNo automatic replacements were made.");
  console.log(
    "You will need to manually update the code to use the following imports:"
  );
  console.log(
    `  import { atob, btoa, createDOMException } from '@/utils/polyfills';`
  );
} else {
  console.log(
    "\nNo usages of deprecated packages were found directly in your code."
  );
  console.log("The warnings come from dependencies used by your packages.");
  console.log(
    "The polyfills added to your codebase will ensure compatibility when these"
  );
  console.log("packages are used.");
}

console.log(
  "\nThe following files contain polyfills to handle these deprecated packages:"
);
console.log("- src/utils/polyfills.ts");
console.log("- src/utils/encoding.ts");
console.log(
  "These have been initialized in _app.tsx, middleware.ts, and app/layout.tsx."
);

process.exit(0);
