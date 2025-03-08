import React, { useEffect, useRef, useState } from 'react';

type TurnstileProps = {
  onVerify: (token: string) => void;
  onError?: () => void;
  action?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  tabIndex?: number;
  cData?: string;
  execution?: 'render' | 'execute';
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      execute: (widgetId?: string) => void;
      ready: (callback: () => void) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || 
                          window.__TURNSTILE_SITE_KEY__ || 
                          '0x4AAAAAAAK5LpjT0Jzv4jzl';

const TurnstileCaptcha: React.FC<TurnstileProps> = ({ 
  onVerify, 
  onError, 
  action = 'login', 
  className = '',
  theme = 'auto',
  size = 'normal',
  tabIndex = 0,
  cData,
  execution = 'render'
}) => {
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if site key is defined
    if (!TURNSTILE_SITE_KEY) {
      console.error('Turnstile site key is not defined');
      setError('Turnstile configuration error');
      setIsLoading(false);
      if (onError) onError();
      return;
    }

    // Check if Turnstile script is loaded
    const isTurnstileLoaded = () => {
      return typeof window.turnstile !== 'undefined';
    };

    // Function to render the widget
    const renderWidget = () => {
      if (!containerRef.current || !isTurnstileLoaded()) return;
      
      try {
        // Clear previous widget if it exists
        if (widgetId) {
          window.turnstile?.remove(widgetId);
        }
        
        // Render the widget
        const newWidgetId = window.turnstile?.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            // Called when challenge is successfully solved
            console.log('Turnstile verification successful');
            setError(null);
            onVerify(token);
          },
          'error-callback': () => {
            // Called when there's an error (e.g., network error or challenge failure)
            console.error('Turnstile verification failed');
            setError('Verification failed. Please try again.');
            if (onError) onError();
          },
          'expired-callback': () => {
            // Called when the token expires
            console.warn('Turnstile token expired');
            setError('Verification expired. Please try again.');
            if (onError) onError();
          },
          'timeout-callback': () => {
            console.warn('Turnstile verification timed out');
            setError('Verification timed out. Please try again.');
            if (onError) onError();
          },
          'unsupported-callback': () => {
            console.error('Turnstile not supported in this browser');
            setError('Verification not supported in this browser.');
            if (onError) onError();
          },
          theme,
          size,
          tabindex: tabIndex,
          action,
          cData,
          execution,
        });
        
        if (newWidgetId) {
          setWidgetId(newWidgetId);
        }
      } catch (err) {
        console.error('Error rendering Turnstile widget:', err);
        setError('Failed to load verification. Please refresh the page.');
        if (onError) onError();
      } finally {
        setIsLoading(false);
      }
    };

    // Check if Turnstile is already loaded
    if (isTurnstileLoaded()) {
      window.turnstile?.ready(() => {
        renderWidget();
      });
    } else {
      // Wait for Turnstile to load
      const checkInterval = setInterval(() => {
        if (isTurnstileLoaded()) {
          clearInterval(checkInterval);
          window.turnstile?.ready(() => {
            renderWidget();
          });
        }
      }, 100);

      // Set a timeout to stop checking after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isTurnstileLoaded()) {
          console.error('Turnstile script failed to load within timeout');
          setError('Verification service unavailable. Please refresh the page.');
          setIsLoading(false);
          if (onError) onError();
        }
      }, 10000);
    }

    // Cleanup function
    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onVerify, onError, action, theme, size, tabIndex, cData, execution]);

  // Handle manual execution if needed
  const executeCaptcha = () => {
    if (execution === 'execute' && widgetId) {
      window.turnstile?.execute(widgetId);
    }
  };

  return (
    <div className={`turnstile-container ${className}`} data-testid="turnstile-container">
      {isLoading && <div className="turnstile-loading">Loading verification...</div>}
      {error && <div className="turnstile-error">{error}</div>}
      <div 
        ref={containerRef} 
        className="turnstile-widget"
        data-action={action}
      />
      {execution === 'execute' && (
        <button 
          type="button" 
          onClick={executeCaptcha}
          className="hidden-execute-button"
          style={{ display: 'none' }}
        >
          Execute Captcha
        </button>
      )}
    </div>
  );
};

export default TurnstileCaptcha; 