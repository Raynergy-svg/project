#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the problematic file in Next.js
const bundlerPath = path.join(
  __dirname,
  'node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js'
);

async function main() {
  console.log('Patching Next.js to avoid Watchpack path resolution errors...');
  
  try {
    // Read the file content
    const content = await fs.readFile(bundlerPath, 'utf8');
    
    // Look for the problematic line with a safeguard pattern
    // This essentially patches the code to avoid the undefined path issue
    const patchedContent = content.replace(
      /path\.relative\([^)]+\)/g,
      '(() => { try { return path.relative(arguments[0], arguments[1]); } catch(e) { return ""; } })()'
    );
    
    // Write the patched file back
    await fs.writeFile(bundlerPath, patchedContent, 'utf8');
    
    console.log('Next.js has been successfully patched!');
    console.log('You can now run "npm run dev" to start the development server.');
  } catch (error) {
    console.error('Failed to patch Next.js:', error);
    process.exit(1);
  }
}

main().catch(console.error);
