/**
 * Global webpack error handler
 * Provides top-level error catching for webpack-specific errors
 */

// Export function to apply webpack error handler
export const applyWebpackErrorHandler = () => {
  if (typeof window !== 'undefined') {
    try {
    // Set up global error handler
    window.addEventListener('error', (event) => {
      const errorMessage = event.message || '';
      const errorStack = event.error?.stack || '';
      
      // Only handle webpack/turbopack specific errors
      if (
        errorMessage.includes('__webpack_require__') ||
        errorMessage.includes('__TURBOPACK__') ||
        errorMessage.includes('webpack') ||
        errorMessage.includes('chunks') ||
        errorStack.includes('webpack') ||
        errorStack.includes('chunks') ||
        errorMessage.includes('initPolyfills') ||
        errorMessage.includes('Cannot use \'in\' operator to search for \'action\'')
      ) {
        console.warn('Webpack error caught and suppressed:', errorMessage);
        console.warn('Error stack:', errorStack);
        
        // Prevent the browser from showing the error
        event.preventDefault();
        return false;
      }
    });
    
    // Add unhandled rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const reasonMessage = String(reason);
      
      // Only handle webpack/turbopack specific errors
      if (
        reasonMessage.includes('__webpack_require__') ||
        reasonMessage.includes('__TURBOPACK__') ||
        reasonMessage.includes('webpack') ||
        reasonMessage.includes('chunks') ||
        reasonMessage.includes('initPolyfills') ||
        reasonMessage.includes('Cannot use \'in\' operator to search for \'action\'')
      ) {
        console.warn('Webpack promise rejection caught and suppressed:', reasonMessage);
        
        // Prevent the browser from showing the error
        event.preventDefault();
        return false;
      }
    });
    
    // Log that the handler is installed
    console.log('Webpack error handler installed successfully');
    } catch (e) {
      console.warn('Error setting up webpack error handler:', e);
    }
  }
};

// Auto-execute the handler
applyWebpackErrorHandler();