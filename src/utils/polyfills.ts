/**
 * Polyfills for browser and server environments
 * This file provides compatibility functions that work across environments
 */

// Import core polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Webpack type declarations
declare global {
  interface Window {
    __NEXT_P?: any[];
    __webpack_require__?: {
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
    };
    __webpack_modules__?: {
      [moduleId: string]: {
        exports: any;
        id: string;
        loaded: boolean;
        [key: string]: any;
      };
    };
    webpackChunk_N_E?: any[];
    webpackJsonp?: any[];
  }
}

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Safe global atob implementation that works in all environments
 * @param input - Base64 string to decode
 */
export function atob(input: string): string {
  if (isBrowser) {
    // Use browser's native atob
    return window.atob(input);
  } else {
    // Node.js environment
    return Buffer.from(input, 'base64').toString('binary');
  }
}

/**
 * Safe global btoa implementation that works in all environments
 * @param input - String to encode to base64
 */
export function btoa(input: string): string {
  if (isBrowser) {
    // Use browser's native btoa
    return window.btoa(input);
  } else {
    // Node.js environment
    return Buffer.from(input, 'binary').toString('base64');
  }
}

/**
 * Create a DOMException that works in all environments
 * @param message - Error message
 * @param name - Error name
 */
export function createDOMException(message: string, name: string): Error {
  if (isBrowser && typeof DOMException !== 'undefined') {
    // Use browser's native DOMException
    return new DOMException(message, name);
  } else {
    // In Node.js, create a custom error that mimics DOMException
    const error = new Error(message);
    error.name = name;
    return error;
  }
}

/**
 * Polyfill for the deprecated StorageType.persistent API
 * This replaces it with modern navigator.storage APIs
 */
export function polyfillStorageAPI(): void {
  if (!isBrowser) return;
  
  // @ts-ignore - Define StorageType if it doesn't exist
  if (!window.StorageType) {
    // @ts-ignore
    window.StorageType = {
      get persistent() {
        console.warn('StorageType.persistent is deprecated. Please use standardized navigator.storage instead.');
        // Attempt to use the modern API if available
        if (navigator && navigator.storage && typeof navigator.storage.persist === 'function') {
          navigator.storage.persist().catch(err => {
            console.warn('Error requesting persistent storage:', err);
          });
        }
        return 'persistent';
      }
    };
  }
  
  // Add navigator.storage polyfill if not available
  if (window.navigator && !window.navigator.storage) {
    // @ts-ignore - Add minimal implementation
    window.navigator.storage = {
      persist: () => Promise.resolve(false),
      persisted: () => Promise.resolve(false),
      estimate: () => Promise.resolve({ usage: 0, quota: 0 }),
    };
  }
}

/**
 * Initialize polyfills to replace deprecated packages
 * Call this function early in your application to ensure polyfills are available
 */
export function initPolyfills(): void {
  // Core-js and regenerator-runtime are already initialized via imports
  try {
    if (typeof globalThis !== 'undefined') {
      // Only define if not already defined
      if (!globalThis.atob) {
        (globalThis as any).atob = atob;
      }
      
      if (!globalThis.btoa) {
        (globalThis as any).btoa = btoa;
      }
      
      // Provide DOMException if not available (mainly for Node.js)
      if (!globalThis.DOMException) {
        (globalThis as any).DOMException = class DOMExceptionPolyfill extends Error {
          code: number;
          constructor(message: string, name: string) {
            super(message);
            this.name = name || 'Error';
            this.code = 0; // Basic implementation
          }
        };
      }

      // Initialize storage API polyfills for browser environment
      if (isBrowser) {
        polyfillStorageAPI();
        
        // Patch webpack if we're in the browser
        patchWebpackRuntime();
      }
    }
  } catch (error) {
    console.warn("Error initializing polyfills:", error);
  }
}

/**
 * Patch webpack runtime to handle common errors
 * This helps prevent "Cannot read properties of undefined (reading 'call')" errors
 */
function patchWebpackRuntime(): void {
  if (!isBrowser) return;
  
  try {
    // Wait for webpack to be defined
    setTimeout(() => {
      if (window.__webpack_require__) {
        const originalRequire = window.__webpack_require__;
        
        // Patch the require function
        window.__webpack_require__ = function patchedRequire(moduleId: any) {
          try {
            // Handle null or undefined moduleId
            if (moduleId == null) return {};
            
            // Handle case where module doesn't exist
            if (window.__webpack_modules__ && !window.__webpack_modules__[moduleId]) {
              console.warn(`Module ${moduleId} not found, returning empty object`);
              return {};
            }
            
            return originalRequire(moduleId);
          } catch (e) {
            console.warn(`Error requiring module ${moduleId}:`, e);
            return {};
          }
        };
        
        // Copy all properties from original require
        for (const key in originalRequire) {
          if (Object.prototype.hasOwnProperty.call(originalRequire, key)) {
            window.__webpack_require__[key] = originalRequire[key];
          }
        }
        
        // Patch factory function to handle undefined modules
        const originalFactory = window.__webpack_require__.f;
        if (originalFactory) {
          window.__webpack_require__.f = {
            ...originalFactory,
            j: function patchedFactoryJ(chunkId: any) {
              try {
                return originalFactory.j(chunkId);
              } catch (e) {
                console.warn(`Error in webpack factory for chunk ${chunkId}:`, e);
                return Promise.resolve();
              }
            }
          };
        }
      }
    }, 0);
  } catch (e) {
    console.warn("Error applying webpack patches:", e);
  }
} 