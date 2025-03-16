/**
 * This script verifies that no react-router-dom imports remain
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function checkReactRouterImports() {
  try {
    const { stdout } = await execPromise('grep -r "from [\'\\\"]react-router-dom[\'\\\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/');
    
    if (stdout.trim()) {
      console.error('Found remaining react-router-dom imports:');
      console.error(stdout);
      return false;
    } else {
      console.log('No react-router-dom imports found. All imports have been successfully replaced.');
      return true;
    }
  } catch (error) {
    // If grep doesn't find any matches, it returns exit code 1
    if (error.code === 1 && !error.stdout.trim()) {
      console.log('No react-router-dom imports found. All imports have been successfully replaced.');
      return true;
    }
    
    console.error('Error checking imports:', error);
    return false;
  }
}

// Run the verification
checkReactRouterImports(); 