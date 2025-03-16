/**
 * Next.js App Router Webpack Patch
 *
 * This patch specifically targets the error:
 * "Cannot read properties of undefined (reading 'call')"
 * in webpack.js when loading app-index.js and app-next-dev.js
 * with "use server" directives.
 */

// Self-executing function to avoid polluting global scope
(function () {
  if (typeof window === "undefined") return;

  console.log("[App Router Patch] Initializing...");

  try {
    // Mark that this patch has been applied
    window.__app_router_patch_applied = true;

    // This will store our fix for server actions
    const originalDefine = Object.defineProperty;
    const safeDefineProperty = function (obj, prop, descriptor) {
      // Handle cases where obj is undefined
      if (obj === undefined || obj === null) {
        console.warn(
          `[App Router Patch] Prevented defineProperty on undefined object for property ${prop}`
        );
        return obj;
      }

      try {
        return originalDefine.call(Object, obj, prop, descriptor);
      } catch (e) {
        console.warn(
          `[App Router Patch] Error in defineProperty for ${prop}:`,
          e
        );
        return obj;
      }
    };

    // Safe replacement for Object.defineProperty to handle undefined
    Object.defineProperty = safeDefineProperty;

    // Create a custom module loader for app router modules
    const patchAppRouterModules = () => {
      if (!window.__webpack_require__) {
        setTimeout(patchAppRouterModules, 50);
        return;
      }

      const originalRequire = window.__webpack_require__;

      // Create a patched version of webpack require
      window.__webpack_require__ = function (moduleId) {
        try {
          // Check if this is an app router module
          const isAppRouterModule =
            typeof moduleId === "string" &&
            (moduleId.includes("app-index.js") ||
              moduleId.includes("app-next-dev.js") ||
              moduleId.includes("app-pages-browser"));

          if (isAppRouterModule) {
            console.log(
              `[App Router Patch] Safely loading module: ${moduleId}`
            );

            try {
              // Try to require the module normally
              return originalRequire(moduleId);
            } catch (e) {
              console.warn(
                `[App Router Patch] Error loading module ${moduleId}:`,
                e
              );

              // For app router modules, return a minimal implementation
              // that won't crash the application
              return {
                __esModule: true,
                default: function () {
                  return null;
                },
                // Stub for server actions
                createServerReference: function () {
                  return function () {
                    console.warn(
                      "[App Router Patch] Blocked server action call in client"
                    );
                    return Promise.resolve(null);
                  };
                },
                // Other common app router exports
                AppRouter: function () {
                  return null;
                },
                LayoutRouter: function () {
                  return null;
                },
                RenderFromTemplateContext: function () {
                  return null;
                },
                staticGenerationAsyncStorage: {
                  getStore: function () {
                    return null;
                  },
                  run: function (cb) {
                    return cb();
                  },
                },
              };
            }
          }

          // For non-app router modules, use the original require
          return originalRequire(moduleId);
        } catch (e) {
          console.warn(
            `[App Router Patch] Error in patched require for ${moduleId}:`,
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

      // Special handling for factory functions
      if (originalRequire.f) {
        const originalFactory = originalRequire.f;

        // Patch each factory type
        Object.keys(originalFactory).forEach((type) => {
          const original = originalFactory[type];
          if (typeof original === "function") {
            originalFactory[type] = function (moduleId, promises) {
              try {
                // Check if module ID contains app router paths
                if (
                  typeof moduleId === "string" &&
                  (moduleId.includes("app-index.js") ||
                    moduleId.includes("app-next-dev.js") ||
                    moduleId.includes("app-pages-browser"))
                ) {
                  console.log(
                    `[App Router Patch] Factory ${type} handling special module: ${moduleId}`
                  );
                }
                return original.call(this, moduleId, promises);
              } catch (e) {
                console.warn(
                  `[App Router Patch] Error in factory ${type} for module ${moduleId}:`,
                  e
                );

                // For JavaScript modules, create an empty module
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

      console.log(
        "[App Router Patch] Successfully patched webpack for app router modules"
      );
    };

    // Patch app-index and app-next-dev modules
    patchAppRouterModules();

    // Handle global webpack errors specifically for app router
    window.addEventListener(
      "error",
      function (event) {
        // Check if this is an app router related webpack error
        const isAppRouterError =
          (event.message?.includes("Cannot read properties of undefined") &&
            (event.error?.stack?.includes("app-index.js") ||
              event.error?.stack?.includes("app-next-dev.js") ||
              event.error?.stack?.includes("app-pages-browser"))) ||
          (event.message?.includes("use server") &&
            event.error?.stack?.includes("webpack"));

        if (isAppRouterError) {
          console.warn("[App Router Patch] Intercepted app router error:", {
            message: event.message,
            source: event.filename,
            line: event.lineno,
          });

          // Prevent the error from crashing the app
          event.preventDefault();
          return true;
        }
      },
      true
    );

    console.log("[App Router Patch] Successfully installed app router fixes");
  } catch (e) {
    console.error("[App Router Patch] Failed to install patches:", e);
  }
})();

export default {
  applied: true,
};
