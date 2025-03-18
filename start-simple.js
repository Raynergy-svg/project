// Simple Next.js starter script that bypasses potential watchpack issues
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Next.js in standard mode (avoiding potential Watchpack issues)...');

// Clean the .next cache directory
if (fs.existsSync(path.join(__dirname, '.next'))) {
  console.log('Cleaning .next directory...');
  fs.rmSync(path.join(__dirname, '.next'), { recursive: true, force: true });
}

// Launch Next.js with watchOptions to avoid potential path issues
const nextProcess = spawn('node', [
  'node_modules/next/dist/bin/next',
  'dev',
  '--port',
  '3000',
], {
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    // Avoid watchpack issues by setting more compatible options
    NEXT_IGNORE_DEPRECATED_WORKER: '1',
    // Disable newer experimental features
    __NEXT_DISABLE_MEMORY_WATCHER: '1'
  },
  stdio: 'inherit'
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js process:', err);
});

process.on('SIGINT', () => {
  console.log('Shutting down Next.js...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});
