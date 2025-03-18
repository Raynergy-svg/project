// Find duplicate routes and conflicting files in Next.js project
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const appDir = path.join(srcDir, 'app');

// Helper function to normalize route paths for comparison
const normalizeRoutePath = (filePath, baseDir) => {
  // Get relative path from pages or app directory
  const relativePath = path.relative(baseDir, filePath);
  
  // Remove file extension
  let routePath = relativePath.replace(/\.(js|jsx|ts|tsx)$/, '');
  
  // Convert index files to directory paths
  routePath = routePath.replace(/\/index$/, '');
  
  // Convert [param] to :param for comparison
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Ensure root path is represented as / not empty string
  if (routePath === '') routePath = '/';
  
  return routePath.toLowerCase();
};

// Walk directory recursively to find all files
const walkDir = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile()) {
      callback(filePath);
    }
  }
};

// Find backup and old files
console.log('\n=== Backup and Old Files ===');
walkDir(srcDir, (filePath) => {
  if (/\.(backup|old|bak)$/.test(filePath) || /-old\.(js|jsx|ts|tsx)$/.test(filePath)) {
    console.log(`Backup file: ${path.relative(__dirname, filePath)}`);
  }
});

// Find duplicate files with same name but different extension
console.log('\n=== Files with Same Name but Different Extensions ===');
const filesByBaseName = new Map();

walkDir(srcDir, (filePath) => {
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath).split('.')[0];
  const key = path.join(dir, basename);
  
  if (!filesByBaseName.has(key)) {
    filesByBaseName.set(key, []);
  }
  
  filesByBaseName.get(key).push(filePath);
});

for (const [basePath, files] of filesByBaseName.entries()) {
  if (files.length > 1) {
    console.log(`Files with same base name "${path.basename(basePath)}" in "${path.dirname(path.relative(__dirname, basePath))}"`);
    files.forEach(file => console.log(`  - ${path.relative(__dirname, file)}`));
  }
}

// Find conflicts between pages and app directory
console.log('\n=== Pages/App Directory Route Conflicts ===');
const appRoutes = new Map();
const pagesRoutes = new Map();

// Collect app routes
if (fs.existsSync(appDir)) {
  walkDir(appDir, (filePath) => {
    if (
      /page\.(js|jsx|ts|tsx)$/.test(filePath) ||
      /route\.(js|jsx|ts|tsx)$/.test(filePath)
    ) {
      const routePath = normalizeRoutePath(filePath, appDir);
      appRoutes.set(routePath, filePath);
    }
  });
}

// Collect pages routes
if (fs.existsSync(pagesDir)) {
  walkDir(pagesDir, (filePath) => {
    if (/\.(js|jsx|ts|tsx)$/.test(filePath) && 
        !/^_/.test(path.basename(filePath)) && 
        !/api\//.test(path.relative(pagesDir, filePath))) {
      const routePath = normalizeRoutePath(filePath, pagesDir);
      pagesRoutes.set(routePath, filePath);
    }
  });
}

// Check for conflicts
for (const [route, appFile] of appRoutes.entries()) {
  if (pagesRoutes.has(route)) {
    console.log(`Route conflict for "${route}":`);
    console.log(`  - App Router: ${path.relative(__dirname, appFile)}`);
    console.log(`  - Pages Router: ${path.relative(__dirname, pagesRoutes.get(route))}`);
  }
}

// Find non-compliant app router pages (files at root of app directory)
console.log('\n=== Non-Compliant App Router Files ===');
if (fs.existsSync(appDir)) {
  const files = fs.readdirSync(appDir);
  for (const file of files) {
    const filePath = path.join(appDir, file);
    if (fs.statSync(filePath).isFile() && 
        /\.(js|jsx|ts|tsx)$/.test(file) && 
        !['layout.tsx', 'page.tsx', 'loading.tsx', 'error.tsx', 'not-found.tsx', 'global-error.tsx'].includes(file)) {
      console.log(`Non-standard app file: ${path.relative(__dirname, filePath)}`);
    }
  }
}

console.log('\n=== Analysis Complete ===');
