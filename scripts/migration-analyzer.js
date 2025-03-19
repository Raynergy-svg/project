#!/usr/bin/env node

/**
 * Migration Analyzer for Next.js App Router Migration
 * This script analyzes the progress of migrating from Pages Router to App Router.
 * It identifies:
 * - Pages that have been migrated to App Router
 * - Pages that still need to be migrated
 * - Pages that have been redirected but not fully migrated
 * - Potential conflicts between Pages Router and App Router
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Project paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const APP_DIR = path.join(ROOT_DIR, 'src', 'app');
const MIDDLEWARE_PATH = path.join(ROOT_DIR, 'src', 'middleware.ts');

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Get all pages from the pages directory (Pages Router)
 */
function getPagesRouterPages() {
  const pages = [];
  
  function scanDirectory(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      // Skip _app.tsx, _document.tsx, api directory, etc.
      if (entry.name.startsWith('_') || entry.name === 'api') {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && /\.(tsx|jsx|js|ts)$/.test(entry.name)) {
        // Convert file path to route
        let route = '/' + relativePath.replace(/\.(tsx|jsx|js|ts)$/, '');
        
        // Handle index files
        if (route.endsWith('/index')) {
          route = route.replace(/\/index$/, '');
        }
        
        // Ensure root route is represented as "/"
        if (route === '') {
          route = '/';
        }
        
        // Convert PascalCase to kebab-case for route representation
        // This is just for display purposes - Next.js handles this internally
        const displayRoute = route
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .toLowerCase();
        
        pages.push({
          file: relativePath,
          route: displayRoute,
          fullPath: fullPath,
        });
      }
    }
  }
  
  scanDirectory(PAGES_DIR);
  return pages;
}

/**
 * Get all pages from the app directory (App Router)
 */
function getAppRouterPages() {
  const pages = [];
  
  function scanDirectory(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && entry.name === 'page.tsx') {
        // Convert directory path to route
        let route = '/' + basePath;
        
        // Ensure root route is represented as "/"
        if (route === '') {
          route = '/';
        }
        
        pages.push({
          file: relativePath,
          route: route,
          fullPath: fullPath,
        });
      }
    }
  }
  
  scanDirectory(APP_DIR);
  return pages;
}

/**
 * Check if a Pages Router page redirects to App Router
 */
function checkForRedirects(pageFile) {
  try {
    const content = fs.readFileSync(pageFile, 'utf8');
    // Look for common redirect patterns
    const hasRedirect = content.includes('router.replace') || 
                        content.includes('router.push') || 
                        content.includes('<Redirect') || 
                        content.includes('response.redirect') ||
                        content.includes('next/redirect');
    
    // Look for a comment indicating deprecation and migration
    const isDeprecated = content.includes('@deprecated') && 
                        (content.includes('App Router') || content.includes('app router'));
    
    return { hasRedirect, isDeprecated };
  } catch (error) {
    console.error(`Error reading file ${pageFile}:`, error);
    return { hasRedirect: false, isDeprecated: false };
  }
}

/**
 * Get the app pages listed in middleware.ts
 */
