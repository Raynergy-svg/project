#!/usr/bin/env node
/**
 * Analyze Turbopack Compatibility
 * 
 * This script scans the codebase to identify patterns that might be incompatible
 * with Turbopack or cause performance issues.
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

// Patterns that might cause issues with Turbopack
const potentialIssues = [
  // High severity issues
  {
    name: 'Dynamic require() calls',
    pattern: /require\s*\(\s*[^"'`][^)]*\)/g,
    severity: 'high',
    description: 'Dynamic require() calls can prevent proper code splitting and optimization',
    recommendation: 'Use static requires or dynamic imports with ES modules instead.'
  },
  {
    name: 'eval() usage',
    pattern: /\beval\s*\(/g,
    severity: 'high',
    description: 'eval() prevents proper optimization and code analysis',
    recommendation: 'Avoid using eval() completely. Use alternative approaches like Function constructors if absolutely necessary.'
  },
  {
    name: 'Webpack-specific imports',
    pattern: /import.*webpack(?!\s*from\s*['"\`]next)/g,
    severity: 'high',
    description: 'Direct webpack imports might not work with Turbopack',
    recommendation: 'Use feature detection instead of direct webpack imports. Consider using Next.js built-in optimization features.'
  },
  // Medium severity issues
  {
    name: 'Webpack-specific configuration',
    pattern: /webpackConfig|webpack\.config|webpack-config/g,
    severity: 'medium',
    description: 'Webpack configuration might need to be adapted for Turbopack',
    recommendation: 'Use Next.js configuration options that are supported by both bundlers.'
  },
  {
    name: 'Dynamic CSS imports',
    pattern: /import\s*\(\s*['"`].*\.css['"`]\s*\)/g,
    severity: 'medium',
    description: 'Dynamic CSS imports might not be fully supported'
  },
  {
    name: 'Process browser field override',
    pattern: /process\.browser/g,
    severity: 'low',
    description: 'Use typeof window !== "undefined" instead'
  },
  {
    name: 'Custom Babel configuration',
    pattern: /babel\.config|\.babelrc/g,
    severity: 'low',
    description: 'Custom Babel configurations might need adjustment'
  },
  {
    name: 'Unsupported loaders or plugins',
    pattern: /\.includes\(\s*['"`].*loader['"`]\s*\)|['"`].*-plugin['"`]/g,
    severity: 'medium',
    description: 'Some webpack loaders or plugins might not have Turbopack equivalents'
  },
  {
    name: 'Global webpack references',
    pattern: /\bglobal\.webpack|\bwindow\.webpack|\b__webpack_require__|webpackJsonp/g,
    severity: 'high',
    description: 'Direct references to webpack globals will likely fail with Turbopack',
    recommendation: 'Create an abstraction layer that works with both bundlers using feature detection.'
  },
  {
    name: 'Dynamic webpack imports',
    pattern: /import\s*\(\s*['"`]webpack/g,
    severity: 'high',
    description: 'Dynamic webpack imports will likely fail'
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
        const stats = fs.lstatSync(dirPath); // Use lstatSync instead of statSync to detect symlinks
        
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
const issues = [];

console.log(`${colors.bright}${colors.cyan}Analyzing codebase for Turbopack compatibility...${colors.reset}`);

// Scan files
walkDir(rootDir, (filePath) => {
  try {
    const relativePath = path.relative(rootDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    potentialIssues.forEach(issue => {
      const matches = content.match(issue.pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: relativePath,
            issue: issue.name,
            pattern: match,
            severity: issue.severity,
            description: issue.description
          });
        });
      }
    });
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
});

// Sort issues by severity
issues.sort((a, b) => {
  const severityMap = { high: 0, medium: 1, low: 2 };
  return severityMap[a.severity] - severityMap[b.severity];
});

// Display results
if (issues.length === 0) {
  console.log(`${colors.green}No potential Turbopack compatibility issues found!${colors.reset}`);
} else {
  console.log(`${colors.yellow}Found ${issues.length} potential Turbopack compatibility issues:${colors.reset}\n`);
  
  const severityCounts = { high: 0, medium: 0, low: 0 };
  issues.forEach(issue => severityCounts[issue.severity]++);
  
  console.log(`Severity distribution:`);
  console.log(`  ${colors.red}High: ${severityCounts.high}${colors.reset}`);
  console.log(`  ${colors.yellow}Medium: ${severityCounts.medium}${colors.reset}`);
  console.log(`  ${colors.green}Low: ${severityCounts.low}${colors.reset}\n`);
  
  // Group by issue type
  const issuesByType = {};
  issues.forEach(issue => {
    if (!issuesByType[issue.issue]) {
      issuesByType[issue.issue] = [];
    }
    issuesByType[issue.issue].push(issue);
  });
  
  // Display grouped issues
  Object.keys(issuesByType).forEach(type => {
    const typeIssues = issuesByType[type];
    const severity = typeIssues[0].severity;
    const severityColor = severity === 'high' ? colors.red : severity === 'medium' ? colors.yellow : colors.green;
    
    console.log(`${colors.bright}${severityColor}${type} (${severity} severity)${colors.reset}`);
    console.log(`${typeIssues[0].description}`);
    console.log('Found in:');
    
    typeIssues.forEach(issue => {
      console.log(`  - ${issue.file}`);
    });
    
    console.log(''); // Empty line between issue types
  });
  
  console.log(`${colors.bright}Recommendations:${colors.reset}`);

  // Show specific recommendations from the issues found
  const uniqueRecommendations = new Set();
  
  Object.keys(issuesByType).forEach(type => {
    const issue = issuesByType[type][0]; // Get first issue of this type
    if (issue.recommendation) {
      uniqueRecommendations.add(`- ${issue.issue}: ${issue.recommendation}`);
    }
  });
  
  // Print unique recommendations
  [...uniqueRecommendations].slice(0, 5).forEach(rec => {
    console.log(rec);
  });
  
  console.log('\nGeneral advice:');
  console.log('1. Address high severity issues first');
  console.log('2. Test with `npm run dev:force` to see if issues affect runtime');
  console.log('3. Use the bundler-patches.ts utility for compatible code');
  console.log('4. Run `npm run setup:turbo` after making changes to ensure proper configuration');
}
