#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the TypeScript script
const scriptPath = join(__dirname, '..', 'src', 'scripts', 'create-admin.ts');

// Run the TypeScript script using ts-node
const tsNode = spawn('npx', ['ts-node', scriptPath], {
  stdio: 'inherit',
  shell: true
});

tsNode.on('error', (error) => {
  console.error('Failed to start script:', error);
  process.exit(1);
});

tsNode.on('close', (code) => {
  if (code !== 0) {
    console.error(`Script exited with code ${code}`);
    process.exit(code);
  }
}); 