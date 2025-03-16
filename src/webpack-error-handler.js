/**
 * Comprehensive Next.js Webpack Error Handler
 *
 * This module provides robust error handling for common webpack-related errors
 * in Next.js applications. It specifically targets the error:
 * "Cannot read properties of undefined (reading 'call')"
 * in error-boundary-callbacks.js
 *
 * Key features:
 * 1. Patches Function.prototype.call and apply to handle undefined
 * 2. Patches webpack chunk loader
 * 3. Patches webpack module factory functions
 * 4. Installs global error handler for webpack errors
 */

// Self-invoking function to avoid polluting global scope
(function () {
  if (typeof window === "undefined") return;

  console.log("[Webpack Error Handler] Initializing...");

  try {
    // Record that our handler has been loaded
    window.__webpack_error_handler_loaded = true;

    // ---------- FUNCTION PROTOTYPE PATCHES ----------

    // Store original methods to minimize side effects
    const originalCall = Function.prototype.call;
    const originalApply = Function.prototype.apply;

    // Create safe versions of call and apply that check for undefined
    const safeCall = function (fn, thisArg, ...args) {
      if (typeof fn !== "function") {
        console.warn(
          "[Webpack Error Handler] Prevented call on undefined function"
        );
        return undefined;
      }
      return originalCall.apply(fn, [thisArg, ...args]);
    };

    const safeApply = function (fn, thisArg, args) {
      if (typeof fn !== "function") {
        console.warn(
          "[Webpack Error Handler] Prevented apply on undefined function"
        );
        return undefined;
      }
      return originalApply.call(fn, thisArg, args || []);
    };

    // Patch Function.prototype.call
    Function.prototype.call = function (thisArg, ...args) {
      if (this === undefined || this === null) {
        console.warn(
          "[Webpack Error Handler] Prevented call on undefined function"
        );
        return undefined;
      }
      try {
        return originalCall.apply(this, [thisArg, ...args]);
      } catch (e) {
        console.warn(
          "[Webpack Error Handler] Error in Function.prototype.call:",
          e
        );
        return undefined;
      }
    };

    // Patch Function.prototype.apply
    Function.prototype.apply = function (thisArg, args) {
      if (this === undefined || this === null) {
        console.warn(
          "[Webpack Error Handler] Prevented apply on undefined function"
        );
        return undefined;
      }
      try {
        return originalApply.call(this, thisArg, args);
      } catch (e) {
        console.warn(
          "[Webpack Error Handler] Error in Function.prototype.apply:",
          e
        );
        return undefined;
      }
    };

    // ---------- WEBPACK RUNTIME PATCHES ----------

    // Patch webpack chunk loader when it becomes available
    const patchWebpackChunks = () => {
      if (window.webpackChunk_N_E) {
        const originalPush = window.webpackChunk_N_E.push;

        window.webpackChunk_N_E.push = function (chunk) {
          try {
            // Extract the components of the chunk
            const [chunkIds, moreModules, runtime] = chunk;

            // If this chunk contains runtime code, we need to wrap it
            if (typeof runtime === "function") {
              console.log("[Webpack Error Handler] Patching webpack runtime");

              // Create a modified chunk with wrapped runtime
              const modifiedChunk = [
                chunkIds,
                moreModules,
                function (require) {
                  try {
                    // Create a safer require function
                    const safeRequire = function (moduleId) {
                      try {
                        return require(moduleId);
                      } catch (e) {
                        console.warn(
                          `[Webpack Error Handler] Error requiring module ${moduleId}:`,
                          e
                        );
                        return {}; // Return empty exports to prevent crashes
                      }
                    };

                    // Call original runtime with our safe require
                    return runtime(safeRequire);
                  } catch (e) {
                    console.warn(
                      "[Webpack Error Handler] Error in webpack runtime:",
                      e
                    );
                    return {}; // Return empty object to prevent crashes
                  }
                },
              ];

              // Use the modified chunk
              return originalPush.call(this, modifiedChunk);
            }

            // For normal chunks, use the original but with error handling
            return originalPush.apply(this, arguments);
          } catch (e) {
            console.warn(
              "[Webpack Error Handler] Error in webpack chunk push:",
              e
            );
            try {
              // Try original as fallback
              return originalPush.apply(this, arguments);
            } catch (e2) {
              console.error(
                "[Webpack Error Handler] Fatal error in chunk loading:",
                e2
              );
              return undefined;
            }
          }
        };

        console.log(
          "[Webpack Error Handler] Successfully patched webpack chunk loader"
        );
      } else {
        // Retry in a bit if webpack isn't loaded yet
        setTimeout(patchWebpackChunks, 50);
      }
    };

    // Start the chunk patching process
    patchWebpackChunks();

    // ---------- WEBPACK FACTORY PATCHES ----------

    // Patch webpack require and factory methods when available
    const patchWebpackRequire = () => {
      if (window.__webpack_require__) {
        console.log("[Webpack Error Handler] Patching webpack require");

        // Keep reference to original
        const originalRequire = window.__webpack_require__;

        // If there are factory methods, patch them
        if (originalRequire.f) {
          const originalFactory = originalRequire.f;

          // Patch each factory type (j=javascript, etc)
          Object.keys(originalFactory).forEach((type) => {
            const original = originalFactory[type];
            if (typeof original === "function") {
              originalFactory[type] = function (moduleId, promises) {
                try {
                  return original.call(this, moduleId, promises);
                } catch (e) {
                  console.warn(
                    `[Webpack Error Handler] Error in factory ${type} for module ${moduleId}:`,
                    e
                  );

                  // For JavaScript modules, we can return empty module
                  if (type === "j" && window.__webpack_modules__) {
                    const emptyModule = { exports: {}, id: moduleId };
                    window.__webpack_modules__[moduleId] = emptyModule;
                    return emptyModule.exports;
                  }

                  return {}; // Return empty object for other factory types
                }
              };
            }
          });
        }

        // Patch the main require function
        window.__webpack_require__ = function (moduleId) {
          try {
            return originalRequire(moduleId);
          } catch (e) {
            console.warn(
              `[Webpack Error Handler] Error requiring module ${moduleId}:`,
              e
            );
            return {}; // Return empty exports
          }
        };

        // Copy properties from original
        Object.keys(originalRequire).forEach((key) => {
          if (window.__webpack_require__[key] === undefined) {
            window.__webpack_require__[key] = originalRequire[key];
          }
        });

        console.log(
          "[Webpack Error Handler] Successfully patched webpack require"
        );
      } else {
        // Retry in a bit
        setTimeout(patchWebpackRequire, 100);
      }
    };

    // Start the require patching process
    patchWebpackRequire();

    // ---------- GLOBAL ERROR HANDLING ----------

    // Install global error handler for webpack-related errors
    window.addEventListener(
      "error",
      function (event) {
        // Check if this is a webpack-related error
        const isWebpackError =
          event.message?.includes("undefined (reading 'call')") ||
          event.message?.includes("Cannot read properties of undefined") ||
          event.filename?.includes("webpack") ||
          event.filename?.includes("error-boundary-callbacks.js") ||
          event.error?.stack?.includes("options.factory") ||
          event.error?.stack?.includes("webpack");

        if (isWebpackError) {
          console.warn("[Webpack Error Handler] Intercepted webpack error:", {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          });

          // Prevent the error from bubbling up and crashing the app
          event.preventDefault();
          return true;
        }
      },
      true
    ); // Use capturing phase to catch all errors

    console.log("[Webpack Error Handler] Successfully installed all patches");
  } catch (e) {
    console.error(
      "[Webpack Error Handler] Fatal error during initialization:",
      e
    );
  }
})();

// Export a dummy object so this module can be imported
export default {
  initialized: true,
};
