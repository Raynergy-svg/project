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

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  action?: string; // For analytics
}

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
    
    // Use our safer onTurnstileLoad helper - do NOT use turnstile.ready directly
    // This avoids the error about calling turnstile.ready() before script is loaded
    onTurnstileLoad(() => {
      try {
        // At this point, we can safely assume Turnstile is fully loaded
        if (!window.turnstile) {
          throw new Error('Turnstile unexpectedly undefined after load');
        }
        
        // Now render the widget directly without ready()
        const widgetId = window.turnstile.render(container, options);
        if (widgetId) {
          onSuccess(widgetId);
        } else {
          onFail(new Error('Failed to get widget ID from Turnstile'));
        }
      } catch (error) {
        console.error('🔑 CAPTCHA: Error rendering in callback', error);
        onFail(error);
      }
    });
  } catch (error) {
    console.error('🔑 CAPTCHA: Error setting up rendering', error);
    onFail(error);
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
  
  // Reset on unmount to prevent ghost widgets
  useEffect(() => {
    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {
          console.warn('🔑 CAPTCHA: Error removing widget on unmount', e);
        }
      }
    };
  }, [widgetId]);

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
      // Cleanup widget if it exists
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
          setWidgetId(null);
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
      id={containerId} 
      ref={containerRef} 
      className={className}
      data-theme={theme}
      data-size={size}
      data-state={isRendered ? 'loaded' : 'loading'}
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