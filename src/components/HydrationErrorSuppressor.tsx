"use client";

import { useEffect } from "react";

/**
 * HydrationErrorSuppressor
 *
 * This component globally patches the React error systems to suppress hydration errors.
 * It's a last resort approach to prevent hydration errors from breaking the application.
 */
export default function HydrationErrorSuppressor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only apply this patch once
    if ((window as any).__HYDRATION_ERROR_PATCHED) return;
    (window as any).__HYDRATION_ERROR_PATCHED = true;

    try {
      // Override console.error to suppress hydration warnings
      const originalConsoleError = console.error;
      console.error = function (...args: any[]) {
        const errorMsg = args[0]?.toString() || "";

        // Check if this is a hydration error
        const isHydrationError =
          errorMsg.includes("Expected server HTML to contain") ||
          errorMsg.includes("did not match") ||
          errorMsg.includes("Hydration") ||
          errorMsg.includes("hydration") ||
          (args[0] instanceof Error && args[0].message?.includes("hydration"));

        // Don't log hydration errors
        if (isHydrationError) {
          return;
        }

        // Pass through other errors
        return originalConsoleError.apply(console, args);
      };

      // Patch error handler in React
      const patchReactErrorHandler = () => {
        // Find React and React DOM modules
        if (window.__webpack_modules__) {
          // Look through webpack modules for React error handler functions
          Object.values(window.__webpack_modules__).forEach((module: any) => {
            if (!module || !module.exports) return;

            // Check if this is a React error handler module
            const exports = module.exports;

            // Look for showErrorDialog function which handles React errors
            if (typeof exports.showErrorDialog === "function") {
              // Save original function
              const originalShowErrorDialog = exports.showErrorDialog;

              // Replace with our patched version
              exports.showErrorDialog = function (
                boundary: any,
                errorInfo: any
              ) {
                // Check if this is a hydration error
                if (
                  errorInfo?.error?.message?.includes("hydration") ||
                  errorInfo?.digest?.includes("hydration")
                ) {
                  // Just return without showing the error
                  return;
                }

                // For non-hydration errors, use the original handler
                return originalShowErrorDialog.apply(this, arguments);
              };
            }
          });
        }
      };

      // Try to patch now and after a delay
      patchReactErrorHandler();
      setTimeout(patchReactErrorHandler, 1000);

      console.log("Hydration error suppressor applied");
    } catch (err) {
      console.warn("Failed to apply hydration error suppressor:", err);
    }
  }, []);

  return null;
}
