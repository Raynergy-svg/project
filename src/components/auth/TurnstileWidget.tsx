'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '@/utils/turnstile';
import { IS_DEV } from '@/utils/environment';
import { 
  loadTurnstileScript, 
  isTurnstileScriptLoaded, 
  onTurnstileLoad,
  resetTurnstileState
} from '@/utils/turnstileLoader';

// Global registry to track which containers have Turnstile widgets
const widgetRegistry: Record<string, boolean> = {};

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
  action?: string; // Optional action parameter for tracking
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

// Generate a unique container ID for each widget instance
function generateUniqueId(): string {
  return `turnstile-widget-${Math.random().toString(36).substring(2, 11)}`;
}

// Function to safely render the Turnstile widget
const renderTurnstileWidget = (
  container: HTMLElement, 
  options: any, 
  onSuccess: (widgetId: string) => void,
  onFail: (error: any) => void
) => {
  try {
    // First check if window.turnstile exists at all
    if (!window.turnstile) {
      throw new Error('Turnstile not loaded');
    }
    
    // Get a unique identifier for this container
    const containerKey = container.id || container.getAttribute('data-turnstile-container');
    
    // Check if this container already has a widget
    if (containerKey && widgetRegistry[containerKey]) {
      console.warn(`🔒 Turnstile: Container ${containerKey} already has a widget registered. Skipping render.`);
      onFail(new Error(`Container ${containerKey} already has a widget`));
      return;
    }
    
    // Register this container before rendering
    if (containerKey) {
      widgetRegistry[containerKey] = true;
    }
    
    // Instead of using turnstile.ready, use our safer onTurnstileLoad helper
    // which ensures the callback only runs when Turnstile is fully loaded
    onTurnstileLoad(() => {
      try {
        // At this point, we know Turnstile is fully loaded
        if (!window.turnstile) {
          throw new Error('Turnstile unexpectedly undefined after load');
        }
        
        // Now we can safely render the widget
        const widgetId = window.turnstile.render(container, options);
        if (widgetId) {
          onSuccess(widgetId);
        } else {
          onFail(new Error('Failed to get widget ID from Turnstile'));
          // Unregister on failure
          if (containerKey) {
            delete widgetRegistry[containerKey];
          }
        }
      } catch (error) {
        console.error('🔒 Turnstile: Error rendering widget after load', error);
        onFail(error);
        // Unregister on failure
        if (containerKey) {
          delete widgetRegistry[containerKey];
        }
      }
    });
  } catch (error) {
    console.error('🔒 Turnstile: Error setting up rendering', error);
    onFail(error);
    
    // Unregister on failure
    const containerKey = container.id || container.getAttribute('data-turnstile-container');
    if (containerKey) {
      delete widgetRegistry[containerKey];
    }
  }
};

// Internal widget component used by both exports
const InternalTurnstileWidget = React.forwardRef<
  { reset: () => void },
  TurnstileWidgetProps
