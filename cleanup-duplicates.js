// Clean up duplicate files and resolve routing conflicts in Next.js project
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to move files
const moveFile = (source, destination) => {
  try {
    if (fs.existsSync(source)) {
      // Create destination directory if it doesn't exist
      const dir = path.dirname(destination);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(source, destination);
      console.log(`Moved ${source} to ${destination}`);
      return true;
    } else {
      console.warn(`Source file not found: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`Error moving ${source} to ${destination}: ${error.message}`);
    return false;
  }
};

// 1. Remove backup files (move them to _backups directory)
console.log('\n=== Step 1: Moving Backup Files ===');
const backupDir = path.join(__dirname, '_backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const backupFiles = [
  'src/pages/Dashboard/index.tsx.old',
  'src/pages/Dashboard.tsx.backup',
  'src/pages/Help.tsx.backup',
  'src/pages/Settings/index.tsx.old',
  'src/pages/Settings-old.tsx.backup',
  'src/pages/Settings.tsx.backup',
  'src/pages/security.tsx.backup'
];

backupFiles.forEach(file => {
  const source = path.join(__dirname, file);
  const destination = path.join(backupDir, file);
  moveFile(source, destination);
});

// 2. Fix routing conflicts between pages and app directories
console.log('\n=== Step 2: Resolving Routing Conflicts ===');

// Move conflicting pages to _oldpages directory
const oldPagesDir = path.join(__dirname, '_oldpages');
if (!fs.existsSync(oldPagesDir)) {
  fs.mkdirSync(oldPagesDir, { recursive: true });
}

// List of files in pages directory that should be moved because they conflict with app routes
const conflictingPages = [
  // Files we previously renamed and confirmed conflicts
  'src/pages/Help.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Dashboard/index.tsx',
  // Additional conflicts from root pages that match app routes
  'src/pages/Landing.tsx',
  'src/pages/ApiDocs.tsx',
  'src/pages/Docs.tsx',
  'src/pages/Support.tsx',
  'src/pages/api-docs.tsx'
];

conflictingPages.forEach(file => {
  const source = path.join(__dirname, file);
  const destination = path.join(oldPagesDir, file);
  moveFile(source, destination);
});

// 3. Fix non-compliant app router files
console.log('\n=== Step 3: Fixing Non-Compliant App Router Files ===');

// Move these to a utils directory within app
const appUtilsDir = path.join(__dirname, 'src/app/_utils');
if (!fs.existsSync(appUtilsDir)) {
  fs.mkdirSync(appUtilsDir, { recursive: true });
}

const nonCompliantAppFiles = [
  'src/app/not-found-fix.tsx',
  'src/app/rsc-patch.js'
];

nonCompliantAppFiles.forEach(file => {
  const source = path.join(__dirname, file);
  const basename = path.basename(file);
  const destination = path.join(appUtilsDir, basename);
  moveFile(source, destination);
});

// 4. Fix duplicate js/ts files (typically webpack patches)
console.log('\n=== Step 4: Consolidating Duplicate JS/TS Files ===');

// Move duplicate js versions to _oldutils
const oldUtilsDir = path.join(__dirname, '_oldutils');
if (!fs.existsSync(oldUtilsDir)) {
  fs.mkdirSync(oldUtilsDir, { recursive: true });
}

const duplicateJsFiles = [
  'src/utils/webpackPatch.js',
  'src/utils/webpack-factory-patch.js',
  'src/utils/error-boundary-patch.js',
  'src/utils/env-loader.js',
  'src/webpack-error-handler.js',
  'src/rsc-client-patch.js',
  'src/rsc-patch.js'
];

duplicateJsFiles.forEach(file => {
  const source = path.join(__dirname, file);
  const destination = path.join(oldUtilsDir, file);
  moveFile(source, destination);
});

// 5. Update imports in app/page.tsx to use the new locations
console.log('\n=== Step 5: Updating Imports in App Files ===');

// Function to update imports in a file
const updateImportsInFile = (filePath, importMappings) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found for import updates: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      const regex = new RegExp(`import\\s+(.*)\\s+from\\s+['"]${oldImport}['"]`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `import $1 from '${newImport}'`);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated imports in ${filePath}`);
      return true;
    } else {
      console.log(`No matching imports found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating imports in ${filePath}: ${error.message}`);
    return false;
  }
};

// Update imports in app/page.tsx
const appPagePath = path.join(__dirname, 'src/app/page.tsx');
updateImportsInFile(appPagePath, {
  '@/app/not-found-fix': '@/app/_utils/not-found-fix',
  '@/app/rsc-patch': '@/app/_utils/rsc-patch'
});

// Update imports in app/layout.tsx
const appLayoutPath = path.join(__dirname, 'src/app/layout.tsx');
updateImportsInFile(appLayoutPath, {
  '@/app/not-found-fix': '@/app/_utils/not-found-fix',
  '@/app/rsc-patch': '@/app/_utils/rsc-patch'
});

console.log('\n=== Cleanup Complete ===');
console.log('You should now be able to run the Next.js dev server without routing conflicts.');
console.log('If you encounter any issues, check import paths in your files.');
