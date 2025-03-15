/**
 * Polyfills for browser and server environments
 * This file provides compatibility functions that work across environments
 */

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
    return createDOMException(message, name);
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
    }
  }
} 