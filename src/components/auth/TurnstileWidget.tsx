'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '@/utils/turnstile';
import { IS_DEV } from '@/utils/environment';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
}

export function TurnstileWidget({ onVerify, onError, onExpire, className = '' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load the Turnstile script
  useEffect(() => {
    // Skip if already loaded
    if (typeof window !== 'undefined' && window.turnstile) {
      setIsScriptLoaded(true);
      return;
    }

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

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('🔒 Turnstile: Script loaded');
      setIsScriptLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error('🔒 Turnstile: Failed to load script', error);
      if (onError) onError(error);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      document.head.removeChild(script);
    };
  }, [onVerify, onError]);

  // Render the widget when the script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || isLoaded) return;

    // Skip in development mode if we're using bypass tokens
    if (IS_DEV && (
      process.env.DISABLE_TURNSTILE === 'true' || 
      process.env.SKIP_AUTH_CAPTCHA === 'true' || 
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true'
    )) {
      return;
    }

    try {
      console.log('🔒 Turnstile: Rendering widget with site key', TURNSTILE_SITE_KEY);
      
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          console.log('🔒 Turnstile: Verification successful');
          onVerify(token);
        },
        'error-callback': (error: any) => {
          console.error('🔒 Turnstile: Verification error', error);
          if (onError) onError(error);
        },
        'expired-callback': () => {
          console.warn('🔒 Turnstile: Token expired');
          if (onExpire) onExpire();
        },
        theme: 'auto',
        size: 'normal'
      });
      
      setIsLoaded(true);
    } catch (error) {
      console.error('🔒 Turnstile: Error rendering widget', error);
      if (onError) onError(error);
    }

    return () => {
      // Clean up widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [isScriptLoaded, isLoaded, onVerify, onError, onExpire]);

  // Function to reset the widget
  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`turnstile-container ${className}`}
      data-testid="turnstile-widget"
    />
  );
}

// Create a forwardRef version of the component
export const ForwardedTurnstileWidget = React.forwardRef<
  { reset: () => void },
  TurnstileWidgetProps
>((props, ref) => {
  const { onVerify, onError, onExpire, className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load the Turnstile script
  useEffect(() => {
    // Skip if already loaded
    if (typeof window !== 'undefined' && window.turnstile) {
      setIsScriptLoaded(true);
      return;
    }

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

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('🔒 Turnstile: Script loaded');
      setIsScriptLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error('🔒 Turnstile: Failed to load script', error);
      if (onError) onError(error);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      document.head.removeChild(script);
    };
  }, [onVerify, onError]);

  // Render the widget when the script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || isLoaded) return;

    // Skip in development mode if we're using bypass tokens
    if (IS_DEV && (
      process.env.DISABLE_TURNSTILE === 'true' || 
      process.env.SKIP_AUTH_CAPTCHA === 'true' || 
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true'
    )) {
      return;
    }

    try {
      console.log('🔒 Turnstile: Rendering widget with site key', TURNSTILE_SITE_KEY);
      
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          console.log('🔒 Turnstile: Verification successful');
          onVerify(token);
        },
        'error-callback': (error: any) => {
          console.error('🔒 Turnstile: Verification error', error);
          if (onError) onError(error);
        },
        'expired-callback': () => {
          console.warn('🔒 Turnstile: Token expired');
          if (onExpire) onExpire();
        },
        theme: 'auto',
        size: 'normal'
      });
      
      setIsLoaded(true);
    } catch (error) {
      console.error('🔒 Turnstile: Error rendering widget', error);
      if (onError) onError(error);
    }

    return () => {
      // Clean up widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [isScriptLoaded, isLoaded, onVerify, onError, onExpire]);

  // Function to reset the widget
  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  // Properly expose the reset method using useImperativeHandle
  React.useImperativeHandle(ref, () => ({
    reset
  }));

  return (
    <div 
      ref={containerRef} 
      className={`turnstile-container ${className}`}
      data-testid="turnstile-widget"
    />
  );
});

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