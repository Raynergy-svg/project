/**
 * Error Boundary Patch
 * This file patches React Error Boundaries to prevent uncaught errors
 */

// Add type declarations for global objects
declare global {
  interface Window {
    React?: {
      // Define interface matching React internals
      __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
        ReactCurrentDispatcher?: any;
      };
    };
  }
}

// Export function to apply error boundary patch
export const applyErrorBoundaryPatch = () => {
  if (typeof window !== 'undefined') {
    try {
    // Global error handler for uncaught errors
    window.addEventListener('error', (event) => {
      // Handle specific webpack/turbopack module errors
      if (
        event.message?.includes('initPolyfills') ||
        event.message?.includes('__TURBOPACK__imported__module__') ||
        event.message?.includes('Cannot use \'in\' operator to search for \'action\'')
      ) {
        console.warn('Error caught by error-boundary-patch:', event.message);
        event.preventDefault();
        return false;
      }
    });

    // Patch React's error handling
    const patchReactError = () => {
      if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        const ReactSharedInternals = window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        
        if (ReactSharedInternals.ReactCurrentDispatcher) {
          // Create a backup of the original error function
          const originalError = console.error;
          
          // Replace it with a filtered version
          console.error = function patchedReactError(...args) {
            // Filter out known issues
            const errorMsg = String(args[0] || '');
            
            if (
              errorMsg.includes('initPolyfills') ||
              errorMsg.includes('__TURBOPACK__imported__module__') ||
              errorMsg.includes('Cannot use \'in\' operator to search for \'action\'') ||
              errorMsg.includes('Missing expected error boundary')
            ) {
              console.warn('React error suppressed:', ...args);
              return;
            }
            
            return originalError.apply(this, args);
          };
        }
      }
    };

    // Apply patch when document is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchReactError);
    } else {
      setTimeout(patchReactError, 0);
    }
    } catch (e) {
      console.warn('Error in error boundary patch:', e);
    }
  }
};

// Auto-execute the patch
applyErrorBoundaryPatch();