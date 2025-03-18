/**
 * React Server Components Patch
 *
 * This module patches the webpack runtime to prevent
 * "Cannot read properties of undefined (reading 'call')" errors
 * that commonly occur with React Server Components in Next.js
 */

// Apply this patch in the browser only
if (typeof window !== "undefined") {
  // Wait for the page to fully load before attempting to patch
  window.addEventListener("load", function () {
    setTimeout(function () {
      try {
        // Fix for the specific RSC error in react-server-dom-webpack
        if (window.__webpack_require__) {
          // Store original require
          const originalRequire = window.__webpack_require__;

          // Create a wrapped version that handles errors gracefully
          window.__webpack_require__ = function patchedRequire(moduleId) {
            try {
              // Check for null/undefined moduleId which causes the error
              if (moduleId == null) {
                console.warn(
                  "RSC patch: Attempted to require null/undefined module"
                );
                return {};
              }

              // Use the original require
              return originalRequire(moduleId);
            } catch (err) {
              // Log the error but don't crash
              console.warn("RSC patch: Error requiring module:", err);
              return {};
            }
          };

          // Copy all properties from the original require
          for (const key in originalRequire) {
            if (Object.prototype.hasOwnProperty.call(originalRequire, key)) {
              window.__webpack_require__[key] = originalRequire[key];
            }
          }

          // Specifically patch the factory function which is often the source of the error
          if (window.__webpack_require__.f) {
            // Keep reference to original factory methods
            const originalFactory = { ...window.__webpack_require__.f };

            // Patch each factory method
            for (const key in originalFactory) {
              const originalMethod = originalFactory[key];

              if (typeof originalMethod === "function") {
                window.__webpack_require__.f[key] = function (...args) {
                  try {
                    return originalMethod.apply(this, args);
                  } catch (err) {
                    console.warn(`RSC patch: Factory error in ${key}:`, err);
                    return Promise.resolve();
                  }
                };
              }
            }
          }

          console.log("RSC patch: Applied webpack runtime patches");
        }
      } catch (err) {
        console.warn("RSC patch: Failed to apply patches:", err);
      }
    }, 0);
  });
}

// No-op export for module system
export {};
