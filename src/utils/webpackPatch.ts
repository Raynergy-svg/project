/**
 * Webpack/Turbopack specific patches
 * This file contains patches for webpack-related errors in Next.js
 */

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
    const patchWebpackChunks = () => {
      // Create array for webpack chunks if it doesn't exist
      if (!Array.isArray(window.webpackChunk_N_E)) {
        window.webpackChunk_N_E = [];
      }
      
      // Patch push method to handle errors
      const originalPush = window.webpackChunk_N_E.push;
      if (originalPush) {
        window.webpackChunk_N_E.push = function patchedPush(...args) {
          try {
            return originalPush.apply(this, args);
          } catch (e) {
            console.warn('Error in webpack chunk push:', e);
            return 0;
          }
        };
      }
    };

    // Apply patches
    setTimeout(() => {
      patchTurbopack();
      patchWebpackChunks();
    }, 0);
  } catch (e) {
    console.warn('Error in webpack patch:', e);
  }
} 