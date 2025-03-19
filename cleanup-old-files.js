// Clean up old files that haven't been edited for more than 3 weeks
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find files that haven't been modified in 3 weeks or more
const findOldFiles = () => {
  try {
    const output = execSync('find /Users/davidcertan/Downloads/project -type f -not -path "*/node_modules/*" -not -path "*/\\.*" -mtime +21 | sort').toString().trim();
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding old files:', error.message);
    return [];
  }
};

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

// Helper function to update imports in a file
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

// Main function
const main = () => {
  // 1. Create archive directories
  console.log('\n=== Step 1: Creating Archive Directories ===');
  const archiveDir = path.join(__dirname, '_archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  // 2. Move outdated (>3 weeks old) files to the archive
  console.log('\n=== Step 2: Archiving Old Unused Files ===');
  const oldFiles = findOldFiles();
  
  console.log(`Found ${oldFiles.length} files that haven't been modified in 3+ weeks`);
  
  // Exclude critical files that shouldn't be moved even if they haven't been modified
  const excludePatterns = [
    '/public/', 
    'package.json',
    'package-lock.json',
    'README',
    'LICENSE',
    '/db/migrations/',
    '/supabase/migrations/',
    '_app.tsx',
    '_document.tsx',
    'layout.tsx',
    'tsconfig.json'
  ];
  
  const filesToArchive = oldFiles.filter(file => {
    // Don't archive if file matches exclude patterns
    return !excludePatterns.some(pattern => file.includes(pattern));
  });
  
  console.log(`Archiving ${filesToArchive.length} files (after excluding critical files)`);
  
  filesToArchive.forEach(file => {
    const relativePath = path.relative(__dirname, file);
    const destination = path.join(archiveDir, relativePath);
    moveFile(file, destination);
  });

  // 3. Consolidate RSC-related files
  console.log('\n=== Step 3: Consolidating RSC-Related Files ===');
  
  // List of RSC-related files that can be moved to the archive
  const rscFiles = [
    'src/rsc-patch.js',
    'src/rsc-patch.ts',
    'src/rsc-client-patch.js',
    'src/rsc-client-patch.ts',
    'src/app/_utils/rsc-patch.js',
    'src/app/rsc-patch.js',
    'src/app.disabled/rsc-patch.js'
  ];
  
  rscFiles.forEach(file => {
    const source = path.join(__dirname, file);
    const relativePath = file;
    const destination = path.join(archiveDir, relativePath);
    moveFile(source, destination);
  });

  // 4. Update imports in the application to use the consolidated patch file
  console.log('\n=== Step 4: Updating Imports ===');
  
  // Find files that might import RSC patches
  try {
    const findCommand = "find /Users/davidcertan/Downloads/project -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \\) -not -path '*/node_modules/*' -not -path '*/_archive/*' -not -path '*/_backups/*' -not -path '*/_oldpages/*' -not -path '*/_oldutils/*'";
    const filesToCheck = execSync(findCommand).toString().trim().split('\n');
    
    // Define the import mappings (old imports -> new imports)
    const importMappings = {
      '../rsc-patch': '@/utils/patches',
      '../rsc-client-patch': '@/utils/patches',
      '@/rsc-patch': '@/utils/patches',
      '@/rsc-client-patch': '@/utils/patches',
      './rsc-patch': '@/utils/patches',
      './rsc-client-patch': '@/utils/patches',
      '@/app/_utils/rsc-patch': '@/utils/patches',
      '@/app/rsc-patch': '@/utils/patches'
    };
    
    // Update imports in all files
    for (const file of filesToCheck) {
      updateImportsInFile(file, importMappings);
    }
  } catch (error) {
    console.error('Error updating imports:', error.message);
  }

  // 5. Move other outdated directories to archive
  console.log('\n=== Step 5: Archiving Outdated Directories ===');
  
  const oldDirs = [
    '_oldpages', 
    '_oldutils'
  ];
  
  // Since _backups is already a legitimate archive, leave it alone
  
  oldDirs.forEach(dirName => {
    const source = path.join(__dirname, dirName);
    const destination = path.join(archiveDir, dirName);
    
    if (fs.existsSync(source)) {
      try {
        // Use execSync to run cp -r to copy directories with all contents
        execSync(`cp -r "${source}" "${destination}"`);
        console.log(`Copied ${source} to ${destination}`);
        
        // Remove the original directory
        execSync(`rm -rf "${source}"`);
        console.log(`Removed original directory ${source}`);
      } catch (error) {
        console.error(`Error moving directory ${source}:`, error.message);
      }
    } else {
      console.log(`Directory not found: ${source}`);
    }
  });

  console.log('\n=== Cleanup Complete ===');
  console.log('Old files have been archived in _archive directory');
  console.log('Imports have been updated to use the consolidated patch files');
};

// Run the main function
main();
