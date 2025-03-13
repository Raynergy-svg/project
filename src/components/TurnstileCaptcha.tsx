'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY, isTurnstileDisabled, generateBypassToken } from '@/utils/turnstile';
import { IS_DEV } from '@/utils/environment';
import { 
  loadTurnstileScript, 
  isTurnstileScriptLoaded,
  onTurnstileLoad,
  resetTurnstileState
} from '@/utils/turnstileLoader';
import { clearTurnstileWidgets } from '@/components/auth/TurnstileWidget';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  action?: string; // For analytics
}

// Global widget registry to avoid duplicates
const captchaWidgetRegistry: Record<string, boolean> = {};

// Track widget IDs for proper cleanup
const captchaWidgetIdRegistry: Record<string, string> = {};

// Function to safely render the Turnstile widget
const renderSafely = (
  container: HTMLElement, 
  options: any, 
  onSuccess: (widgetId: string) => void,
  onFail: (error: any) => void
) => {
  try {
    if (!window.turnstile) {
      throw new Error('Turnstile not loaded');
    }
    
    // Get a unique identifier for this container
    const containerKey = container.id || container.getAttribute('data-turnstile-container');
    
    // Check if this container already has a widget
    if (containerKey && captchaWidgetRegistry[containerKey]) {
      console.log(`🔑 CAPTCHA: Container ${containerKey} already has a widget. Handling duplicate render.`);
      
      // Get the existing widget ID from our registry
      const existingWidgetId = captchaWidgetIdRegistry[containerKey];
      
      // If we already have a widget ID, reuse it instead of re-rendering
      if (existingWidgetId) {
        console.log(`🔑 CAPTCHA: Reusing existing widget ${existingWidgetId} for container ${containerKey}`);
        onSuccess(existingWidgetId);
        return;
      }
      
      // If we don't have the widget ID cached, try to clean up any existing widget
      try {
        const widgetId = container.getAttribute('data-widget-id');
        if (widgetId && window.turnstile) {
          window.turnstile.remove(widgetId);
          console.log(`🔑 CAPTCHA: Removed existing widget ${widgetId} from container ${containerKey}`);
          
          // Clear the container
          container.innerHTML = '';
          
          // Remove from registry to allow re-rendering
          delete captchaWidgetRegistry[containerKey];
          delete captchaWidgetIdRegistry[containerKey];
        }
      } catch (e) {
        console.error(`🔑 CAPTCHA: Error cleaning up existing widget in container ${containerKey}`, e);
        onFail(new Error(`Container ${containerKey} already has a widget and cleanup failed`));
        return;
      }
    }
    
    // Register this container before rendering
    if (containerKey) {
      captchaWidgetRegistry[containerKey] = true;
      console.log(`🔑 CAPTCHA: Registered container ${containerKey} for widget rendering`);
    }
    
    // Use our safer onTurnstileLoad helper - do NOT use turnstile.ready directly
    // This avoids the error about calling turnstile.ready() before script is loaded
    onTurnstileLoad(() => {
      try {
        // At this point, we can safely assume Turnstile is fully loaded
        if (!window.turnstile) {
          throw new Error('Turnstile unexpectedly undefined after load');
        }
        
        // Double check the container is still in the DOM before rendering
        if (!document.body.contains(container)) {
          console.warn(`🔑 CAPTCHA: Container ${containerKey} is no longer in the DOM`);
          if (containerKey) {
            delete captchaWidgetRegistry[containerKey];
            delete captchaWidgetIdRegistry[containerKey];
          }
          onFail(new Error('Container is no longer in the DOM'));
          return;
        }
        
        // If this container already has a data-widget-id attribute, 
        // the widget may have been rendered already by React StrictMode
        const existingWidgetId = container.getAttribute('data-widget-id');
        if (existingWidgetId) {
          console.log(`🔑 CAPTCHA: Found existing widget ID ${existingWidgetId} in container ${containerKey}`);
          
          // Store the widget ID in our registry
          if (containerKey) {
            captchaWidgetIdRegistry[containerKey] = existingWidgetId;
          }
          
          onSuccess(existingWidgetId);
          return;
        }
        
        // Now render the widget directly without ready()
        const widgetId = window.turnstile.render(container, options);
        if (widgetId) {
          console.log(`🔑 CAPTCHA: Successfully rendered widget ${widgetId} in container ${containerKey}`);
          
          // Store the widget ID in our registry
          if (containerKey) {
            captchaWidgetIdRegistry[containerKey] = widgetId;
          }
          
          onSuccess(widgetId);
        } else {
          onFail(new Error('Failed to get widget ID from Turnstile'));
          // Unregister on failure
          if (containerKey) {
            delete captchaWidgetRegistry[containerKey];
            delete captchaWidgetIdRegistry[containerKey];
          }
        }
      } catch (error) {
        console.error('🔑 CAPTCHA: Error rendering in callback', error);
        onFail(error);
        // Unregister on failure
        if (containerKey) {
          delete captchaWidgetRegistry[containerKey];
          delete captchaWidgetIdRegistry[containerKey];
        }
      }
    });
  } catch (error) {
    console.error('🔑 CAPTCHA: Error setting up rendering', error);
    onFail(error);
    
    // Unregister on failure
    const containerKey = container.id || container.getAttribute('data-turnstile-container');
    if (containerKey) {
      delete captchaWidgetRegistry[containerKey];
      delete captchaWidgetIdRegistry[containerKey];
    }
  }
};

