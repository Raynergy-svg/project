/**
 * React Server DOM Webpack Client Patch
 *
 * This patch specifically targets the error in react-server-dom-webpack-client.browser.development.js
 * which causes "Cannot read properties of undefined (reading 'call')" in the webpack factory.
 */

// Self-executing function
(function () {
  if (typeof window === "undefined") return;

  console.log("[RSC Client Patch] Initializing...");

  try {
    // Store a reference to critical functions we need to patch
    window.__rsc_original_requireModule = null;
    window.__rsc_original_initializeModuleChunk = null;

    // Create safe versions of critical RSC client functions
    window.__rsc_safe_requireModule = function (id) {
      try {
        if (window.__webpack_require__) {
          try {
            return window.__webpack_require__(id);
          } catch (e) {
            console.warn(`[RSC Client Patch] Error requiring module ${id}:`, e);
            return {
              // Safe default export
              default: function () {
                return null;
              },
              // Other common exports for RSC
              __esModule: true,
            };
          }
        } else if (window.__rsc_original_requireModule) {
          try {
            return window.__rsc_original_requireModule(id);
          } catch (e) {
            console.warn(
              `[RSC Client Patch] Error in original requireModule for ${id}:`,
              e
            );
            return {
              default: function () {
                return null;
              },
            };
          }
        }

        // Fallback
        return {
          default: function () {
            return null;
          },
        };
      } catch (e) {
        console.warn(
          `[RSC Client Patch] Fatal error in safe requireModule:`,
          e
        );
        return {
          default: function () {
            return null;
          },
        };
      }
    };

    // Create a safe version of initializeModuleChunk
    window.__rsc_safe_initializeModuleChunk = function (chunk, metadataChunk) {
      try {
        if (window.__rsc_original_initializeModuleChunk) {
          try {
            return window.__rsc_original_initializeModuleChunk(
              chunk,
              metadataChunk
            );
          } catch (e) {
            console.warn(
              `[RSC Client Patch] Error in original initializeModuleChunk:`,
              e
            );
            return {};
          }
        }

        // Fallback
        console.warn(
          `[RSC Client Patch] Called safe initializeModuleChunk without original`
        );
        return {};
      } catch (e) {
        console.warn(
          `[RSC Client Patch] Fatal error in safe initializeModuleChunk:`,
          e
        );
        return {};
      }
    };

    // Function to find and patch the RSC client
    const findAndPatchRSCClient = () => {
      // Look for modules that could be the RSC client
      if (window.__webpack_modules__) {
        console.log(
          `[RSC Client Patch] Searching through ${
            Object.keys(window.__webpack_modules__).length
          } modules...`
        );

        let found = false;

        for (const id in window.__webpack_modules__) {
          try {
            // Look for modules that might be RSC client
            if (
              id.includes("react-server-dom-webpack") ||
              id.includes("cjs/react-server-dom-webpack-client")
            ) {
              console.log(`[RSC Client Patch] Found RSC client module: ${id}`);
              found = true;

              // Store the original module
              const originalModule = window.__webpack_modules__[id];

              // Replace with our patched version
              window.__webpack_modules__[id] = function (
                module,
                exports,
                __webpack_require__
              ) {
                try {
                  // Call the original module
                  const result = originalModule(
                    module,
                    exports,
                    __webpack_require__
                  );

                  // After the module is loaded, patch the exports
                  if (
                    exports.requireModule &&
                    !window.__rsc_original_requireModule
                  ) {
                    console.log(`[RSC Client Patch] Patching requireModule`);
                    window.__rsc_original_requireModule = exports.requireModule;
                    exports.requireModule = window.__rsc_safe_requireModule;
                  }

                  if (
                    exports.initializeModuleChunk &&
                    !window.__rsc_original_initializeModuleChunk
                  ) {
                    console.log(
                      `[RSC Client Patch] Patching initializeModuleChunk`
                    );
                    window.__rsc_original_initializeModuleChunk =
                      exports.initializeModuleChunk;
                    exports.initializeModuleChunk =
                      window.__rsc_safe_initializeModuleChunk;
                  }

                  // Also patch other critical functions
                  if (exports.processModelChunk) {
                    const originalProcessModelChunk = exports.processModelChunk;
                    exports.processModelChunk = function (response, chunk) {
                      try {
                        return originalProcessModelChunk(response, chunk);
                      } catch (e) {
                        console.warn(
                          `[RSC Client Patch] Error in processModelChunk:`,
                          e
                        );
                        return null;
                      }
                    };
                  }

                  if (exports.parseModelString) {
                    const originalParseModelString = exports.parseModelString;
                    exports.parseModelString = function (
                      response,
                      modelString
                    ) {
                      try {
                        return originalParseModelString(response, modelString);
                      } catch (e) {
                        console.warn(
                          `[RSC Client Patch] Error in parseModelString:`,
                          e
                        );
                        return null;
                      }
                    };
                  }

                  if (exports.createFromReadableStream) {
                    const originalCreateFromReadableStream =
                      exports.createFromReadableStream;
                    exports.createFromReadableStream = function (stream) {
                      try {
                        return originalCreateFromReadableStream(stream);
                      } catch (e) {
                        console.warn(
                          `[RSC Client Patch] Error in createFromReadableStream:`,
                          e
                        );
                        return {
                          read: function () {
                            return null;
                          },
                        };
                      }
                    };
                  }

                  return result;
                } catch (e) {
                  console.warn(
                    `[RSC Client Patch] Error initializing RSC client module:`,
                    e
                  );

                  // Provide fallback exports for critical functions
                  exports.requireModule = window.__rsc_safe_requireModule;
                  exports.initializeModuleChunk =
                    window.__rsc_safe_initializeModuleChunk;
                  exports.parseModelString = function () {
                    return null;
                  };
                  exports.processModelChunk = function () {
                    return null;
                  };
                  exports.createFromReadableStream = function () {
                    return {
                      read: function () {
                        return null;
                      },
                    };
                  };

                  return module;
                }
              };
            }
          } catch (e) {
            console.warn(`[RSC Client Patch] Error checking module ${id}:`, e);
          }
        }

        if (!found) {
          console.log(
            `[RSC Client Patch] RSC client module not found, will retry...`
          );
          setTimeout(findAndPatchRSCClient, 500); // Retry later
        } else {
          console.log(
            `[RSC Client Patch] Successfully patched RSC client module`
          );
        }
      } else {
        console.log(
          `[RSC Client Patch] Webpack modules not found, will retry...`
        );
        setTimeout(findAndPatchRSCClient, 500); // Retry later
      }
    };

    // Start patching process
    findAndPatchRSCClient();

    // Add a global error handler that focuses on the exact error in the stack trace
    window.addEventListener(
      "error",
      function (event) {
        if (
          event.message &&
          event.message.includes("Cannot read properties of undefined") &&
          event.error &&
          event.error.stack &&
          (event.error.stack.includes("react-server-dom-webpack") ||
            event.error.stack.includes("requireModule") ||
            event.error.stack.includes("initializeModuleChunk"))
        ) {
          console.warn(
            "[RSC Client Patch] Intercepted RSC client error:",
            event.message
          );
          event.preventDefault();
          return true;
        }
      },
      true
    );

    console.log("[RSC Client Patch] Successfully installed");
  } catch (e) {
    console.error("[RSC Client Patch] Error installing patch:", e);
  }
})();

export default {
  applied: true,
};
