/**
 * Shared Turnstile Script Loader
 * 
 * This utility provides a singleton mechanism for loading the Turnstile script
 * exactly once across the application, preventing duplicate script loading.
 */

// Global script loading state to prevent multiple loads
let isScriptLoading = false;
let isScriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;
let scriptLoadCallbacks: Function[] = [];

// Track all rendered widgets
const renderedWidgets: Record<string, string> = {};

/**
 * Use requestIdleCallback or a polyfill to defer non-critical operations
 */
const scheduleTask = (callback: () => void, timeout = 1000) => {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    // Fallback to setTimeout with a small delay
    setTimeout(callback, 20);
  }
};

/**
 * Ensures we have a preconnect link for Cloudflare challenges domain
 * This improves performance and prevents preload warnings
 */
const ensurePreconnect = () => {
  if (typeof document === 'undefined') return;
  
  // Use requestAnimationFrame to batch DOM operations
  requestAnimationFrame(() => {
    // Check if we already have a preconnect link
    const existingLink = document.querySelector('link[rel="preconnect"][href="https://challenges.cloudflare.com"]');
    if (existingLink) return;
    
    // Create a document fragment to batch DOM operations
    const fragment = document.createDocumentFragment();
    
    // Add preconnect link to speed up future requests
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = 'https://challenges.cloudflare.com';
    preconnectLink.crossOrigin = 'anonymous';
    fragment.appendChild(preconnectLink);
    
    // Add DNS-prefetch as fallback for browsers that don't support preconnect
    const dnsPrefetchLink = document.createElement('link');
    dnsPrefetchLink.rel = 'dns-prefetch';
    dnsPrefetchLink.href = 'https://challenges.cloudflare.com';
    fragment.appendChild(dnsPrefetchLink);
    
    // Append all elements at once to minimize reflows
    document.head.appendChild(fragment);
    
    console.log('🔒 Turnstile: Added connection hints for challenges.cloudflare.com');
    
    // Schedule the cleanup of any preload links during idle time
    scheduleTask(() => {
      // Remove any preload links that might be causing warnings
      const preloadLinks = document.querySelectorAll('link[rel="preload"][href*="challenges.cloudflare.com"]');
      
      if (preloadLinks.length > 0) {
        console.log('🔒 Turnstile: Removing problematic preload links', preloadLinks.length);
        preloadLinks.forEach(link => link.remove());
      }
    });
  });
};

/**
 * Loads the Turnstile script exactly once, returning a promise that resolves
 * when the script has loaded. Multiple calls will return the same promise.
 */
