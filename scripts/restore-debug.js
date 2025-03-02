/**
 * Restore Debug Files Script
 * 
 * This script restores debug files that were disabled before a production build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../.debug-backup');
if (!fs.existsSync(BACKUP_DIR)) {
  console.log('No backup directory found. Nothing to restore.');
  process.exit(0);
}

// Function to restore a file from backup
const restoreFile = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  const backupPath = path.join(BACKUP_DIR, filePath);
  
  if (!fs.existsSync(backupPath)) {
    console.log(`No backup found for: ${filePath}`);
    return;
  }
  
  fs.copyFileSync(backupPath, fullPath);
  console.log(`Restored: ${filePath}`);
};

// Function to restore a directory
const restoreDirectory = (dirPath) => {
  const fullPath = path.join(__dirname, '..', dirPath);
  
  // Remove the .productionignore file
  const ignoreFile = path.join(fullPath, '.productionignore');
  if (fs.existsSync(ignoreFile)) {
    fs.unlinkSync(ignoreFile);
    console.log(`Removed .productionignore from: ${dirPath}`);
  }
  
  // Remove the empty index file
  const indexFile = path.join(fullPath, 'index.ts');
  if (fs.existsSync(indexFile)) {
    // Only remove if it's our placeholder
    const content = fs.readFileSync(indexFile, 'utf8');
    if (content.includes('excluded from production builds')) {
      fs.unlinkSync(indexFile);
      console.log(`Removed placeholder index.ts from: ${dirPath}`);
    }
  }
};

// Restore all files and directories in the backup
console.log('Restoring debug files...');

// Walk through the backup directory and restore all files
const walkAndRestore = (dir, basePath = '') => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullBackupPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      walkAndRestore(fullBackupPath, relativePath);
    } else {
      const targetPath = path.join(__dirname, '..', relativePath);
      const targetDir = path.dirname(targetPath);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(fullBackupPath, targetPath);
      console.log(`Restored: ${relativePath}`);
    }
  }
};

if (fs.existsSync(BACKUP_DIR)) {
  walkAndRestore(BACKUP_DIR);
  
  // Restore directory settings for debug directories
  const dirs = ["src/components/debug"];
  dirs.forEach(restoreDirectory);
  
  console.log('Debug files have been restored.');
}
