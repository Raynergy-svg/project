"use client";

import { useEffect } from "react";

/**
 * NotFoundErrorBoundaryFix
 *
 * This component patches the hydration issues with Next.js NotFoundErrorBoundary.
 * It should be imported in your not-found.tsx file.
 */
export default function NotFoundErrorBoundaryFix() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    try {
      // Find the NotFoundErrorBoundary component in Next.js internals
      // This is a bit hacky but necessary to fix the hydration issues
      const patchNextNotFoundBoundary = () => {
        // Look for the module in webpack chunks
        const moduleToFind = Object.values(
          window.__webpack_modules__ || {}
        ).find((module: any) => {
          if (!module || !module.exports) return false;

          // Looking for the module that exports NotFoundBoundary
          const exports = module.exports;
          return exports.NotFoundBoundary && exports.NotFoundErrorBoundary;
        });

        if (moduleToFind) {
          // Found the module, patch its error behavior
          const originalErrorBoundary =
            moduleToFind.exports.NotFoundErrorBoundary;

          if (originalErrorBoundary && originalErrorBoundary.prototype) {
            // Create a wrapped version of the getDerivedStateFromError method
            const originalGetDerivedStateFromError =
              originalErrorBoundary.getDerivedStateFromError;

            if (originalGetDerivedStateFromError) {
              originalErrorBoundary.getDerivedStateFromError = function (
                error: Error
              ) {
                // Prevent hydration errors from triggering the boundary
                if (error.message && error.message.includes("hydration")) {
                  console.warn(
                    "Suppressing hydration error in NotFoundErrorBoundary:",
                    error
                  );
                  return null; // Don't activate the error boundary for hydration errors
                }

                // For other errors, use the original handler
                return originalGetDerivedStateFromError(error);
              };

              console.log("Successfully patched NotFoundErrorBoundary");
            }
          }
        } else {
          console.warn("Could not find NotFoundErrorBoundary module to patch");
        }
      };

      // Try to patch after a delay to ensure modules are loaded
      setTimeout(patchNextNotFoundBoundary, 0);
      setTimeout(patchNextNotFoundBoundary, 1000); // Try again after 1s in case of lazy loading
    } catch (error) {
      console.warn("Error patching NotFoundErrorBoundary:", error);
    }
  }, []);

  return null; // This component doesn't render anything
}