export const loadTurnstileScript = (): Promise<void> => {
  // Return the existing promise if we're already loading
  if (isScriptLoading && scriptLoadPromise) {
    console.log('🔒 Turnstile: Already loading script, returning existing promise');
    return scriptLoadPromise;
  }

  // If already loaded, return resolved promise
  if (isScriptLoaded) {
    console.log('🔒 Turnstile: Script already loaded');
    return Promise.resolve();
  }

  console.log('🔒 Turnstile: Starting script load');
  isScriptLoading = true;

  // Clear any existing script elements to avoid conflicts
  const oldScripts = document.querySelectorAll('script[src*="challenges.cloudflare.com/turnstile"]');
  oldScripts.forEach(script => {
    try {
      script.remove();
    } catch (e) {
      console.warn('🔒 Turnstile: Failed to remove old script', e);
    }
  });

  // Create a unique callback name to avoid collisions
  const callbackName = `onTurnstileLoad_${Date.now()}`;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Create a global callback that will be called when the script loads
    (window as any)[callbackName] = () => {
      console.log('🔒 Turnstile: Script loaded successfully');
      isScriptLoaded = true;
      isScriptLoading = false;

      // Call all queued callbacks
      while (scriptLoadCallbacks.length > 0) {
        const callback = scriptLoadCallbacks.shift();
        if (callback) {
          try {
            callback();
          } catch (e) {
            console.error('🔒 Turnstile: Error in load callback', e);
          }
        }
      }

      // Remove the global callback to clean up
      delete (window as any)[callbackName];

      resolve();
    };

    // Set up a timeout to detect script load failures
    const timeoutMs = 10000; // 10 seconds
    const timeoutId = setTimeout(() => {
      if (!isScriptLoaded) {
        console.error(`🔒 Turnstile: Script load timed out after ${timeoutMs}ms`);
        isScriptLoading = false;
        
        // Try alternative loading method before giving up
        tryAlternativeScriptLoad()
          .then(() => {
            (window as any)[callbackName]();
          })
          .catch(error => {
            console.error('🔒 Turnstile: Alternative script load failed', error);
            delete (window as any)[callbackName];
            reject(new Error(`Script load timed out and turnstile not available: ${error.message}`));
          });
      }
    }, timeoutMs);
    
    // Create and append the script element - using a different approach to avoid preload issues
    requestAnimationFrame(() => {
      // Create and append the script element
      const script = document.createElement('script');
      script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${callbackName}`;
      script.id = 'cf-turnstile-script';
      script.async = true;
      
      script.onload = () => {
        // The script has loaded, but we'll wait for the callback to be called
        console.log('🔒 Turnstile: Script element loaded');
        clearTimeout(timeoutId);
        
        // If the turnstile object is available but the callback hasn't been called,
        // manually trigger the callback after a short delay
        setTimeout(() => {
          if (window.turnstile && !isScriptLoaded) {
            console.log('🔒 Turnstile: Manually triggering callback');
            (window as any)[callbackName]();
          }
        }, 1000);
      };
      
      script.onerror = (error) => {
        console.error('🔒 Turnstile: Failed to load script', error);
        isScriptLoading = false;
        clearTimeout(timeoutId);
        
        // Clean up the global callback
        delete (window as any)[callbackName];
        
        // Try alternative loading method
        tryAlternativeScriptLoad()
          .then(() => {
            console.log('🔒 Turnstile: Alternative load succeeded');
            isScriptLoaded = true;
            resolve();
          })
          .catch(err => {
            console.error('🔒 Turnstile: All loading methods failed', err);
            reject(error);
          });
      };
      
      document.head.appendChild(script);
    });
  });

  return scriptLoadPromise;
};

// Helper function to try alternative script loading methods
const tryAlternativeScriptLoad = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('🔒 Turnstile: Trying alternative script loading method');
    
    // Method 1: Direct script insertion without onload parameter
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    
    script.onload = () => {
      console.log('🔒 Turnstile: Alternative script load successful');
      
      // Check if the turnstile object is actually available
      if (window.turnstile) {
        isScriptLoaded = true;
        resolve();
      } else {
        // Wait a bit longer for turnstile to initialize
        setTimeout(() => {
          if (window.turnstile) {
            isScriptLoaded = true;
            resolve();
          } else {
            reject(new Error('Turnstile object not available after script load'));
          }
        }, 2000);
      }
    };
    
    script.onerror = () => {
      console.error('🔒 Turnstile: Alternative script loading failed');
      reject(new Error('Alternative script loading failed'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Register a callback to be executed when Turnstile is fully loaded
 */
export const onTurnstileLoad = (callback: Function): void => {
  // If turnstile is already loaded, execute immediately
  if (isScriptLoaded && window.turnstile) {
    // Use setTimeout to push the callback to the next event loop tick
    setTimeout(() => {
      try {
        callback();
      } catch (e) {
        console.error('🔒 Turnstile: Error in callback executed directly', e);
      }
    }, 0);
    return;
  }
  
  // Not loaded yet, queue for execution when loaded
  scriptLoadCallbacks.push(callback);
  
  // Make sure the script is loading
  if (!isScriptLoading && !isScriptLoaded) {
    loadTurnstileScript().catch(e => {
      console.error('🔒 Turnstile: Error loading script in onTurnstileLoad', e);
    });
  }
};

/**
 * Check if the script is already loaded
 */
export const isTurnstileScriptLoaded = (): boolean => {
  return isScriptLoaded || (typeof window !== 'undefined' && !!window.turnstile);
};

/**
 * Register a widget to prevent duplicate rendering
 */
export const registerWidget = (containerId: string, widgetId: string): void => {
  renderedWidgets[containerId] = widgetId;
};

/**
 * Unregister a widget when it's removed
 */
export const unregisterWidget = (containerId: string): void => {
  delete renderedWidgets[containerId];
};

/**
 * Check if a container already has a widget
 */
export const hasRegisteredWidget = (containerId: string): boolean => {
  return !!renderedWidgets[containerId];
};

/**
 * Get a widget ID for a container
 */
export const getWidgetIdForContainer = (containerId: string): string | undefined => {
  return renderedWidgets[containerId];
};

/**
 * Try to clean up Turnstile instances and reset state
 * Use this in case of errors to try again with a clean slate
 */
export const resetTurnstileState = (): void => {
  try {
    if (window.turnstile) {
      // Clean up all registered widgets
      Object.entries(renderedWidgets).forEach(([containerId, widgetId]) => {
        try {
          window.turnstile?.remove(widgetId);
          console.log(`🔒 Turnstile: Removed widget ${widgetId} from container ${containerId}`);
        } catch (e) {
          console.warn(`🔒 Turnstile: Error removing widget ${widgetId}`, e);
        }
      });
      
      // Clear the registry
      Object.keys(renderedWidgets).forEach(key => {
        delete renderedWidgets[key];
      });
      
      // Schedule cleanup of additional widgets during idle time
      scheduleTask(() => {
        try {
          // Also look for any widgets we might have missed
          const containers = document.querySelectorAll('[class*="turnstile"], [id*="turnstile"]');
          containers.forEach(container => {
            try {
              // Try to remove any existing widgets
              const id = container.getAttribute('data-widget-id');
              if (id) {
                window.turnstile.remove(id);
              }
              
              // Clear any data attributes we set
              container.removeAttribute('data-widget-id');
              container.removeAttribute('data-state');
            } catch (e) {
              console.warn('🔒 Turnstile: Error cleaning up Turnstile widget', e);
            }
          });
        } catch (e) {
          console.warn('🔒 Turnstile: Error in scheduled cleanup', e);
        }
      });
    }
  } catch (e) {
    console.warn('🔒 Turnstile: Error resetting Turnstile state', e);
  }
};

/**
 * Force a full cleanup of Turnstile widgets
 * This is more aggressive than resetTurnstileState
 */
export const forceCleanupTurnstile = () => {
  resetTurnstileState();
  
  // Schedule removal of scripts during idle time
  scheduleTask(() => {
    try {
      const scripts = document.querySelectorAll('script[src*="challenges.cloudflare.com"]');
      scripts.forEach(script => {
        script.remove();
      });
      
      // Reset our state
      isScriptLoaded = false;
      isScriptLoading = false;
      scriptLoadPromise = null;
      scriptLoadCallbacks = [];
      
      // Try to clear the global turnstile object
      if (window.turnstile) {
        try {
          // @ts-ignore - We're intentionally trying to remove the global object
          window.turnstile = undefined;
        } catch (e) {
          console.warn('🔒 Turnstile: Could not remove global turnstile object', e);
        }
      }
    } catch (e) {
      console.warn('🔒 Turnstile: Error forcing cleanup', e);
    }
  });
};

// Add TypeScript declaration for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, any>
      ) => string;
      ready: (callback: Function) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      isExpired: (widgetId?: string) => boolean;
    };
    requestIdleCallback?: (
      callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
      options?: { timeout: number }
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  }
} 