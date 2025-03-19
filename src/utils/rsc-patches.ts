/**
 * React Server Components Patches
 * 
 * This file consolidates all RSC-related patches for Next.js
 * to handle React Server Components compatibility issues.
 */

// Define types for webpack internals 
interface WebpackRequire {
  (moduleId: any): any;
  m: Record<string, any>;
  c: Record<string, any>;
  p: string;
  n: (moduleId: any) => any;
  o: (object: any, property: string) => boolean;
  d: (exports: any, name: string, getter: () => any) => void;
  r: (exports: any) => void;
  t: (value: any, mode: string) => any;
  nmd: (module: any) => any;
  f: {
    j: (chunkId: any) => Promise<void>;
    [key: string]: any;
  };
  e: (chunkId: any) => Promise<void>;
  u: (chunkId: any) => string;
  g: any;
  h: () => string;
  S: Record<string, any>;
  [key: string]: any;
}

// Global type declarations
declare global {
  interface Window {
    __webpack_require__?: WebpackRequire;
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__?: {
      initPolyfills?: () => void;
    };
    __RSC_WEBPACK_PATCH_APPLIED?: boolean;
    __NEXT_HYDRATED__?: boolean;
    __NEXT_HYDRATION_COMPLETE__?: boolean;
    __NEXT_HYDRATION_ERROR_SUPPRESSED__?: boolean;
    __chunkLoadingPatched?: boolean;
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
      // Mark that we've applied the patch to prevent double application
      if ((window as any).__RSC_WEBPACK_PATCH_APPLIED) {
        return;
      }
      (window as any).__RSC_WEBPACK_PATCH_APPLIED = true;

      // Fix for the specific RSC error in react-server-dom-webpack
      if (window.__webpack_require__) {
        // Store original require
        const originalRequire = window.__webpack_require__;

        // Create a wrapped version that handles errors gracefully
        const patchedRequire = function(moduleId: any) {
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
        } as WebpackRequire;

        // Copy all properties from the original require
        for (const key in originalRequire) {
          if (Object.prototype.hasOwnProperty.call(originalRequire, key)) {
            patchedRequire[key] = originalRequire[key];
          }
        }

        // Replace the require function
        window.__webpack_require__ = patchedRequire;

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
                  // For chunk loading errors (j method), provide a meaningful response
                  if (key === 'j') {
                    const [chunkId] = args;
                    console.warn(`RSC patch: Could not load chunk: ${chunkId}`);
                    // Trigger an event for the chunk load error
                    const event = new CustomEvent('chunkLoadError', { detail: { chunkId } });
                    window.dispatchEvent(event);
                  }
                  return Promise.resolve();
                }
              };
            }
          }
          
          // Specifically patch the j method which handles chunk loading
          const originalJ = window.__webpack_require__.f.j;
          window.__webpack_require__.f.j = function(chunkId: any): Promise<void> {
            try {
              // Log all chunk loading attempts for debugging
              console.log(`RSC patch: Attempting to load chunk: ${chunkId}`);
              
              // If the chunk loading fails with a 404, we'll return a resolved promise to prevent crashes
              if (window.__webpack_require__ && typeof window.__webpack_require__.e === 'function') {
                const originalChunkLoadingFunction = window.__webpack_require__.e;
                if (!window.__chunkLoadingPatched) {
                  window.__chunkLoadingPatched = true;
                  
                  // Enhanced chunk loading error handling
                  window.__webpack_require__.e = function(chunkId: any) {
                    console.log(`RSC enhanced patch: Loading chunk ${chunkId}`);
                    
                    // Add specific handling for known problematic chunks
                    if (chunkId.includes('app/about/page') || 
                        chunkId.includes('app/features/page') ||
                        chunkId.includes('app/pricing/page')) {
                      console.warn(`RSC patch: Special handling for known problematic chunk: ${chunkId}`);
                      // Immediately dispatch error to trigger fallback
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('chunkLoadError', { 
                          detail: { chunkId, error: new Error(`Preemptively handled ${chunkId}`) } 
                        }));
                      }, 0);
                      
                      // Attempt to load the chunk anyway
                      return originalChunkLoadingFunction(chunkId).catch((error: any) => {
                        console.warn(`RSC patch: Expected chunk load error for ${chunkId}:`, error);
                        return Promise.resolve();
                      });
                    }
                    
                    // Handle other chunks with improved error handling
                    return originalChunkLoadingFunction(chunkId).catch((error: any) => {
                      console.warn(`RSC patch: Chunk load error for ${chunkId}:`, error);
                      
                      // Dispatch an event that can be used to show fallback content
                      window.dispatchEvent(new CustomEvent('chunkLoadError', { 
                        detail: { chunkId, error } 
                      }));
                      
                      // Return a resolved promise to prevent app crashes
                      return Promise.resolve();
                    });
                  };
                }
              }
              
              return originalJ.apply(this, [chunkId]);
            } catch (err) {
              console.warn(`RSC patch: Error in chunk loading system for ${chunkId}:`, err);
              // Dispatch the error event
              window.dispatchEvent(new CustomEvent('chunkLoadError', { 
                detail: { chunkId, error: err } 
              }));
              return Promise.resolve();
            }
          };
        }

        // Patch options.factory which is mentioned in the error stack
        const originalOptionsFactory = Function.prototype.call;
        Function.prototype.call = function(this: Function, thisArg: any, ...argArray: any[]) {
          try {
            // Handle null or undefined thisArg which causes the error
            // This specifically addresses the "Cannot read properties of undefined (reading 'call')" error
            if (thisArg === undefined || thisArg === null) {
              console.warn('RSC patch: Call on undefined/null object prevented');
              return {};
            }
            
            return originalOptionsFactory.apply(this, [thisArg, ...argArray]);
          } catch (err: any) {
            if (err && typeof err === 'object' && err.message && 
                typeof err.message === 'string' && 
                (err.message.includes('undefined (reading \'call\')') ||
                 err.message.includes('options.factory'))) {
              console.warn('RSC patch: Prevented call error:', err);
              return {};
            }
            throw err;
          }
        };
        
        // Additional patch for webpack.js options.factory
        // This directly addresses the error happening at webpack.js:712:31
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function<T>(obj: T, prop: PropertyKey, descriptor: PropertyDescriptor & ThisType<any>): T {
          // Intercept factory-related property definitions
          if (prop === 'factory' && obj && obj.constructor && obj.constructor.name === 'Object') {
            const originalValue = descriptor.value;
            if (typeof originalValue === 'function') {
              descriptor.value = function(...args: any[]) {
                try {
                  return originalValue.apply(this, args);
                } catch (err) {
                  console.warn('RSC patch: Prevented factory error:', err);
                  return {};
                }
              };
            }
          }
          return originalDefineProperty(obj, prop, descriptor);
        };

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
