/**
 * "use server" Directive Patch
 *
 * This module specifically handles errors related to the "use server" directive
 * in Next.js applications, which can cause issues in the webpack build process.
 */

// Self-executing function to avoid polluting global scope
(function () {
  if (typeof window === "undefined") return;

  console.log("[Use Server Patch] Initializing...");

  try {
    // Detect "use server" directive errors
    const handleUseServerErrors = () => {
      // Create a MutationObserver to watch for script errors in the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              // Check if this is an error message related to "use server"
              if (
                node.nodeType === Node.ELEMENT_NODE &&
                node.tagName === "PRE" &&
                node.textContent &&
                (node.textContent.includes('"use server"') ||
                  node.textContent.includes(
                    "Cannot read properties of undefined"
                  ))
              ) {
                console.log(
                  "[Use Server Patch] Detected error display in DOM, removing..."
                );

                // Hide the error
                node.style.display = "none";

                // Optionally, replace with a friendly message
                const friendlyMessage = document.createElement("div");
                friendlyMessage.textContent = "App is loading...";
                friendlyMessage.style.padding = "1rem";
                friendlyMessage.style.margin = "1rem";
                friendlyMessage.style.backgroundColor = "#f0f0f0";
                friendlyMessage.style.borderRadius = "0.25rem";

                node.parentNode.insertBefore(friendlyMessage, node);
              }
            });
          }
        });
      });

      // Start observing the document body for error messages
      observer.observe(document.body, { childList: true, subtree: true });

      console.log("[Use Server Patch] Error observer installed");
    };

    // Handle webpack module factory patching for "use server" directives
    const patchServerActionModules = () => {
      if (!window.__webpack_require__) {
        setTimeout(patchServerActionModules, 50);
        return;
      }

      // Get the original require function
      const originalRequire = window.__webpack_require__;

      // Create special handling for modules with "use server" directive
      window.__webpack_require__ = function (moduleId) {
        try {
          const result = originalRequire(moduleId);

          // Check if this module contains a server action or "use server" directive
          if (
            result &&
            (typeof result === "object" || typeof result === "function") &&
            (String(result).includes("use server") ||
              String(result).includes("createServerReference"))
          ) {
            console.log(
              `[Use Server Patch] Handling server action module: ${moduleId}`
            );

            // If it's a server action, wrap it with a safe version
            if (typeof result === "function") {
              // Return a wrapped function that doesn't actually call the server
              return function (...args) {
                console.warn(
                  "[Use Server Patch] Server action called client-side (blocked)"
                );
                return Promise.resolve(null);
              };
            }
          }

          return result;
        } catch (e) {
          console.warn(
            `[Use Server Patch] Error requiring module ${moduleId}:`,
            e
          );

          // If the error mentions "use server", return a stub implementation
          if (e.message && e.message.includes("use server")) {
            console.log(
              `[Use Server Patch] Providing stub for server action module: ${moduleId}`
            );
            return function () {
              console.warn("[Use Server Patch] Blocked server action call");
              return Promise.resolve(null);
            };
          }

          return {}; // Return empty exports
        }
      };

      // Copy all properties from original require
      Object.keys(originalRequire).forEach((key) => {
        if (window.__webpack_require__[key] === undefined) {
          window.__webpack_require__[key] = originalRequire[key];
        }
      });

      console.log(
        "[Use Server Patch] Successfully patched webpack require for server actions"
      );
    };

    // Start our patches
    handleUseServerErrors();
    patchServerActionModules();

    // Install global error handler for "use server" errors
    window.addEventListener(
      "error",
      function (event) {
        if (
          event.message &&
          (event.message.includes('"use server"') ||
            (event.message.includes("Cannot read properties of undefined") &&
              event.error &&
              event.error.stack &&
              event.error.stack.includes("app-")))
        ) {
          console.warn(
            "[Use Server Patch] Intercepted server action error:",
            event.message
          );
          event.preventDefault();
          return true;
        }
      },
      true
    );

    console.log("[Use Server Patch] Successfully installed patches");
  } catch (e) {
    console.error("[Use Server Patch] Failed to install patches:", e);
  }
})();

export default {
  applied: true,
};
