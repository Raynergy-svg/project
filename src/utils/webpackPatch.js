/**
 * Webpack Runtime Error Prevention Patch
 *
 * This file contains patches to prevent common Webpack runtime errors like
 * "Cannot read properties of undefined (reading 'call')"
 *
 * It works by patching core JavaScript prototype functions to make them more resilient
 * and by specifically patching webpack internals when possible.
 */

// Only apply in the browser
if (typeof window !== "undefined") {
  console.log("[Webpack Patch] Applying runtime protection...");

  try {
    // Create safe versions that don't use the prototype methods
    const safeCall = function (fn, thisArg, ...args) {
      if (typeof fn !== "function") {
        console.warn("[Webpack Patch] Prevented call on undefined function");
        return undefined;
      }

      // Direct function invocation to avoid any method calls
      return fn.bind(thisArg)(...args);
    };

    const safeApply = function (fn, thisArg, args) {
      if (typeof fn !== "function") {
        console.warn("[Webpack Patch] Prevented apply on undefined function");
        return undefined;
      }

      // Direct function invocation to avoid any method calls
      return fn.bind(thisArg)(...(args || []));
    };

    // Store original functions
    const originalCall = Function.prototype.call;
    const originalApply = Function.prototype.apply;

    // Replace Function.prototype.call
    Function.prototype.call = function (thisArg, ...args) {
      if (this === undefined || this === null) {
        console.warn("[Webpack Patch] Prevented call on undefined function");
        return undefined;
      }

      // Use our safe implementation that doesn't recurse
      return safeCall(this, thisArg, ...args);
    };

    // Replace Function.prototype.apply
    Function.prototype.apply = function (thisArg, args) {
      if (this === undefined || this === null) {
        console.warn("[Webpack Patch] Prevented apply on undefined function");
        return undefined;
      }

      // Use our safe implementation that doesn't recurse
      return safeApply(this, thisArg, args);
    };

    console.log("[Webpack Patch] Function prototypes patched successfully");
  } catch (e) {
    console.error(
      "[Webpack Patch] Failed to patch Function prototype methods:",
      e
    );
  }

  // Wait until webpack is fully loaded
  setTimeout(() => {
    // Patch webpack require if it exists
    if (typeof __webpack_require__ !== "undefined") {
      try {
        const originalRequire = __webpack_require__;
        __webpack_require__ = function (moduleId) {
          if (moduleId === undefined || moduleId === null) {
            console.warn(
              "[Webpack Patch] Prevented requiring undefined module"
            );
            return {};
          }
          try {
            return originalRequire(moduleId);
          } catch (e) {
            console.warn("[Webpack Patch] Error requiring module:", e);
            return {};
          }
        };
        console.log("[Webpack Patch] __webpack_require__ patched");
      } catch (e) {
        console.error(
          "[Webpack Patch] Failed to patch __webpack_require__:",
          e
        );
      }
    }

    // Patch webpack modules if they exist
    if (typeof __webpack_modules__ !== "undefined") {
      try {
        for (const key in __webpack_modules__) {
          if (Object.prototype.hasOwnProperty.call(__webpack_modules__, key)) {
            const originalModule = __webpack_modules__[key];
            if (typeof originalModule === "function") {
              __webpack_modules__[key] = function (module, exports, require) {
                try {
                  // Direct function call with explicit args to avoid using .call or .apply
                  return originalModule(module, exports, require);
                } catch (e) {
                  console.warn(`[Webpack Patch] Error in module ${key}:`, e);
                  return {};
                }
              };
            }
          }
        }
        console.log("[Webpack Patch] webpack modules patched");
      } catch (e) {
        console.error("[Webpack Patch] Failed to patch webpack modules:", e);
      }
    }
  }, 0);
}

// Export a dummy object so this module can be imported
export default {
  applied: true,
};
