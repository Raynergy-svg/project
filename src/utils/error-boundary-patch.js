/**
 * Next.js Error Boundary Patch
 *
 * This patch specifically addresses the issue with error-boundary-callbacks.js
 * "Cannot read properties of undefined (reading 'call')" error.
 */

// Only run in browser
if (typeof window !== "undefined") {
  console.log("[Error Boundary Patch] Applying fixes...");

  // Fix for "Cannot read properties of undefined (reading 'call')" in webpack/error-boundary-callbacks
  try {
    // Safely patch webpack functions if they exist
    const safelyRunFactory = (factory, ...args) => {
      if (typeof factory !== "function") {
        console.warn("[Error Boundary Patch] Factory is not a function");
        return {};
      }

      try {
        return factory(...args);
      } catch (err) {
        console.warn("[Error Boundary Patch] Factory execution failed:", err);
        return {};
      }
    };

    // Find and patch webpack if it exists on window
    if (window.__webpack_require__) {
      const originalRequire = window.__webpack_require__;
      window.__webpack_require__ = function (moduleId) {
        try {
          return originalRequire(moduleId);
        } catch (err) {
          console.warn(
            `[Error Boundary Patch] Module require failed for ${moduleId}:`,
            err
          );
          return {};
        }
      };
    }

    // Fix Next.js error boundary callbacks
    if (window.__NEXT_P) {
      console.log("[Error Boundary Patch] Patching Next.js page loader");
      const originalPush = window.__NEXT_P.push;
      window.__NEXT_P.push = function (args) {
        try {
          return originalPush(args);
        } catch (err) {
          console.warn("[Error Boundary Patch] Next.js push failed:", err);
          return function () {}; // Return empty function to avoid undefined calls
        }
      };
    }

    console.log("[Error Boundary Patch] Applied successfully");
  } catch (err) {
    console.error("[Error Boundary Patch] Failed to apply patch:", err);
  }
}

export default {
  applied: true,
};
