/**
 * Webpack Factory Patch
 * This file patches webpack's factory functions to prevent errors
 */

if (typeof window !== 'undefined') {
  try {
    // Patch webpack factory
    const patchWebpackFactory = () => {
      // Patch webpack global objects
      if (typeof window.webpackJsonp === 'undefined') {
        window.webpackJsonp = window.webpackJsonp || [];
      }
      
      // Patch Next.js router callback registration
      if (typeof window.__NEXT_P === 'undefined') {
        window.__NEXT_P = window.__NEXT_P || [];
      }
      
      // Patch common webpack factory methods if available
      if (window.__webpack_require__) {
        // Create a backup of the original call method
        const originalCall = Function.prototype.call;
        
        // Check and fix missing factory methods
        if (window.__webpack_require__.f) {
          Object.keys(window.__webpack_require__.f).forEach(key => {
            const originalMethod = window.__webpack_require__.f[key];
            if (typeof originalMethod === 'function') {
              window.__webpack_require__.f[key] = function patchedFactoryMethod(...args) {
                try {
                  return originalMethod.apply(this, args);
                } catch (e) {
                  console.warn(`Error in webpack factory method ${key}:`, e);
                  return Promise.resolve();
                }
              };
            }
          });
        }
      }
    };
    
    // Patch Function.prototype.call to handle cases where 'this' is undefined
    const patchFunctionCall = () => {
      const originalCall = Function.prototype.call;
      Function.prototype.call = function patchedCall(thisArg, ...args) {
        try {
          return originalCall.apply(this, [thisArg, ...args]);
        } catch (e) {
          if (e instanceof TypeError && e.message.includes('undefined')) {
            console.warn('Caught TypeError in function call:', e.message);
            // For certain cases, return a safe value
            if (this.name === 'initPolyfills' || this.name.includes('webpack')) {
              return undefined;
            }
          }
          throw e;
        }
      };
    };

    // Apply patches once the document is ready
    setTimeout(() => {
      patchWebpackFactory();
      patchFunctionCall();
    }, 0);
  } catch (e) {
    console.warn('Error in webpack factory patch:', e);
  }
} 