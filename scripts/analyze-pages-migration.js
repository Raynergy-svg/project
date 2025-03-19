#!/usr/bin/env node

/**
 * This script analyzes the Next.js project to identify:
 * 1. Pages in the Pages Router that need to be migrated to the App Router
 * 2. Pages that already exist in the App Router
 * 3. A list of Pages Router pages that have already been migrated
 * 
 * Usage:
 * node scripts/analyze-pages-migration.js
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Project paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const APP_DIR = path.join(ROOT_DIR, 'src', 'app');

// Skip special files and directories
const SKIP_FILES = ['_app.tsx', '_document.tsx', '_error.tsx', 'api'];

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList = getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Convert file path to route path
 */
function filePathToRoutePath(filePath, baseDir) {
  // Remove base directory
  let routePath = filePath.replace(baseDir, '');
  
  // Remove file extension
  routePath = routePath.replace(/\.[^/.]+$/, '');
  
  // Convert /index to /
  routePath = routePath.replace(/\/index$/, '/');
  
  // Handle dynamic routes
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Make sure it starts with /
  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath;
  }
  
  // Ensure root path is just /
  if (routePath === '//') {
    routePath = '/';
  }
  
  return routePath;
}

/**
 * Check if a route in Pages Router has been migrated to App Router
 */
function hasAppRouterEquivalent(pagesRoute, appRoutes) {
  // Direct match
  if (appRoutes.includes(pagesRoute)) {
    return true;
  }
  
  // Special case for index route
  if (pagesRoute === '/' && appRoutes.includes('/page')) {
    return true;
  }
  
  // Check for route with /page suffix
  const appRouterVersion = pagesRoute === '/' ? '/page' : `${pagesRoute}/page`;
  return appRoutes.includes(appRouterVersion);
}

/**
 * Main function
 */
function analyzePagesRouterMigration() {
  console.log(chalk.cyan.bold('======================================'));
  console.log(chalk.cyan.bold('  Next.js App Router Migration Analysis'));
  console.log(chalk.cyan.bold('======================================'));
  console.log('');
  
  // Get all pages from Pages Router
  const pagesRouterFiles = getAllFiles(PAGES_DIR)
    .filter(file => {
      const relativePath = path.relative(PAGES_DIR, file);
      return !SKIP_FILES.some(skipFile => relativePath.startsWith(skipFile));
    });
  
  // Get all pages from App Router
  const appRouterFiles = getAllFiles(APP_DIR)
    .filter(file => file.endsWith('page.tsx') || file.endsWith('page.jsx') || file.endsWith('page.js'));
  
  // Convert to route paths
  const pagesRouterRoutes = pagesRouterFiles.map(file => filePathToRoutePath(file, PAGES_DIR));
  const appRouterRoutes = appRouterFiles.map(file => filePathToRoutePath(file, APP_DIR));
  
  // Identify pages that need migration
  const needsMigration = [];
  const alreadyMigrated = [];
  
  pagesRouterRoutes.forEach(route => {
    if (hasAppRouterEquivalent(route, appRouterRoutes)) {
      alreadyMigrated.push(route);
    } else {
      needsMigration.push(route);
    }
  });
  
  // Print results
  console.log(chalk.green.bold('Pages Router Routes:'), pagesRouterRoutes.length);
  console.log(chalk.green.bold('App Router Routes:'), appRouterRoutes.length);
  console.log('');
  
  console.log(chalk.yellow.bold('Routes that need migration:'), needsMigration.length);
  needsMigration.forEach(route => console.log(`  ${chalk.yellow('→')} ${route}`));
  console.log('');
  
  console.log(chalk.green.bold('Routes already migrated:'), alreadyMigrated.length);
  alreadyMigrated.forEach(route => console.log(`  ${chalk.green('✓')} ${route}`));
  console.log('');
  
  // Output App Router routes that don't exist in Pages Router
  const newRoutes = appRouterRoutes.filter(route => 
    !pagesRouterRoutes.includes(route) && 
    !pagesRouterRoutes.includes(route.replace(/\/page$/, ''))
  );
  
  console.log(chalk.blue.bold('New routes in App Router:'), newRoutes.length);
  newRoutes.forEach(route => console.log(`  ${chalk.blue('+')} ${route}`));
  console.log('');
  
  // Output middleware updates
  console.log(chalk.magenta.bold('Update middleware.ts with:'));
  console.log('');
  console.log('const appRouterPages = [');
  
  // Combine existing and migrated routes
  const allAppRoutes = [...appRouterRoutes, ...alreadyMigrated]
    .map(route => route.replace(/\/page$/, '')) // Remove /page suffix
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .sort();
  
  allAppRoutes.forEach(route => {
    console.log(`  '${route}', '${route}/',`);
  });
  
  console.log('];');
  console.log('');
  
  console.log(chalk.cyan.bold('======================================'));
  console.log('');
}

// Run the analysis
analyzePagesRouterMigration();
