/**
 * Webpack Factory Patch
 * This file patches webpack's factory functions to prevent errors
 */

// Declare global interfaces to make TypeScript happy
declare global {
  // Define webpack require interface to match existing type declarations
  interface WebpackRequire {
    f?: Record<string, Function>;
    [key: string]: any;
  }

  interface Window {
    webpackJsonp?: any[];
    __NEXT_P?: any[];
    __webpack_require__?: WebpackRequire;
    React?: any;
  }
}

// Export function to apply webpack factory patch
export const applyBundlerPatches = () => {
  if (typeof window !== 'undefined') {
    try {
    // Patch webpack factory
    const applyBundlerPatches = () => {
      // Patch webpack global objects
      if (typeof window.webpackJsonp === 'undefined') {
        window.webpackJsonp = window.webpackJsonp || [];
      }
      
      // Patch Next.js router callback registration
      if (typeof window.__NEXT_P === 'undefined') {
        window.__NEXT_P = window.__NEXT_P || [];
      }
      
      // Patch common webpack factory methods if available
      const webpackRequire = window.__webpack_require__;
      if (webpackRequire) {
        // Create a backup of the original call method
        const originalCall = Function.prototype.call;
        
        // Check and fix missing factory methods
        if (webpackRequire.f) {
          Object.keys(webpackRequire.f).forEach(key => {
            const originalMethod = webpackRequire.f?.[key];
            if (typeof originalMethod === 'function') {
              webpackRequire.f[key] = function patchedFactoryMethod(...args: any[]) {
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
      applyBundlerPatches();
      patchFunctionCall();
    }, 0);
    } catch (e) {
      console.warn('Error in webpack factory patch:', e);
    }
  }
};

// Auto-execute the patch
applyBundlerPatches();