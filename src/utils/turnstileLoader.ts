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

/**
 * Ensures we have a preconnect link for Cloudflare challenges domain
 * This improves performance and prevents preload warnings
 */
const ensurePreconnect = () => {
  if (typeof document === 'undefined') return;
  
  // Check if we already have a preconnect link
  const existingLink = document.querySelector('link[rel="preconnect"][href="https://challenges.cloudflare.com"]');
  if (existingLink) return;
  
  // Add preconnect link to speed up future requests
  const preconnectLink = document.createElement('link');
  preconnectLink.rel = 'preconnect';
  preconnectLink.href = 'https://challenges.cloudflare.com';
  preconnectLink.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectLink);
  
  console.log('🔒 Turnstile: Added preconnect hint for challenges.cloudflare.com');
};

/**
 * Loads the Turnstile script exactly once, returning a promise that resolves
 * when the script has loaded. Multiple calls will return the same promise.
 */
export const loadTurnstileScript = (): Promise<void> => {
  // Ensure we have the preconnect link
  ensurePreconnect();

  // If the script is already loaded, return a resolved promise
  if (typeof window !== 'undefined' && window.turnstile) {
    isScriptLoaded = true;
    return Promise.resolve();
  }
  
  // If we're already loading the script, return the existing promise
  if (isScriptLoading && scriptLoadPromise) {
    return scriptLoadPromise;
  }
  
  // Otherwise, create a new load promise
  isScriptLoading = true;
  
  // IMPORTANT: We're removing the 'render=explicit' parameter when loading the script initially
  // We will NOT use ?render=explicit until after the script has fully loaded
  // This prevents the Turnstile error about using turnstile.ready() too early
  const callbackName = `__turnstileOnLoad${Date.now()}`;

  // First, add the global callback that will be called by the script
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Create a global callback that will be called when the script loads
    (window as any)[callbackName] = () => {
      console.log('🔒 Turnstile: Script loaded globally via callback');
      isScriptLoaded = true;
      isScriptLoading = false;
      
      setTimeout(() => {
        // Call any registered callbacks
        while (scriptLoadCallbacks.length > 0) {
          const callback = scriptLoadCallbacks.shift();
          if (callback) {
            try {
              callback();
            } catch (e) {
              console.error('🔒 Turnstile: Error in callback after script loaded', e);
            }
          }
        }
      }, 10);
      
      resolve();
      
      // Clean up the global callback
      setTimeout(() => {
        delete (window as any)[callbackName];
      }, 1000);
    };
    
    // IMPORTANT: The script tag does NOT include 'async' or 'defer' attributes
    // This ensures the script loads synchronously, fully loads before we try to use it
    const script = document.createElement('script');
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${callbackName}`;
    // Remove the render=explicit parameter for initial load, will be added later
    // script.async = true; - Removing this attribute as per warning
    // script.defer = true; - Removing this attribute as per warning
    
    script.onerror = (error) => {
      console.error('🔒 Turnstile: Failed to load script globally', error);
      isScriptLoading = false;
      reject(error);
      
      // Clean up the global callback
      delete (window as any)[callbackName];
      
      // Clear any queued callbacks
      scriptLoadCallbacks = [];
    };
    
    document.head.appendChild(script);
    
    // Add a timeout to prevent hanging if the script fails to call the callback
    setTimeout(() => {
      if (!isScriptLoaded) {
        console.warn('🔒 Turnstile: Script load timed out, checking direct availability');
        if (window.turnstile) {
          // Script is available but callback wasn't called for some reason
          (window as any)[callbackName]();
        } else {
          console.error('🔒 Turnstile: Script load timed out and turnstile not available');
          reject(new Error('Turnstile script load timed out'));
        }
      }
    }, 10000);
  });
  
  return scriptLoadPromise;
};

/**
 * Register a callback to be executed when Turnstile is fully loaded
 * This is safer than using turnstile.ready() directly which can break if called too early
 */
export const onTurnstileLoad = (callback: Function): void => {
  // If turnstile is already loaded and ready, execute immediately
  if (isScriptLoaded && window.turnstile) {
    try {
      // WARNING: We're NOT using turnstile.ready here as that's what causes the error
      // Instead just execute the callback directly since we know Turnstile is loaded
      setTimeout(() => {
        try {
          callback();
        } catch (e) {
          console.error('🔒 Turnstile: Error in callback executed directly', e);
        }
      }, 0);
    } catch (e) {
      console.warn('🔒 Turnstile: Error executing callback directly', e);
    }
    return;
  }
  
  // Not loaded yet, queue for execution when loaded
  scriptLoadCallbacks.push(() => {
    // WARNING: Do NOT use turnstile.ready as that causes the error
    // Instead just execute the callback directly once the script is fully loaded
    setTimeout(() => {
      try {
        callback();
      } catch (e) {
        console.error('🔒 Turnstile: Error in queued callback', e);
      }
    }, 0);
  });
  
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
 * Try to clean up Turnstile instances and reset state
 * Use this in case of errors to try again with a clean slate
 */
export const resetTurnstileState = (): void => {
  try {
    if (window.turnstile) {
      // Get all turnstile containers
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
    }
  } catch (e) {
    console.warn('🔒 Turnstile: Error resetting Turnstile state', e);
  }
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
  }
} 