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
    return new DOMException(message, name);
  } else {
    // In Node.js, create a custom error that mimics DOMException
    const error = new Error(message);
    error.name = name;
    return error;
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
  }
} 