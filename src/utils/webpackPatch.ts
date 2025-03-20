/**
 * Webpack/Turbopack specific patches
 * This file contains patches for webpack-related errors in Next.js
 */

// TypeScript declarations for window properties used by webpack/turbopack
declare global {
  interface Window {
    __TURBOPACK__?: any;
    webpackChunk_N_E?: any[];
    _webpack_require__?: any;
    _N_E?: any;
  }
}

// Use ES module syntax by adding export statement
export {}; // Empty export to signal this is an ES module

if (typeof window !== 'undefined') {
  try {
    // Patch for TURBOPACK module errors
    const patchTurbopack = () => {
      // Create a proxy for any missing TURBOPACK modules
      if (typeof window.__TURBOPACK__ === 'undefined') {
        window.__TURBOPACK__ = new Proxy({}, {
          get: (target, prop) => {
            if (prop === '__turbopack_external_require__') {
              return (id: string) => {
                console.warn(`External require called for ${id}`);
                return {};
              };
            }
            
            if (!(prop in target)) {
              console.warn(`Accessing undefined TURBOPACK property: ${String(prop)}`);
              return () => {};
            }
            
            return target[prop as keyof typeof target];
          }
        });
      }
      
      // Add safety for common property accesses
      if (window.__TURBOPACK__ && !window.__TURBOPACK__.__turbopack_external_require__) {
        window.__TURBOPACK__.__turbopack_external_require__ = (id: string) => {
          console.warn(`External require called for ${id}`);
          return {};
        };
      }
    };

    // Patch for webpack chunks
    const applyBundlerPatchesChunks = () => {
      // Safely create webpack chunk array if not existing
      if (!window.webpackChunk_N_E) {
        window.webpackChunk_N_E = [];
      }
      
      // Patch push method to handle errors
      const originalPush = Array.prototype.push;
      if (window.webpackChunk_N_E) {
        // Add a patched flag via a Symbol for better type safety
        const patchedSymbol = Symbol.for('webpackPatchedPush');
        if (!(patchedSymbol in window.webpackChunk_N_E)) {
          Object.defineProperty(window.webpackChunk_N_E, patchedSymbol, { value: true });
          window.webpackChunk_N_E.push = function patchedPush(...args: any[]) {
          try {
            return originalPush.apply(this, args);
          } catch (e) {
            console.warn('Error in webpack chunk push:', e);
            return this.length;
          }
        };
        }
      }
      
      // Patch webpack require
      if (typeof window._webpack_require__ === 'undefined') {
        window._webpack_require__ = function(moduleId: string) {
          console.warn(`Patched webpack require called for ${moduleId}`);
          return {};
        };
      }
      
      // Create empty _N_E object if not existing
      if (!window._N_E) {
        window._N_E = {};
      }
    };

    // Apply patches
    setTimeout(() => {
      patchTurbopack();
      applyBundlerPatchesChunks();
      console.log('Webpack/Turbopack patching complete');
    }, 0);
  } catch (e) {
    console.warn('Error in webpack patch:', e);
  }
} 