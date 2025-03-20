#!/usr/bin/env node
/**
 * Update bundler-related imports
 * 
 * This script scans and updates imports from webpack-specific patch files
 * to use the new unified bundler-patches.ts module instead.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Old import patterns to replace
const importPatterns = [
  {
    pattern: /import.*?['"](.*?webpack-factory-patch)['"]/g,
    replacement: "import { applyBundlerPatches } from '@/utils/bundler-patches'"
  },
  {
    pattern: /import.*?['"](.*?webpackPatch)['"]/g,
    replacement: "import { applyBundlerPatches } from '@/utils/bundler-patches'"
  },
  {
    pattern: /import.*?['"](.*?webpack-patch)['"]/g,
    replacement: "import { applyBundlerPatches } from '@/utils/bundler-patches'"
  },
  {
    pattern: /from\s+['"](.*?webpack-factory-patch)['"]/g,
    replacement: "from '@/utils/bundler-patches'"
  },
  {
    pattern: /from\s+['"](.*?webpackPatch)['"]/g,
    replacement: "from '@/utils/bundler-patches'"
  },
  {
    pattern: /from\s+['"](.*?webpack-patch)['"]/g,
    replacement: "from '@/utils/bundler-patches'"
  },
  {
    pattern: /require\(['"](.*?webpack-factory-patch)['"]\)/g,
    replacement: "require('@/utils/bundler-patches')"
  },
  {
    pattern: /require\(['"](.*?webpackPatch)['"]\)/g,
    replacement: "require('@/utils/bundler-patches')"
  },
  {
    pattern: /require\(['"](.*?webpack-patch)['"]\)/g,
    replacement: "require('@/utils/bundler-patches')"
  }
];

// Function usage patterns to replace
const functionPatterns = [
  {
    pattern: /applyBundlerPatches/g,
    replacement: "applyBundlerPatches"
  },
  {
    pattern: /applyBundlerPatches/g,
    replacement: "applyBundlerPatches"
  },
  {
    pattern: /applyBundlerPatches/g,
    replacement: "applyBundlerPatches"
  }
];

// Extensions to check
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '_oldutils',
  '_oldpages',
  '_backups'
];

// Function to walk directory recursively
function walkDir(dir, callback) {
  try {
    fs.readdirSync(dir).forEach(f => {
      const dirPath = path.join(dir, f);
      
      try {
        const stats = fs.lstatSync(dirPath);
        
        if (stats.isSymbolicLink()) {
          // Skip symbolic links to avoid circular references
          return;
        }
        
        if (stats.isDirectory()) {
          if (!excludeDirs.includes(f)) {
            walkDir(dirPath, callback);
          }
        } else if (stats.isFile()) {
          const ext = path.extname(f);
          if (extensions.includes(ext)) {
            callback(path.join(dir, f));
          }
        }
      } catch (err) {
        console.warn(`${colors.yellow}Warning: Could not process ${dirPath}: ${err.message}${colors.reset}`);
      }
    });
  } catch (err) {
    console.warn(`${colors.yellow}Warning: Could not read directory ${dir}: ${err.message}${colors.reset}`);
  }
}

// Results storage
const updatedFiles = [];

console.log(`${colors.bright}${colors.cyan}Scanning for webpack import patterns to update...${colors.reset}`);

// Scan files
walkDir(rootDir, (filePath) => {
  try {
    // Skip our own bundler-patches file
    if (filePath.includes('bundler-patches.ts')) {
      return;
    }
    
    const relativePath = path.relative(rootDir, filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Check and replace import patterns
    importPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
    });
    
    // Check and replace function call patterns
    functionPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
    });
    
    // Write back if we made changes
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles.push(relativePath);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
});

// Display results
if (updatedFiles.length === 0) {
  console.log(`${colors.green}No webpack import patterns found that need updating.${colors.reset}`);
} else {
  console.log(`${colors.green}Updated ${updatedFiles.length} files to use the unified bundler-patches module:${colors.reset}\n`);
  
  updatedFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  console.log(`\n${colors.bright}${colors.cyan}Next steps:${colors.reset}`);
  console.log(`1. Run the development server with \`npm run dev\` to test the changes`);
  console.log(`2. If there are any issues, check the browser console for errors`);
  console.log(`3. Consider running \`npm run analyze:turbo\` to check for any remaining compatibility issues`);
}
