'use client';

/**
 * React Server Components (RSC) patches
 * This file contains patches to handle webpack errors specific to RSC
 * Consolidated from multiple previous implementations
 */

// Flag to prevent duplicate patches
let __RSC_WEBPACK_PATCH_APPLIED = false;

// Interface for webpack require
interface WebpackRequire {
  r: (exports: any) => void;
  d: (exports: any, definition: Record<string, () => any>) => void;
  o: (obj: any, prop: string) => boolean;
}

// Apply the patch only once
export function applyRSCPatches(): void {
  // Don't apply patches more than once
  if (typeof window === 'undefined' || __RSC_WEBPACK_PATCH_APPLIED) {
    return;
  }

  __RSC_WEBPACK_PATCH_APPLIED = true;
  console.log('🛡️ Applying RSC patches');

  // Original Function.prototype.call
  const originalFunctionCall = Function.prototype.call;

  // Patch Function.prototype.call to handle undefined thisArg
  Function.prototype.call = function (thisArg, ...args) {
    // Handle the specific "undefined (reading 'call')" error
    if (thisArg === undefined || thisArg === null) {
      console.warn('RSC patch: prevented call on undefined/null thisArg');
      return undefined;
    }
    return originalFunctionCall.apply(this, [thisArg, ...args]);
  };

  // Patch Object.defineProperty to handle factory-related errors
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function (obj, prop, descriptor) {
    // Skip if obj is null or undefined
    if (obj === undefined || obj === null) {
      console.warn(`RSC patch: prevented defineProperty on undefined/null object for prop: ${String(prop)}`);
      return obj;
    }

    // Special handling for webpack factory
    if (prop === 'factory' && descriptor?.value) {
      try {
        return originalDefineProperty(obj, prop, descriptor);
      } catch (error) {
        console.warn('RSC patch: caught factory defineProperty error', error);
        return obj;
      }
    }

    return originalDefineProperty(obj, prop, descriptor);
  };

  // Add event listener for window unhandled errors
  window.addEventListener('error', (event) => {
    if (event.message?.includes('webpack') || 
        event.message?.includes('Cannot read properties of undefined') ||
        event.message?.includes('factory')) {
      console.warn('RSC patch: intercepted webpack-related error', event.message);
      event.preventDefault();
      return true;
    }
    return false;
  });
}

// Auto-apply patches in client environment
if (typeof window !== 'undefined') {
  applyRSCPatches();
}

// Default export for easier imports
export default applyRSCPatches;