>(({ 
  onVerify, 
  onError, 
  onExpire, 
  className = '',
  action = 'login',
  theme = 'auto',
  size = 'normal'
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [componentScriptLoaded, setComponentScriptLoaded] = useState(isTurnstileScriptLoaded());
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [containerId] = useState(generateUniqueId());

  // Reset on unmount to prevent duplicate widgets
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          
          // Unregister this container from the registry
          const containerKey = containerId;
          if (containerKey) {
            delete widgetRegistry[containerKey];
          }
        } catch (e) {
          console.warn('🔒 Turnstile: Error removing widget on unmount', e);
        }
      }
    };
  }, [containerId]);

  // Load the Turnstile script
  useEffect(() => {
    // Skip in development mode if we're using bypass tokens
    if (IS_DEV && (
      process.env.DISABLE_TURNSTILE === 'true' || 
      process.env.SKIP_AUTH_CAPTCHA === 'true' || 
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true'
    )) {
      console.log('🔒 Turnstile: Using bypass token in development mode');
      // Simulate a successful verification with a bypass token
      setTimeout(() => {
        onVerify('1x00000000000000000000AA');
      }, 500);
      return;
    }

    // Check if Turnstile script is already loaded globally
    if (isTurnstileScriptLoaded()) {
      setComponentScriptLoaded(true);
      return;
    }

    // Load the script
    console.log('🔒 Turnstile: Loading script...');
    loadTurnstileScript()
      .then(() => {
        console.log('🔒 Turnstile: Script loaded successfully');
        setComponentScriptLoaded(true);
      })
      .catch((error) => {
        console.error('🔒 Turnstile: Script loading failed', error);
        // Try again if we haven't attempted too many times
        if (loadAttempts < 2) {
          setTimeout(() => {
            setLoadAttempts(prev => prev + 1);
          }, 2000);
        }
        if (onError) onError(error);
      });
      
    // No cleanup needed since we're using a global loader
  }, [onVerify, onError, loadAttempts]);

  // Render the widget when the script is loaded
  useEffect(() => {
    if (!componentScriptLoaded || !containerRef.current || isLoaded) return;

    // Skip in development mode if we're using bypass tokens
    if (IS_DEV && (
      process.env.DISABLE_TURNSTILE === 'true' || 
      process.env.SKIP_AUTH_CAPTCHA === 'true' || 
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true'
    )) {
      return;
    }

    try {
      console.log('🔒 Turnstile: Setting up widget with site key', TURNSTILE_SITE_KEY);
      
      const widgetOptions = {
        sitekey: TURNSTILE_SITE_KEY,
        theme: theme,
        size: size,
        action: action,
        retry: 'auto',
        'refresh-expired': 'auto',
        callback: (token: string) => {
          console.log('🔒 Turnstile: Verification successful');
          onVerify(token);
        },
        'error-callback': (error: any) => {
          console.error('🔒 Turnstile: Verification error', error);
          
          // Handle specific error codes
          if (error === '110200') {
            console.warn('🔒 Turnstile: Error 110200 - Network error or invalid configuration');
            // Try to reset the widget to recover
            setTimeout(() => {
              if (widgetIdRef.current && window.turnstile) {
                try {
                  window.turnstile.reset(widgetIdRef.current);
                } catch (e) {
                  // If reset fails, try to completely reset the state
                  resetTurnstileState();
                  // Signal we need to re-render
                  setIsLoaded(false);
                  
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
          
          if (onError) onError(error);
        },
        'expired-callback': () => {
          console.warn('🔒 Turnstile: Token expired');
          if (onExpire) onExpire();
        }
      };
      
      // Use the safer rendering approach
      renderTurnstileWidget(
        containerRef.current,
        widgetOptions,
        (widgetId) => {
          widgetIdRef.current = widgetId;
          setIsLoaded(true);
          
          // Store the widget ID as a data attribute for debugging
          if (containerRef.current) {
            containerRef.current.setAttribute('data-widget-id', widgetId);
          }
        },
        (error) => {
          console.error('🔒 Turnstile: Error rendering widget', error);
          
          // Only attempt re-render if we haven't tried too many times
          if (renderAttempts < 2) {
            setTimeout(() => {
              setRenderAttempts(prev => prev + 1);
              // Force a refresh of the component
              setIsLoaded(false);
            }, 2000);
          }
          
          if (onError) onError(error);
        }
      );
    } catch (error) {
      console.error('🔒 Turnstile: Error in render effect', error);
      if (onError) onError(error);
    }

    return () => {
      // Clean up widget when effect reruns
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          console.warn('🔒 Turnstile: Error removing widget on cleanup', e);
        }
      }
    };
  }, [componentScriptLoaded, isLoaded, onVerify, onError, onExpire, action, theme, size, renderAttempts]);

  // Function to reset the widget
  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (e) {
        console.warn('🔒 Turnstile: Error resetting widget', e);
        
        // If reset fails, try a full reset
        setIsLoaded(false);
        
        // Try again after a brief delay
        setTimeout(() => {
          if (containerRef.current) {
            setComponentScriptLoaded(true);
          }
        }, 500);
      }
    }
  };

  // Properly expose the reset method using useImperativeHandle
  React.useImperativeHandle(ref, () => ({
    reset
  }));

  return (
    <div
      ref={containerRef}
      id={containerId}
      data-turnstile-container={containerId}
      className={`turnstile-container ${className}`}
      data-testid="turnstile-widget"
      data-state={isLoaded ? 'loaded' : 'loading'}
      data-theme={theme}
      data-size={size}
    />
  );
});

// Standard version of the widget
export function TurnstileWidget(props: TurnstileWidgetProps) {
  return <InternalTurnstileWidget {...props} />;
}

// Forwarded ref version of the component
export const ForwardedTurnstileWidget = InternalTurnstileWidget;

// Hook to use Turnstile in functional components
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const widgetRef = useRef<{ reset: () => void } | null>(null);

  const handleVerify = (newToken: string) => {
    setToken(newToken);
    setIsVerified(true);
    setError(null);
  };

  const handleError = (err: any) => {
    setError(err);
    setIsVerified(false);
  };

  const handleExpire = () => {
    setToken(null);
    setIsVerified(false);
  };

  const resetToken = () => {
    if (widgetRef.current) {
      widgetRef.current.reset();
    }
    setToken(null);
    setIsVerified(false);
  };

  return {
    token,
    error,
    isVerified,
    resetToken,
    TurnstileWidget: (props: Omit<TurnstileWidgetProps, 'onVerify' | 'onError' | 'onExpire'>) => (
      <ForwardedTurnstileWidget
        {...props}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        ref={widgetRef}
      />
    )
  };
}

// Add TypeScript declaration for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, any>
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
} 