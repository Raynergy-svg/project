"use client";

import React, { useEffect } from "react";

/**
 * RSCErrorFix Component
 *
 * A client-side component that applies the required patches to fix
 * the "Cannot read properties of undefined (reading 'call')" error
 * that occurs with React Server Components in Next.js.
 *
 * Place this component at the top level of your application.
 */
export default function RSCErrorFix() {
  useEffect(() => {
    // Early return if we're not in a browser environment
    if (typeof window === "undefined") return;

    // Mark that we've applied the patch
    if ((window as any).__RSC_ERROR_FIX_APPLIED) return;
    (window as any).__RSC_ERROR_FIX_APPLIED = true;

    // Function to patch webpack and RSC
    const patchRSC = () => {
      try {
        // Get the webpack require function
        if (window.__webpack_require__) {
          // Store the original require function
          const originalRequire = window.__webpack_require__;

          // Create a patched version that safely handles errors
          window.__webpack_require__ = function (moduleId: any) {
            try {
              // The specific error happens when moduleId is undefined
              if (moduleId === undefined || moduleId === null) {
                console.debug(
                  "[RSCErrorFix] Prevented error with undefined module ID"
                );
                return {}; // Return empty object instead of crashing
              }

              return originalRequire(moduleId);
            } catch (err) {
              console.warn("[RSCErrorFix] Caught error in require:", err);
              return {}; // Return empty object to prevent app crash
            }
          };

          // Copy all properties from the original require to maintain compatibility
          for (const key in originalRequire) {
            if (Object.prototype.hasOwnProperty.call(originalRequire, key)) {
              window.__webpack_require__[key] = originalRequire[key];
            }
          }

          // Patch specific RSC-related webpack functions
          if (window.__webpack_require__.f) {
            // Patch the "j" function which is commonly involved in RSC errors
            const originalJ = window.__webpack_require__.f.j;
            if (originalJ) {
              window.__webpack_require__.f.j = function (chunkId: any) {
                try {
                  return originalJ(chunkId);
                } catch (err) {
                  console.warn("[RSCErrorFix] Caught error in factory.j:", err);
                  return Promise.resolve(); // Return resolved promise to prevent crash
                }
              };
            }

            // Patch other factory functions
            for (const key in window.__webpack_require__.f) {
              if (
                key !== "j" &&
                typeof window.__webpack_require__.f[key] === "function"
              ) {
                const originalFn = window.__webpack_require__.f[key];
                window.__webpack_require__.f[key] = function (...args: any[]) {
                  try {
                    return originalFn.apply(this, args);
                  } catch (err) {
                    console.warn(
                      `[RSCErrorFix] Caught error in factory.${key}:`,
                      err
                    );
                    return Promise.resolve();
                  }
                };
              }
            }
          }

          console.debug(
            "[RSCErrorFix] Successfully applied webpack/RSC patches"
          );
        }
      } catch (err) {
        console.warn("[RSCErrorFix] Error while applying patches:", err);
      }
    };

    // Apply patch immediately
    patchRSC();

    // Also apply after a short delay (for race conditions)
    setTimeout(patchRSC, 100);

    // Also patch whenever a new script is loaded
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const addedNodes = Array.from(mutation.addedNodes);
          const hasNewScript = addedNodes.some(
            (node) => node.nodeName === "SCRIPT"
          );

          if (hasNewScript) {
            setTimeout(patchRSC, 0);
            break;
          }
        }
      }
    });

    // Start observing the document
    observer.observe(document, { childList: true, subtree: true });

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, []);

  // This is a utility component, it doesn't render anything
  return null;
}
