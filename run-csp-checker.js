import fs from "fs";
import path from "path";
import http from "http";
import { exec } from "child_process";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSP checker script
const cspCheckerScript = fs.readFileSync(
  path.join(__dirname, "csp-checker.js"),
  "utf8"
);

console.log("CSP Checker Server");
console.log("------------------");
console.log("This script will run a small server to check for CSP violations");

// Create a simple server to serve the CSP checker
const server = http.createServer((req, res) => {
  if (req.url === "/check-csp") {
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CSP Checker</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; background: #1E1E1E; color: #fff; }
          pre { background: #333; padding: 1rem; overflow: auto; border-radius: 4px; }
          .success { color: #88B04B; }
          .error { color: #ff5555; }
          .info { color: #5bc0de; }
          h2 { margin-top: 2rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
          img { max-width: 200px; border: 1px solid #444; margin: 0.5rem; }
          #results { margin-top: 2rem; }
          button { background: #88B04B; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
          button:hover { background: #7a9d42; }
        </style>
      </head>
      <body>
        <h1>CSP Violation Checker</h1>
        <p>This page will test loading resources from various sources to check your Content Security Policy.</p>
        
        <h2>Test Resources</h2>
        <div id="test-container">
          <h3>Unsplash Images (should load)</h3>
          <div>
            <img src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=200" alt="Test image 1">
            <img src="https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=200" alt="Test image 2">
            <img src="https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=200" alt="Test image 3">
          </div>
        </div>
        
        <h2>Results</h2>
        <div id="results">
          <p>Checking resources...</p>
        </div>
        
        <h2>Console Output</h2>
        <pre id="console-output"></pre>
        
        <div style="margin-top: 2rem;">
          <button id="test-again">Test Again</button>
          <button id="check-app" onclick="window.open('https://localhost:5173', '_blank')">Check Main App</button>
        </div>
        
        <script>
          // Override console.log to capture output
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
          };
          
          const consoleOutput = document.getElementById('console-output');
          const results = document.getElementById('results');
          
          function logToPage(type, ...args) {
            originalConsole[type](...args);
            
            const message = args.map(arg => {
              if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
              }
              return String(arg);
            }).join(' ');
            
            const entry = document.createElement('div');
            entry.className = type;
            entry.textContent = \`[\${type.toUpperCase()}] \${message}\`;
            consoleOutput.appendChild(entry);
          }
          
          console.log = (...args) => logToPage('log', ...args);
          console.error = (...args) => logToPage('error', ...args);
          console.warn = (...args) => logToPage('warn', ...args);
          console.info = (...args) => logToPage('info', ...args);
          
          // Add CSP violation listener
          document.addEventListener('securitypolicyviolation', (e) => {
            console.error('CSP Violation:', {
              blockedURI: e.blockedURI,
              violatedDirective: e.violatedDirective,
              originalPolicy: e.originalPolicy
            });
            
            const violation = document.createElement('div');
            violation.className = 'error';
            violation.innerHTML = \`
              <strong>CSP Violation Detected:</strong>
              <ul>
                <li>Blocked URI: \${e.blockedURI}</li>
                <li>Violated Directive: \${e.violatedDirective}</li>
              </ul>
            \`;
            results.appendChild(violation);
          });
          
          // Run the CSP checker script
          ${cspCheckerScript}
          
          // Check image loading
          setTimeout(() => {
            const images = document.querySelectorAll('img');
            let allLoaded = true;
            
            const loadStatus = document.createElement('div');
            loadStatus.innerHTML = '<h3>Image Loading Status:</h3><ul></ul>';
            const statusList = loadStatus.querySelector('ul');
            
            images.forEach(img => {
              const listItem = document.createElement('li');
              if (img.complete && img.naturalWidth > 0) {
                listItem.className = 'success';
                listItem.textContent = \`✅ \${img.src.split('/').pop().split('?')[0]} loaded successfully\`;
              } else {
                listItem.className = 'error';
                listItem.textContent = \`❌ \${img.src.split('/').pop().split('?')[0]} failed to load\`;
                allLoaded = false;
              }
              statusList.appendChild(listItem);
            });
            
            results.appendChild(loadStatus);
            
            const summary = document.createElement('div');
            if (allLoaded) {
              summary.className = 'success';
              summary.innerHTML = '<strong>✅ All images loaded successfully! Your CSP is correctly configured.</strong>';
            } else {
              summary.className = 'error';
              summary.innerHTML = '<strong>❌ Some images failed to load. Check your CSP configuration.</strong>';
            }
            results.appendChild(summary);
          }, 3000);
          
          // Add refresh button handler
          document.getElementById('test-again').addEventListener('click', () => {
            window.location.reload();
          });
        </script>
      </body>
      </html>
    `);
  } else {
    res.statusCode = 302;
    res.setHeader("Location", "/check-csp");
    res.end();
  }
});

const port = 3333;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/check-csp`);
  console.log("Opening browser...");

  // Open browser
  const openCommand =
    process.platform === "darwin"
      ? `open http://localhost:${port}/check-csp`
      : process.platform === "win32"
      ? `start http://localhost:${port}/check-csp`
      : `xdg-open http://localhost:${port}/check-csp`;

  exec(openCommand);

  console.log("\nPress Ctrl+C to stop the server when done.");
});