// Generate a unique ID for each Turnstile container
function generateUniqueId(): string {
  return `turnstile-container-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Turnstile Captcha Component
 * 
 * This component renders a Cloudflare Turnstile captcha widget
 * and handles verification callbacks.
 */
export default function TurnstileCaptcha({
  onVerify,
  onError,
  onExpire,
  className = '',
  theme = 'auto',
  size = 'normal',
  action = 'login'
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [componentScriptLoaded, setComponentScriptLoaded] = useState(isTurnstileScriptLoaded());
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [containerId] = useState(generateUniqueId());
  
  // Call clearTurnstileWidgets on initial mount to clean up any leftover widgets
  useEffect(() => {
    // Clear any leftover widgets from previous renders
    clearTurnstileWidgets();
    return () => {
      // Cleanup this specific widget on unmount
      if (widgetId && window.turnstile) {
        try {
          console.log(`🔑 CAPTCHA: Removing widget ${widgetId} on component unmount`);
          window.turnstile.remove(widgetId);
          
          // Remove from registry
          delete captchaWidgetRegistry[containerId];
          delete captchaWidgetIdRegistry[containerId];
          console.log(`🔑 CAPTCHA: Unregistered container ${containerId} on unmount`);
        } catch (e) {
          console.warn('🔑 CAPTCHA: Error removing widget on unmount', e);
        }
      }
    };
  }, [containerId, widgetId]);

  // Load the Turnstile script
  useEffect(() => {
    // Skip in development mode if needed
    if (IS_DEV && isTurnstileDisabled()) {
      // In development, we can bypass the captcha
      const bypassToken = generateBypassToken();
      console.log('🔑 CAPTCHA: Using bypass token in development mode', bypassToken);
      setTimeout(() => {
        onVerify(bypassToken);
      }, 500);
      return;
    }
    
    // If script is already loaded, update state immediately
    if (isTurnstileScriptLoaded()) {
      setComponentScriptLoaded(true);
      return;
    }

    // Load the script just once using the shared global loader
    console.log('🔑 CAPTCHA: Loading Turnstile script...');
    loadTurnstileScript()
      .then(() => {
        console.log('🔑 CAPTCHA: Turnstile script loaded successfully');
        setComponentScriptLoaded(true);
      })
      .catch((error) => {
        console.error('🔑 CAPTCHA: Failed to load Turnstile script:', error);
        // Try again if we haven't attempted too many times
        if (loadAttempts < 2) {
          setTimeout(() => {
            setLoadAttempts(prev => prev + 1);
          }, 2000);
        }
        if (onError) {
          onError(new Error('Failed to load Turnstile script'));
        }
      });
      
    // No cleanup needed since we're using a global loader
  }, [onError, onVerify, loadAttempts]);

  // Render the widget when the script is loaded
  useEffect(() => {
    if (!componentScriptLoaded || !containerRef.current || isRendered || (IS_DEV && isTurnstileDisabled())) {
      return;
    }
    
    // Check if there's already a widget ID stored for this container
    // This helps handle React StrictMode's double rendering
    const containerElement = containerRef.current;
    const containerIdValue = containerElement.id || containerElement.getAttribute('data-turnstile-container');
    const existingWidgetId = containerIdValue ? captchaWidgetIdRegistry[containerIdValue] : null;
    
    if (existingWidgetId) {
      console.log(`🔑 CAPTCHA: Reusing existing widget ${existingWidgetId} for ${containerIdValue} during re-render`);
      setWidgetId(existingWidgetId);
      setIsRendered(true);
      return;
    }
    
    try {
      console.log('🔑 CAPTCHA: Setting up widget with site key', TURNSTILE_SITE_KEY);
      
      const options = {
        sitekey: TURNSTILE_SITE_KEY,
        theme,
        size,
        action,
        retry: 'auto',
        'refresh-expired': 'auto',
        callback: (token: string) => {
          console.log('🔑 CAPTCHA: Verification successful');
          onVerify(token);
        },
        'expired-callback': () => {
          console.warn('🔑 CAPTCHA: Token expired');
          if (onExpire) {
            onExpire();
          }
        },
        'error-callback': (error: any) => {
          console.error('🔑 CAPTCHA: Turnstile error:', error);
          
          // Handle specific error codes
          if (error === '110200') {
            console.warn('🔑 CAPTCHA: Error 110200 - Network error or invalid configuration');
            // Try to reset the widget to recover
            setTimeout(() => {
              if (widgetId && window.turnstile) {
                try {
                  window.turnstile.reset(widgetId);
                } catch (e) {
                  // If reset fails, try to completely reset the state
                  resetTurnstileState();
                  // Signal we need to re-render
                  setIsRendered(false);
                  
                  // Only try reloading if we haven't tried too many times
                  if (renderAttempts < 2) {
                    setRenderAttempts(prev => prev + 1);
                    setComponentScriptLoaded(false);
                    setTimeout(() => {
                      setComponentScriptLoaded(true);
                    }, 1000);
                  }
                }
              }
            }, 1000);
          }
          
          if (onError) {
            onError(new Error(`Turnstile verification failed: ${error}`));
          }
        }
      };
      
      // Use the safer rendering approach
      renderSafely(
        containerRef.current,
        options,
        (newWidgetId) => {
          setWidgetId(newWidgetId);
          setIsRendered(true);
          
          // Store the widget ID as a data attribute for debugging
          if (containerRef.current) {
            containerRef.current.setAttribute('data-widget-id', newWidgetId);
          }
          
          // Also store in our registry
          if (containerIdValue) {
            captchaWidgetIdRegistry[containerIdValue] = newWidgetId;
          }
        },
        (error) => {
          console.error('🔑 CAPTCHA: Error rendering widget:', error);
          
          // Only attempt re-render if we haven't tried too many times
          if (renderAttempts < 2) {
            setTimeout(() => {
              setRenderAttempts(prev => prev + 1);
              // Force a refresh of the component
              setIsRendered(false);
            }, 2000);
          }
          
          if (onError) {
            onError(error instanceof Error ? error : new Error('Failed to render Turnstile widget'));
          }
        }
      );
    } catch (error) {
      console.error('🔑 CAPTCHA: Error in render effect:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to render Turnstile widget'));
      }
    }

    return () => {
      // Cleanup widget if it exists, but only if it's not in our registry
      // This prevents cleaning up during StrictMode's double-run
      if (widgetId && window.turnstile) {
        try {
          // Don't actually remove the widget if it's in our registry
          // This helps with React StrictMode double rendering
          const shouldRemove = !containerIdValue || !captchaWidgetIdRegistry[containerIdValue];
          
          if (shouldRemove) {
            console.log(`🔑 CAPTCHA: Removing widget ${widgetId} on cleanup`);
            window.turnstile.remove(widgetId);
            setWidgetId(null);
          } else {
            console.log(`🔑 CAPTCHA: Skipping removal of widget ${widgetId} during StrictMode render`);
          }
        } catch (e) {
          console.warn('🔑 CAPTCHA: Error removing widget on cleanup', e);
        }
      }
    };
  }, [componentScriptLoaded, isRendered, onError, onExpire, onVerify, theme, size, action, renderAttempts]);

  // Reset the widget
  const reset = () => {
    if (widgetId && window.turnstile) {
      try {
        window.turnstile.reset(widgetId);
      } catch (e) {
        console.warn('🔑 CAPTCHA: Error resetting widget', e);
        
        // If reset fails, try a full reset
        setIsRendered(false);
        
        // Try again after a brief delay
        setTimeout(() => {
          if (containerRef.current) {
            setComponentScriptLoaded(true);
          }
        }, 500);
      }
    }
  };

  // Expose the reset method
  React.useImperativeHandle(
    React.forwardRef((props, ref) => ref),
    () => ({
      reset
    })
  );

  return (
    <div
      ref={containerRef}
      id={containerId}
      data-turnstile-container={containerId}
      className={`turnstile-captcha ${className}`}
      data-testid="turnstile-captcha"
      data-state={isRendered ? 'rendered' : 'loading'}
      data-theme={theme}
      data-size={size}
    />
  );
}

// Add TypeScript support for the Turnstile global object
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: (error: any) => void;
          [key: string]: any;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
} 