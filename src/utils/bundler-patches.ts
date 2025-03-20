/**
 * Bundler Compatibility Patches
 * 
 * This file provides patches that work with both Turbopack and webpack,
 * ensuring compatibility regardless of which bundler is used.
 * 
 * Unlike the webpack-specific patches, this implementation uses feature
 * detection rather than direct webpack global references.
 */

// React internals interface for patches
interface ReactInternals {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    ReactCurrentDispatcher?: any;
  };
}

// TypeScript declarations for bundler-related globals
declare global {
  interface Window {
    // Turbopack globals
    __TURBOPACK__?: any;
    
    // Next.js globals
    __NEXT_P?: any[];
    
    // React global
    React?: ReactInternals;
    
    // Flag to prevent double patching
    __BUNDLER_PATCH_APPLIED__?: boolean;
    
    // Additional webpack properties not defined in webpack.d.ts
    _webpack_require__?: any;
    _N_E?: any;
  }
}

// Import RSC patches
import { applyRSCPatches } from './rsc-patches';

/**
 * Apply all patches in the correct order
 */
export const applyBundlerPatches = () => {
  // Only apply in browser environment
  if (typeof window === 'undefined') return;
  
  // Prevent double patching
  if (window.__BUNDLER_PATCH_APPLIED__) return;
  
  try {
    console.log('[Bundler Patch] Applying bundler compatibility patches');
    
    // Apply RSC patches first (which handles Function.prototype.call)
    applyRSCPatches();
    
    // Apply remaining patches in order of importance
    // Skip patchFunctionPrototype since RSC patches handles this
    patchTurbopack();
    patchWebpackGlobals();
    patchNextRouter();
    
    // Mark as patched
    window.__BUNDLER_PATCH_APPLIED__ = true;
    
    console.log('[Bundler Patch] All patches applied successfully');
  } catch (error) {
    console.error('[Bundler Patch] Error applying patches:', error);
  }
};

/**
 * Patch Function.prototype to prevent common errors
 * Note: This is now handled by RSC patches to avoid double-patching
 * Keeping this function as a fallback but it should not be called
 */
const patchFunctionPrototype = () => {
  // Check if RSC patches have already been applied
  if ((window as any).__RSC_WEBPACK_PATCH_APPLIED) {
    console.log('[Bundler Patch] Function.prototype already patched by RSC patches');
    return;
  }
  
  // Safety check
  if (typeof Function.prototype.call !== 'function') return;
  
  // Keep original implementation
  const originalCall = Function.prototype.call;
  
  // Create a safe wrapper around Function.prototype.call
  Function.prototype.call = function safeCall(thisArg: any, ...args: any[]) {
    try {
      // Handle null/undefined thisArg safely
      if (thisArg === null || thisArg === undefined) {
        console.warn('[Bundler Patch] Called Function.prototype.call with null/undefined thisArg');
        return function emptyResult() { return {}; };
      }
      
      // Normal execution
      return originalCall.apply(this, [thisArg, ...args]);
    } catch (err) {
      console.warn('[Bundler Patch] Error in Function.prototype.call:', err);
      return function fallback() { return {}; };
    }
  };
};

/**
 * Patch Turbopack-specific issues
 */
const patchTurbopack = () => {
  // Create a proxy for any missing TURBOPACK modules
  if (typeof window.__TURBOPACK__ === 'undefined') {
    window.__TURBOPACK__ = new Proxy({}, {
      get: (target, prop) => {
        // Handle external require requests
        if (prop === '__turbopack_external_require__') {
          return (id: string) => {
            console.warn(`[Bundler Patch] External require called for ${id}`);
            return {};
          };
        }
        
        // Return empty function for undefined properties
        if (!(prop in target)) {
          console.warn(`[Bundler Patch] Accessing undefined TURBOPACK property: ${String(prop)}`);
          return () => {};
        }
        
        return target[prop as keyof typeof target];
      }
    });
  }
  
  // Ensure external require is available
  if (window.__TURBOPACK__ && !window.__TURBOPACK__.__turbopack_external_require__) {
    window.__TURBOPACK__.__turbopack_external_require__ = (id: string) => {
      console.warn(`[Bundler Patch] External require called for ${id}`);
      return {};
    };
  }
};

/**
 * Patch webpack global objects
 */
const patchWebpackGlobals = () => {
  // Create webpack chunks array if missing
  if (typeof window.webpackChunk_N_E === 'undefined') {
    window.webpackChunk_N_E = window.webpackChunk_N_E || [];
    
    // Create an array push interceptor
    const originalPush = Array.prototype.push;
    
    // Override push to safely handle webpack chunk registrations
    window.webpackChunk_N_E.push = function safePush(...args: any[]) {
      try {
        return originalPush.apply(this, args);
      } catch (err) {
        console.warn('[Bundler Patch] Error in webpack chunk registration:', err);
        return 0;
      }
    };
  }
  
  // Legacy webpack jsonp support
  if (typeof window.webpackJsonp === 'undefined') {
    window.webpackJsonp = window.webpackJsonp || [];
  }
  
  // Handle webpack require if it exists (with type checking)
  const webpackRequire = window.__webpack_require__;
  if (webpackRequire) {
    // Patch factory methods if they exist
    if (webpackRequire.f) {
      Object.keys(webpackRequire.f).forEach(key => {
        const originalMethod = webpackRequire.f?.[key];
        
        if (typeof originalMethod === 'function') {
          webpackRequire.f[key] = function patchedFactoryMethod(...args: any[]) {
            try {
              return originalMethod.apply(this, args);
            } catch (err) {
              console.warn(`[Bundler Patch] Error in webpack factory method ${key}:`, err);
              return {};
            }
          };
        }
      });
    }
  }
};

/**
 * Patch Next.js router registration
 */
const patchNextRouter = () => {
  if (typeof window.__NEXT_P === 'undefined') {
    window.__NEXT_P = window.__NEXT_P || [];
    
    // Add safe push method
    const originalPush = Array.prototype.push;
    
    window.__NEXT_P.push = function safePush(...args: any[]) {
      try {
        return originalPush.apply(this, args);
      } catch (err) {
        console.warn('[Bundler Patch] Error in Next.js router registration:', err);
        return 0;
      }
    };
  }
};

// Auto-execute the patch in browser environments
if (typeof window !== 'undefined') {
  // Apply patches after DOM is loaded for better compatibility
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBundlerPatches);
  } else {
    // DOM already loaded, apply immediately
    setTimeout(applyBundlerPatches, 0);
  }
}

// Export for explicit imports
export default applyBundlerPatches;
