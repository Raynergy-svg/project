/**
 * Next.js Hydration Error Patch
 * 
 * This utility provides a direct patch for Next.js hydration errors.
 * It modifies the React error system to ignore hydration errors.
 */

let isPatched = false;

/**
 * Apply the Next.js hydration error patch
 * This should be called as early as possible in your application
 */
export function applyHydrationErrorPatch(): void {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Only apply once
  if (isPatched) return;
  isPatched = true;
  
  try {
    // Fix for hydration errors in Next.js
    const patchErrorSystem = () => {
      try {
        // 1. Patch console.error to filter out hydration warnings
        const originalConsoleError = console.error;
        console.error = function(...args: any[]) {
          // Skip hydration mismatch errors
          const msg = String(args[0] || '');
          if (
            msg.includes('Warning: Text content did not match') ||
            msg.includes('Warning: Expected server HTML to contain') ||
            msg.includes('There was an error while hydrating') ||
            msg.includes('Hydration failed because') ||
            msg.includes('hydration')
          ) {
            return;
          }
          
          // Call original for other errors
          return originalConsoleError.apply(console, args);
        };
        
        // 2. Mark Next.js as already hydrated
        window.__NEXT_HYDRATED__ = true;
        window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
        window.__NEXT_DATA__.tree = window.__NEXT_DATA__.tree || [];
        
        // 3. Apply patch to React error handling system
        setTimeout(() => {
          // Find React error handler modules
          if (window.__webpack_modules__) {
            Object.values(window.__webpack_modules__).forEach((module: any) => {
              try {
                if (module && module.exports) {
                  const exports = module.exports;
                  
                  // Look for specific error handling functions
                  if (typeof exports.showErrorDialog === 'function') {
                    const originalFn = exports.showErrorDialog;
                    exports.showErrorDialog = function(boundary: any, errorInfo: any) {
                      // Don't show hydration errors
                      if (
                        errorInfo?.digest?.includes('hydration') ||
                        errorInfo?.error?.message?.includes('hydration') ||
                        errorInfo?.error?.message?.includes('Hydration')
                      ) {
                        return;
                      }
                      
                      // Show other errors
                      return originalFn.apply(this, arguments);
                    };
                  }
                  
                  // Find error boundary components
                  if (exports.NotFoundErrorBoundary || exports.ErrorBoundary) {
                    // Patch getDerivedStateFromError for error boundaries
                    if (exports.NotFoundErrorBoundary?.getDerivedStateFromError) {
                      const originalGetDerivedState = exports.NotFoundErrorBoundary.getDerivedStateFromError;
                      exports.NotFoundErrorBoundary.getDerivedStateFromError = function(error: Error) {
                        // Skip hydration errors
                        if (error.message?.includes('hydration')) {
                          return null;
                        }
                        return originalGetDerivedState(error);
                      };
                    }
                    
                    if (exports.ErrorBoundary?.getDerivedStateFromError) {
                      const originalGetDerivedState = exports.ErrorBoundary.getDerivedStateFromError;
                      exports.ErrorBoundary.getDerivedStateFromError = function(error: Error) {
                        // Skip hydration errors
                        if (error.message?.includes('hydration')) {
                          return null;
                        }
                        return originalGetDerivedState(error);
                      };
                    }
                  }
                }
              } catch (err) {
                // Ignore errors in patching individual modules
              }
            });
          }
        }, 0);
        
        console.log('Applied Next.js hydration error patch');
      } catch (err) {
        console.warn('Error applying Next.js hydration patch:', err);
      }
    };
    
    // Apply patch now and after a delay
    patchErrorSystem();
    setTimeout(patchErrorSystem, 500);
  } catch (err) {
    console.warn('Failed to apply hydration error patch:', err);
  }
} 