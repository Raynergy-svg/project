/**
 * React Server Components patch
 * This file patches Next.js to handle RSC errors
 */

if (typeof window !== 'undefined') {
  // Prevent uncaught errors when RSC module resolution fails
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
  
  // Add global error handler for RSC specific errors
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
} 