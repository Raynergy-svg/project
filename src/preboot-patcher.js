/**
 * Pre-boot patcher script to fix specific Node.js errors that might occur
 * during Next.js startup before normal error handling is initialized.
 *
 * This is especially useful for catching the "to" argument error in react-router.
 */

// Import required modules
import path from "path";
import { fileURLToPath, URL } from "url";

// Patch for the specific "to" argument error in Node's path module
// The error occurs when fileURLToPath or similar functions are called
// with undefined arguments
const originalPathResolve = path.resolve;
path.resolve = function (...args) {
  // Check for undefined arguments and replace with safe defaults
  const safeArgs = args.map((arg) =>
    arg !== undefined && arg !== null ? arg : "."
  );
  return originalPathResolve.apply(this, safeArgs);
};

// Patch URL constructor to handle undefined URLs
const originalURL = URL;
global.URL = function (url, base) {
  if (url === undefined || url === null) {
    console.warn(
      "[PreBoot] Prevented URL constructor with undefined url parameter"
    );
    url = "about:blank"; // Use a safe default
  }
  return new originalURL(url, base);
};

// Patch fileURLToPath to handle undefined URLs
const originalFileURLToPath = fileURLToPath;
if (typeof fileURLToPath === "function") {
  globalThis.originalFileURLToPath = fileURLToPath;
  globalThis.fileURLToPath = function (url) {
    if (url === undefined || url === null) {
      console.warn(
        "[PreBoot] Prevented fileURLToPath with undefined url parameter"
      );
      return "."; // Return a safe default path
    }

    // If it's not a URL object already, try to create one
    if (!(url instanceof URL)) {
      try {
        url = new URL(url);
      } catch (e) {
        console.warn("[PreBoot] Error converting string to URL:", e);
        return "."; // Return a safe default path
      }
    }

    return originalFileURLToPath(url);
  };
}

// Export a dummy function so this can be imported as a module
export default function installPatcher() {
  console.log("[PreBoot] Path resolution and URL patchers installed");
}

// Install global handlers for uncaught errors
if (typeof process !== "undefined") {
  process.on("uncaughtException", (error) => {
    // Check for path "to" argument error
    if (
      error &&
      error.code === "ERR_INVALID_ARG_TYPE" &&
      error.message &&
      error.message.includes('The "to" argument must be of type string')
    ) {
      console.warn('[PreBoot] Intercepted "to" argument error:', error.message);
      // Don't let the process crash - this is a non-fatal error
      return;
    }

    // For other errors, log them but don't exit in development
    console.error("[PreBoot] Uncaught exception:", error);
    if (process.env.NODE_ENV !== "development") {
      // In production, we should exit for unhandled errors
      process.exit(1);
    }
  });
}
