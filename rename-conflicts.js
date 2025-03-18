// Script to resolve conflicting routes in Next.js project
import fs from 'fs';
import path from 'path';

const conflictingRoutes = [
  // Format: [path to rename, new path]
  ['src/pages/Dashboard/index.tsx.backup', 'src/pages/Dashboard/index.tsx.old'],
  ['src/pages/Settings/index.tsx.backup', 'src/pages/Settings/index.tsx.old'],
  ['src/pages/Help.tsx', 'src/pages/Help.tsx.backup'],
  ['src/pages/Dashboard.tsx', 'src/pages/Dashboard.tsx.backup'],
  ['src/pages/Settings.tsx', 'src/pages/Settings.tsx.backup'],
  ['src/pages/Settings-old.tsx', 'src/pages/Settings-old.tsx.backup'],
];

// Rename conflicting files
conflictingRoutes.forEach(([oldPath, newPath]) => {
  try {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${oldPath} to ${newPath}`);
    } else {
      console.log(`File not found: ${oldPath}`);
    }
  } catch (error) {
    console.error(`Error renaming ${oldPath}:`, error.message);
  }
});

console.log('Conflict resolution complete');