function getAppRouterPagesFromMiddleware() {
  try {
    const content = fs.readFileSync(MIDDLEWARE_PATH, 'utf8');
    const appRouterPagesMatch = content.match(/const appRouterPages\s*=\s*\[([\s\S]*?)\]/);
    
    if (!appRouterPagesMatch) {
      return [];
    }
    
    // Extract paths from the array
    const pathMatches = appRouterPagesMatch[1].match(/'([^']+)'/g) || [];
    return pathMatches.map(match => match.replace(/'/g, ''));
  } catch (error) {
    console.error('Error reading middleware file:', error);
    return [];
  }
}

/**
 * Normalize route for comparison
 */
function normalizeRoute(route) {
  return route.toLowerCase().replace(/\/$/, '');
}

/**
 * Generate a markdown report of the migration status
 */
function generateReport() {
  console.log(`${COLORS.bright}${COLORS.cyan}Analyzing Next.js App Router Migration Progress...${COLORS.reset}\n`);
  
  // Get pages from both routers
  const pagesRouterPages = getPagesRouterPages();
  const appRouterPages = getAppRouterPages();
  const middlewareAppPages = getAppRouterPagesFromMiddleware();
  
  // Normalize routes for comparison
  const normalizedAppRoutes = appRouterPages.map(page => normalizeRoute(page.route));
  const normalizedMiddlewareRoutes = middlewareAppPages.map(route => normalizeRoute(route));
  
  // Categorize pages
  const migrated = [];
  const needsMigration = [];
  const redirectOnly = [];
  const conflicts = [];
  
  // Analyze Pages Router pages
  for (const page of pagesRouterPages) {
    const normalizedRoute = normalizeRoute(page.route);
    const isInAppRouter = normalizedAppRoutes.includes(normalizedRoute);
    const isInMiddleware = normalizedMiddlewareRoutes.includes(normalizedRoute);
    const redirectInfo = checkForRedirects(page.fullPath);
    
    if (isInAppRouter) {
      if (redirectInfo.hasRedirect && redirectInfo.isDeprecated) {
        // Fully migrated with proper redirects
        migrated.push({
          ...page,
          status: 'Complete',
          appRouterPath: appRouterPages.find(p => normalizeRoute(p.route) === normalizedRoute)?.fullPath,
        });
      } else if (redirectInfo.hasRedirect) {
        // Has redirect but not properly marked as deprecated
        migrated.push({
          ...page,
          status: 'Partial (missing @deprecated)',
          appRouterPath: appRouterPages.find(p => normalizeRoute(p.route) === normalizedRoute)?.fullPath,
        });
      } else {
        // Potential conflict - exists in both routers without redirect
        conflicts.push({
          ...page,
          status: 'Conflict',
          appRouterPath: appRouterPages.find(p => normalizeRoute(p.route) === normalizedRoute)?.fullPath,
        });
      }
    } else if (isInMiddleware) {
      if (redirectInfo.hasRedirect) {
        // Listed in middleware and has redirect but no actual page yet
        redirectOnly.push({
          ...page,
          status: 'Redirect Only',
        });
      } else {
        // Listed in middleware but no implementation or redirect
        conflicts.push({
          ...page,
          status: 'Middleware Conflict',
        });
      }
    } else {
      // Needs migration
      needsMigration.push({
        ...page,
        status: 'Not Started',
      });
    }
  }
  
  // Check for App Router pages not in Pages Router (new pages)
  const newPages = appRouterPages.filter(appPage => {
    const normalizedRoute = normalizeRoute(appPage.route);
    return !pagesRouterPages.some(page => normalizeRoute(page.route) === normalizedRoute);
  });
  
  // Generate report
  let report = '# Next.js App Router Migration Status\n\n';
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  report += `Generated on: ${timestamp}\n\n`;
  
  // Summary
  report += '## Summary\n\n';
  report += `- **Total Pages Router Pages**: ${pagesRouterPages.length}\n`;
  report += `- **Total App Router Pages**: ${appRouterPages.length}\n`;
  report += `- **Fully Migrated**: ${migrated.length}\n`;
  report += `- **Redirect Only**: ${redirectOnly.length}\n`;
  report += `- **Needs Migration**: ${needsMigration.length}\n`;
  report += `- **Potential Conflicts**: ${conflicts.length}\n`;
  report += `- **New Pages (App Router Only)**: ${newPages.length}\n\n`;
  
  // Migration Progress
  const progressPercentage = ((migrated.length + redirectOnly.length) / pagesRouterPages.length * 100).toFixed(1);
  report += `## Migration Progress: ${progressPercentage}%\n\n`;
  report += '```\n';
  report += `[${'='.repeat(Math.floor(progressPercentage / 5))}${' '.repeat(20 - Math.floor(progressPercentage / 5))}] ${progressPercentage}%\n`;
  report += '```\n\n';
  
  // Fully Migrated Pages
  report += '## Fully Migrated Pages\n\n';
  if (migrated.length === 0) {
    report += '_No pages have been fully migrated yet._\n\n';
  } else {
    report += '| Pages Router | App Router | Status |\n';
    report += '|-------------|------------|--------|\n';
    for (const page of migrated) {
      const appPath = page.appRouterPath?.replace(APP_DIR, 'src/app') || '';
      report += `| \`${page.file}\` | \`${appPath}\` | ${page.status} |\n`;
    }
    report += '\n';
  }
  
  // Redirect Only Pages
  report += '## Pages with Redirects (Partial Migration)\n\n';
  if (redirectOnly.length === 0) {
    report += '_No pages have redirect-only migration._\n\n';
  } else {
    report += '| Pages Router | Status |\n';
    report += '|-------------|--------|\n';
    for (const page of redirectOnly) {
      report += `| \`${page.file}\` | ${page.status} |\n`;
    }
    report += '\n';
  }
  
  // Needs Migration
  report += '## Pages Needing Migration\n\n';
  if (needsMigration.length === 0) {
    report += '_All pages have been migrated or have redirects in place._\n\n';
  } else {
    report += '| Pages Router | Status |\n';
    report += '|-------------|--------|\n';
    for (const page of needsMigration) {
      report += `| \`${page.file}\` | ${page.status} |\n`;
    }
    report += '\n';
  }
  
  // Potential Conflicts
  report += '## Potential Conflicts\n\n';
  if (conflicts.length === 0) {
    report += '_No conflicts detected._\n\n';
  } else {
    report += '| Pages Router | App Router | Status |\n';
    report += '|-------------|------------|--------|\n';
    for (const page of conflicts) {
      const appPath = page.appRouterPath?.replace(APP_DIR, 'src/app') || 'N/A';
      report += `| \`${page.file}\` | \`${appPath}\` | ${page.status} |\n`;
    }
    report += '\n';
  }
  
  // New Pages
  report += '## New Pages (App Router Only)\n\n';
  if (newPages.length === 0) {
    report += '_No new pages added in App Router._\n\n';
  } else {
    report += '| App Router |\n';
    report += '|-----------|\n';
    for (const page of newPages) {
      const appPath = page.fullPath.replace(APP_DIR, 'src/app');
      report += `| \`${appPath}\` |\n`;
    }
    report += '\n';
  }
  
  // Middleware Configuration
  report += '## Middleware Configuration\n\n';
  report += `The middleware is configured to handle ${middlewareAppPages.length} App Router routes:\n\n`;
  report += '```\n';
  for (const route of middlewareAppPages) {
    report += `${route}\n`;
  }
  report += '```\n\n';
  
  // Next Steps and Recommendations
  report += '## Recommendations\n\n';
  
  if (conflicts.length > 0) {
    report += '⚠️ **Resolve Conflicts**: Address pages that exist in both routers without proper redirects.\n\n';
  }
  
  if (needsMigration.length > 0) {
    report += '🔄 **Continue Migration**: Focus on migrating the remaining pages.\n\n';
  }
  
  if (redirectOnly.length > 0) {
    report += '🔨 **Complete Partial Migrations**: Implement App Router versions for pages that only have redirects.\n\n';
  }
  
  // Write report to file
  const reportPath = path.join(ROOT_DIR, 'migration-status.md');
  fs.writeFileSync(reportPath, report);
  
  // Console output
  console.log(`${COLORS.green}✓ Migration analysis complete!${COLORS.reset}`);
  console.log(`${COLORS.cyan}Summary:${COLORS.reset}`);
  console.log(`  Total Pages Router Pages: ${pagesRouterPages.length}`);
  console.log(`  Total App Router Pages: ${appRouterPages.length}`);
  console.log(`  Fully Migrated: ${migrated.length}`);
  console.log(`  Redirect Only: ${redirectOnly.length}`);
  console.log(`  Needs Migration: ${needsMigration.length}`);
  console.log(`  Potential Conflicts: ${conflicts.length}`);
  console.log(`  New Pages (App Router Only): ${newPages.length}`);
  console.log(`\n${COLORS.yellow}Migration Progress: ${progressPercentage}%${COLORS.reset}`);
  console.log(`[${'='.repeat(Math.floor(progressPercentage / 5))}${' '.repeat(20 - Math.floor(progressPercentage / 5))}] ${progressPercentage}%`);
  console.log(`\n${COLORS.bright}Migration report saved to:${COLORS.reset} migration-status.md`);
  
  return {
    migrated,
    redirectOnly,
    needsMigration,
    conflicts,
    newPages,
    progressPercentage
  };
}

// Run the report generator
generateReport();
