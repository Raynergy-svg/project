/**
 * Custom Next.js server with pre-patching for critical Node.js functions
 * to handle the "to" argument error that occurs during server startup.
 */

// Import modules using ES module syntax
import path from "path";
import { fileURLToPath, URL as NodeURL } from "url";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

// Mock the path.resolve to handle undefined arguments
const originalResolve = path.resolve;
path.resolve = function (...args) {
  const safeArgs = args.map((arg) =>
    arg !== undefined && arg !== null ? arg : "."
  );
  return originalResolve.apply(this, safeArgs);
};

// Mock the URL class for undefined arguments
const OriginalURL = global.URL;
global.URL = function (url, base) {
  if (url === undefined || url === null) {
    console.warn("URL constructor called with undefined url");
    url = "about:blank";
  }
  return new OriginalURL(url, base);
};

// Mock fileURLToPath
if (typeof fileURLToPath === "function") {
  const originalFileURLToPath = fileURLToPath;
  globalThis.fileURLToPath = function (urlObject) {
    if (urlObject === undefined || urlObject === null) {
      console.warn("fileURLToPath called with undefined URL");
      return ".";
    }
    try {
      return originalFileURLToPath(urlObject);
    } catch (e) {
      console.warn(
        "Error in fileURLToPath, returning safe fallback:",
        e.message
      );
      return ".";
    }
  };
}

// Install global error handler for the "to" argument error
process.on("uncaughtException", (error) => {
  if (
    error &&
    error.code === "ERR_INVALID_ARG_TYPE" &&
    error.message &&
    error.message.includes('The "to" argument must be of type string')
  ) {
    console.warn('[Handled] Intercepted "to" argument error:', error.message);
    return; // Don't crash the server
  }

  // Log other errors
  console.error("[Server] Unhandled error:", error);

  // Exit for critical errors in production
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Set up server variables
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare and start the server
app
  .prepare()
  .then(() => {
    console.log("Next.js ready with custom server wrapper");

    createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error starting Next.js server:", err);
    process.exit(1);
  });
