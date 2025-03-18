// Simple Express server to serve static Next.js export
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Directory to serve static files from
const staticDir = path.join(__dirname, 'out');

// Check if the 'out' directory exists, if not, build the app
async function ensureBuilt() {
  if (!fs.existsSync(staticDir)) {
    console.log('Static export not found, building the project...');
    try {
      await execAsync('npm run build && npm run export');
      console.log('Build and export completed successfully');
    } catch (error) {
      console.error('Error building the project:', error);
      process.exit(1);
    }
  }
}

// Serve static files
app.use(express.static(staticDir));

// Handle all routes by serving the index.html
app.get('*', (req, res) => {
  // First try to serve the exact path
  const requestedPath = path.join(staticDir, req.path);
  
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    return res.sendFile(requestedPath);
  }
  
  // Then try to serve the path with /index.html appended
  const indexPath = path.join(staticDir, req.path, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // Fall back to the root index.html
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start the server
async function startServer() {
  await ensureBuilt();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`Serving static content from ${staticDir}`);
  });
}

startServer().catch(console.error);
