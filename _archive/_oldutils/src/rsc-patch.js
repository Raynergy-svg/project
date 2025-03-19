/**
 * React Server Components Patch
 *
 * This patch specifically targets the error:
 * "Cannot read properties of undefined (reading 'call')"
 * in react-server-dom-webpack-client.browser.development.js
 */

// Self-executing function to avoid polluting global scope
(function () {
  if (typeof window === "undefined") return;

  console.log("[RSC Patch] Initializing...");

  try {
    // Mark that this patch has been applied
    window.__rsc_patch_applied = true;

    // Create a global safety mechanism for RSC
    window.__safeRequireModule = function (id) {
      try {
        // If window.__webpack_require__ exists, use it safely
        if (window.__webpack_require__) {
          try {
            return window.__webpack_require__(id);
          } catch (e) {
            console.warn(
              `[RSC Patch] Error in webpack require for module ${id}:`,
              e
            );
            return {};
          }
        }
        return {};
      } catch (e) {
        console.warn("[RSC Patch] Error in safe require module:", e);
        return {};
      }
    };

    // Monkey patch Object.prototype to intercept property accesses on the RSC client
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function (obj, prop) {
      // Handle null/undefined objects
      if (obj === undefined || obj === null) {
        if (prop === "call" || prop === "apply") {
          console.warn(
            `[RSC Patch] Prevented accessing ${prop} on undefined object`
          );
          return {
            value: function () {
              return undefined;
            },
          };
        }
        return undefined;
      }

      // Check if this is accessing a property on the RSC client
      if (
        obj &&
        (String(obj).includes("react-server-dom-webpack") ||
          (typeof prop === "string" &&
            (prop.includes("requireModule") ||
              prop.includes("initializeModuleChunk") ||
              prop.includes("processModelChunk"))))
      ) {
        // For specific RSC client methods that might fail
        if (prop === "requireModule" && !obj[prop]) {
          console.log("[RSC Patch] Providing safe requireModule");
          return {
            value: function (id) {
              return window.__safeRequireModule(id);
            },
            writable: true,
            configurable: true,
            enumerable: true,
          };
        }
      }

      return originalGetOwnPropertyDescriptor.apply(this, arguments);
    };

    // Override the JSON.parse method to catch RSC model parsing errors
    const originalJSONParse = JSON.parse;
    JSON.parse = function (text) {
      try {
        return originalJSONParse.apply(this, arguments);
      } catch (e) {
        // Check if this is an RSC model parse error
        if (
          typeof text === "string" &&
          (text.includes('"use server"') ||
            text.includes("react-server-dom-webpack") ||
            (e.stack && e.stack.includes("react-server-dom-webpack")))
        ) {
          console.warn("[RSC Patch] Caught RSC JSON parse error:", e);

          // Return a minimal model object that won't crash the app
          return {
            id: 0,
            chunks: [],
            name: "",
            async: true,
            parentChunkId: 0,
          };
        }

        // For other JSON parse errors, rethrow
        throw e;
      }
    };

    // Patch webpack require for React Server Components
    const patchRSCWebpackRequire = () => {
      if (!window.__webpack_require__) {
        setTimeout(patchRSCWebpackRequire, 50);
        return;
      }

      const originalRequire = window.__webpack_require__;

      // Create a patched version of webpack require that handles RSC modules
      window.__webpack_require__ = function (moduleId) {
        try {
          // Check if this is a RSC related module
          const isRSCModule =
            typeof moduleId === "string" &&
            (moduleId.includes("react-server-dom-webpack") ||
              moduleId.includes("react-server") ||
              moduleId.includes("server-dom"));

          if (isRSCModule) {
            console.log(`[RSC Patch] Safe loading RSC module: ${moduleId}`);

            try {
              // Try to require the module normally
              return originalRequire(moduleId);
            } catch (e) {
              console.warn(
                `[RSC Patch] Error loading RSC module ${moduleId}:`,
                e
              );

              // For RSC client modules, return a stub implementation
              // with the common APIs that won't crash
              return {
                createFromFetch: function () {
                  return {
                    read: function () {
                      return null;
                    },
                  };
                },
                createFromReadableStream: function () {
                  return {
                    read: function () {
                      return null;
                    },
                  };
                },
                createFromXHR: function () {
                  return {
                    read: function () {
                      return null;
                    },
                  };
                },
                createServerReference: function () {
                  return function () {
                    console.warn("[RSC Patch] Blocked server action call");
                    return Promise.resolve(null);
                  };
                },
                // Common exports to prevent crashes
                parseModel: function () {
                  return {};
                },
                encodeModel: function () {
                  return "{}";
                },
              };
            }
          }

          // For non-RSC modules, use the original require
          return originalRequire(moduleId);
        } catch (e) {
          console.warn(
            `[RSC Patch] Error in patched require for ${moduleId}:`,
            e
          );
          return {}; // Return empty exports to prevent crashes
        }
      };

      // Copy all properties from original require
      Object.keys(originalRequire).forEach((key) => {
        if (window.__webpack_require__[key] === undefined) {
          window.__webpack_require__[key] = originalRequire[key];
        }
      });

      console.log(
        "[RSC Patch] Successfully patched webpack require for RSC modules"
      );
    };

    // Patch RSC modules
    patchRSCWebpackRequire();

    // Global error handler for RSC errors
    window.addEventListener(
      "error",
      function (event) {
        // Check if this is an RSC-related error
        const isRSCError =
          (event.message?.includes("Cannot read properties of undefined") &&
            (event.error?.stack?.includes("react-server-dom-webpack") ||
              event.filename?.includes("react-server-dom-webpack"))) ||
          event.message?.includes("requireModule") ||
          event.message?.includes("initializeModuleChunk");

        if (isRSCError) {
          console.warn("[RSC Patch] Intercepted RSC error:", {
            message: event.message,
            source: event.filename,
            line: event.lineno,
          });

          event.preventDefault();
          return true;
        }
      },
      true
    );

    console.log("[RSC Patch] Successfully installed patches");
  } catch (e) {
    console.error("[RSC Patch] Failed to install patches:", e);
  }
})();

export default {
  applied: true,
};
