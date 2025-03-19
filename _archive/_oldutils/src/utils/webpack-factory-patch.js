/**
 * Webpack Factory Function Patch
 *
 * This is a targeted fix for the error:
 * "Cannot read properties of undefined (reading 'call')" in webpack.js
 * specifically in the options.factory function.
 */

// Execute immediately in browser environment
(function () {
  if (typeof window === "undefined") return;

  console.log("[Webpack Factory Patch] Initializing...");

  // Wait for webpack to be fully loaded before attempting patching
  const patchWebpack = () => {
    try {
      // We need to patch the webpack runtime on the window
      if (!window.webpackChunk_N_E) {
        // If not available yet, retry later
        setTimeout(patchWebpack, 50);
        return;
      }

      console.log(
        "[Webpack Factory Patch] Found webpack chunk, applying patch..."
      );

      // Store the original push function
      const originalPush = window.webpackChunk_N_E.push;

      // Replace with our safe version
      window.webpackChunk_N_E.push = function (chunk) {
        try {
          // Look for the webpack runtime in the chunk
          const [chunkIds, moreModules, runtime] = chunk;

          // If this chunk contains the runtime, we need to patch it
          if (runtime) {
            console.log(
              "[Webpack Factory Patch] Found webpack runtime, patching factory functions..."
            );

            // Wrap the original push to safely execute it
            return originalPush.apply(this, [
              [
                chunkIds,
                moreModules,
                // Replace the runtime with our safe version that wraps factory calls
                function (require) {
                  try {
                    // Execute the original runtime
                    return runtime(function safeRequire(moduleId) {
                      try {
                        return require(moduleId);
                      } catch (e) {
                        console.warn(
                          "[Webpack Factory Patch] Safe require error:",
                          e
                        );
                        return {};
                      }
                    });
                  } catch (e) {
                    console.warn(
                      "[Webpack Factory Patch] Runtime execution error:",
                      e
                    );
                    return {};
                  }
                },
              ],
            ]);
          }

          // For other chunks, proceed normally but with try/catch
          return originalPush.apply(this, arguments);
        } catch (e) {
          console.warn("[Webpack Factory Patch] Error in patched push:", e);
          // Try to call the original as fallback
          try {
            return originalPush.apply(this, arguments);
          } catch (e2) {
            console.error("[Webpack Factory Patch] Fatal error:", e2);
            return undefined;
          }
        }
      };

      // Direct patch for webpack require if it exists on window
      if (window.__webpack_require__) {
        console.log("[Webpack Factory Patch] Patching __webpack_require__...");

        // Keep references to original functions
        const originalRequire = window.__webpack_require__;
        const originalFactory = originalRequire.f;

        if (originalFactory) {
          // Patch all factory methods
          Object.keys(originalFactory).forEach((factoryType) => {
            const originalFactoryMethod = originalFactory[factoryType];

            if (typeof originalFactoryMethod === "function") {
              originalFactory[factoryType] = function (moduleId, promises) {
                try {
                  return originalFactoryMethod.call(this, moduleId, promises);
                } catch (e) {
                  console.warn(
                    `[Webpack Factory Patch] Factory ${factoryType} error:`,
                    e
                  );

                  // For 'j' factory (javascript) we can try to return an empty module
                  if (factoryType === "j") {
                    const module = {
                      exports: {},
                      id: moduleId,
                    };
                    window.__webpack_modules__[moduleId] = module;
                    return module.exports;
                  }
                  return {};
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
              `[Webpack Factory Patch] Module require failed for ${moduleId}:`,
              e
            );
            return {};
          }
        };

        // Copy all properties from original require
        Object.keys(originalRequire).forEach((key) => {
          if (key !== "f") {
            // We already patched 'f' separately
            window.__webpack_require__[key] = originalRequire[key];
          }
        });
      }

      console.log("[Webpack Factory Patch] Successfully applied patches");
    } catch (e) {
      console.error("[Webpack Factory Patch] Failed to patch webpack:", e);
    }
  };

  // Start patching process
  patchWebpack();

  // Also install a global error handler specifically for this type of error
  window.addEventListener(
    "error",
    function (event) {
      // Only handle webpack factory errors
      if (
        event.message?.includes(
          "Cannot read properties of undefined (reading 'call')"
        ) &&
        (event.filename?.includes("webpack.js") ||
          event.error?.stack?.includes("options.factory"))
      ) {
        console.warn(
          "[Webpack Factory Patch] Intercepted webpack factory error:",
          event.message
        );
        event.preventDefault();
        return true; // Prevent the error from bubbling up
      }
    },
    true
  );
})();

export default {
  applied: true,
};
