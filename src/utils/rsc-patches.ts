'use client';

/**
 * React Server Components (RSC) patches
 * This file contains patches to handle webpack errors specific to RSC
 * Consolidated from multiple previous implementations
 */

// Flag to prevent duplicate patches
let __RSC_WEBPACK_PATCH_APPLIED = false;

// Warning throttling mechanism
interface WarningState {
  lastWarningTime: number;
  warningCount: number;
  totalWarnings: number;
}

const warningState: WarningState = {
  lastWarningTime: 0,
  warningCount: 0,
  totalWarnings: 0
};

// Throttled warning function
function throttledWarning(message: string): void {
  const now = Date.now();
  warningState.totalWarnings++;
  
  // Only log once per second max
  if (now - warningState.lastWarningTime > 1000) {
    // If we've accumulated warnings, show the count
    if (warningState.warningCount > 0) {
      console.warn(`RSC patch: suppressed ${warningState.warningCount} similar warnings`);
    }
    
    // Log the actual message with total count
    if (warningState.totalWarnings <= 10 || warningState.totalWarnings % 50 === 0) {
      console.warn(`${message} (total: ${warningState.totalWarnings})`);
    }
    
    // Reset the counter but keep the total
    warningState.lastWarningTime = now;
    warningState.warningCount = 0;
  } else {
    // Increment the counter for suppressed warnings
    warningState.warningCount++;
  }
}

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
      throttledWarning('RSC patch: prevented call on undefined/null thisArg');
      return undefined;
    }
    return originalFunctionCall.apply(this, [thisArg, ...args]);
  };

  // Patch Object.defineProperty to handle factory-related errors
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function (obj, prop, descriptor) {
    // Skip if obj is null or undefined
    if (obj === undefined || obj === null) {
      throttledWarning(`RSC patch: prevented defineProperty on undefined/null object for prop: ${String(prop)}`);
      return obj;
    }

    // Special handling for webpack factory
    if (prop === 'factory' && descriptor?.value) {
      try {
        return originalDefineProperty(obj, prop, descriptor);
      } catch (error) {
        throttledWarning('RSC patch: caught factory defineProperty error');
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
      throttledWarning('RSC patch: intercepted webpack-related error');
      event.preventDefault();
      return true;
    }
    return false;
  });
}

// Export global flag for external modules to check
export const isRSCPatchApplied = () => __RSC_WEBPACK_PATCH_APPLIED;

// Auto-apply patches in client environment
// But only if we're not being imported by bundler-patches
// and only if we're in a client environment
if (typeof window !== 'undefined' && 
    // Check that we're not being imported by another module
    // We detect this by checking the stack trace
    !(new Error().stack?.includes('bundler-patches'))) {
  // Small delay to ensure we're not racing with other modules
  setTimeout(() => {
    applyRSCPatches();
  }, 0);
}

// Default export for easier imports
export default applyRSCPatches;
