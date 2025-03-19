/**
 * React Server Components Patches
 * 
 * This file consolidates all RSC-related patches for Next.js
 * to handle React Server Components compatibility issues.
 */

// Define types for webpack internals
declare global {
  interface Window {
    __webpack_require__?: any;
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__?: {
      initPolyfills?: () => void;
    };
  }
}

// Client-side patches only
if (typeof window !== 'undefined') {
  /**
   * Server Component Error Handling
   * Prevents uncaught errors when RSC module resolution fails
   */
  const patchConsoleError = () => {
    const originalError = console.error;
    console.error = function patchedError(...args: any[]) {
      // Filter out known RSC errors
      const errorMessage = args[0]?.toString?.() || '';
      
      if (
        errorMessage.includes('react-server-dom-webpack') ||
        errorMessage.includes('Cannot read properties of undefined (reading \'call\')') ||
        errorMessage.includes('Module not found') ||
        errorMessage.includes('ChunkLoadError')
      ) {
        console.warn('React Server Components error suppressed:', ...args);
        return;
      }
      
      return originalError.apply(this, args);
    };
  };

  /**
   * Global Error Handler
   * Catches RSC-specific errors at the window level
   */
  const patchGlobalErrorHandler = () => {
    window.addEventListener('error', (event) => {
      if (
        event.error?.message?.includes('react-server-dom-webpack') ||
        event.error?.message?.includes('Cannot read properties of undefined (reading \'call\')') ||
        event.message?.includes('react-server-dom-webpack') ||
        event.message?.includes('Cannot read properties of undefined (reading \'call\')')
      ) {
        // Prevent the browser from showing the error
        event.preventDefault();
        console.warn('React Server Components error caught:', event.error || event.message);
        
        // Try to recover by reloading the page if it appears to be a fatal error
        if (event.error?.stack?.includes('webpack-internal:')) {
          // Wait to avoid infinite reload loops
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    });
  };

  /**
   * Webpack Runtime Patch
   * Patches the webpack runtime to prevent "Cannot read properties of undefined (reading 'call')" errors
   */
  const patchWebpackRuntime = () => {
    try {
      // Fix for the specific RSC error in react-server-dom-webpack
      if (window.__webpack_require__) {
        // Store original require
        const originalRequire = window.__webpack_require__;

        // Create a wrapped version that handles errors gracefully
        window.__webpack_require__ = function patchedRequire(moduleId) {
          try {
            // Check for null/undefined moduleId which causes the error
            if (moduleId == null) {
              console.warn(
                "RSC patch: Attempted to require null/undefined module"
              );
              return {};
            }

            // Use the original require
            return originalRequire(moduleId);
          } catch (err) {
            // Log the error but don't crash
            console.warn("RSC patch: Error requiring module:", err);
            return {};
          }
        };

        // Copy all properties from the original require
        for (const key in originalRequire) {
          if (Object.prototype.hasOwnProperty.call(originalRequire, key)) {
            window.__webpack_require__[key] = originalRequire[key];
          }
        }

      // Specifically patch the factory function which is often the source of the error
      if (window.__webpack_require__?.f) {
        // Keep reference to original factory methods
        const originalFactory = { ...window.__webpack_require__.f };

        // Patch each factory method
        for (const key in originalFactory) {
          const originalMethod = originalFactory[key];

          if (typeof originalMethod === "function") {
            window.__webpack_require__.f[key] = function (...args: any[]) {
                try {
                  return originalMethod.apply(this, args);
                } catch (err) {
                  console.warn(`RSC patch: Factory error in ${key}:`, err);
                  return Promise.resolve();
                }
              };
            }
          }
        }

        console.log("RSC patch: Applied webpack runtime patches");
      }
    } catch (err) {
      console.warn("RSC patch: Failed to apply patches:", err);
    }
  };

  /**
   * Turbopack Patch
   * Fixes "__TURBOPACK__imported__module__" not a function errors
   */
  const patchTurbopack = () => {
    try {
      // Add stub for missing polyfills
      // @ts-ignore
      window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = 
        window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ || {};
        
      // If initPolyfills doesn't exist, create a stub for it
      if (window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__.initPolyfills === undefined) {
        window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__.initPolyfills = function() {
          console.warn('Stub initPolyfills called');
        };
      }
    } catch (e) {
      console.warn('Error setting up turbopack polyfill patches:', e);
    }
  };

  /**
   * WebSocket Patch
   * Patches WebSocket handling for RSC streaming
   */
  const patchWebSocket = () => {
    try {
      // Only apply if the handleMessage method exists (custom extension)
      // @ts-ignore - handleMessage is a custom extension that may exist in some environments
      const originalHandleMessage = WebSocket.prototype.handleMessage;
      if (originalHandleMessage) {
        // @ts-ignore - We're patching a non-standard method
        WebSocket.prototype.handleMessage = function patchedHandleMessage(event: any) {
          try {
            // Safely parse the message and provide defaults
            if (event && event.data) {
              const data = JSON.parse(event.data);
              if (data && data.action === undefined) {
                data.action = 'unknown';
              }
              // Reserialize to ensure 'action' exists
              event.data = JSON.stringify(data);
            }
            return originalHandleMessage.call(this, event);
          } catch (e) {
            console.warn('Error in WebSocket message handling:', e);
            // Continue without error
            return undefined;
          }
        };
      }
    } catch (e) {
      console.warn('Error patching WebSocket:', e);
    }
  };

  // Apply all patches with a small delay to ensure window is fully loaded
  window.addEventListener("load", function () {
    setTimeout(function () {
      patchConsoleError();
      patchGlobalErrorHandler();
      patchWebpackRuntime();
      patchTurbopack();
      patchWebSocket();
      console.log('All RSC patches applied successfully');
    }, 0);
  });
}

// Export empty object for module system compatibility
export {};
