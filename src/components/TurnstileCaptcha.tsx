'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY, isTurnstileDisabled, generateBypassToken } from '@/utils/turnstile';
import { IS_DEV } from '@/utils/environment';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
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
  size = 'normal'
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

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
    
    // Check if script is already loaded
    if (typeof window !== 'undefined' && window.turnstile) {
      setIsLoaded(true);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Turnstile script:', error);
      if (onError) {
        onError(new Error('Failed to load Turnstile script'));
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup widget if it exists
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onError, onVerify]);

  // Render the widget when the script is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || isRendered || (IS_DEV && isTurnstileDisabled())) {
      return;
    }
    
    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme,
        size,
        callback: (token: string) => {
          onVerify(token);
        },
        'expired-callback': () => {
          if (onExpire) {
            onExpire();
          }
        },
        'error-callback': (error: any) => {
          console.error('Turnstile error:', error);
          if (onError) {
            onError(new Error('Turnstile verification failed'));
          }
        }
      });
      
      setWidgetId(id);
      setIsRendered(true);
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to render Turnstile widget'));
      }
    }
  }, [isLoaded, isRendered, onError, onExpire, onVerify, size, theme]);

  // Reset the widget
  const reset = () => {
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
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
      id="turnstile-container" 
      ref={containerRef} 
      className={className}
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