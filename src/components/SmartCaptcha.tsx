import React, { useState, useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { 
  HCAPTCHA_SITE_KEY, 
  isTokenFromFallback,
  FALLBACK_PREFIX
} from '@/utils/captcha';
import { FallbackCaptcha } from './FallbackCaptcha';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface SmartCaptchaProps {
  sitekey?: string;
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * SmartCaptcha component that tries to use hCaptcha first
 * and falls back to a simple math captcha if hCaptcha fails to load
 */
export const SmartCaptcha: React.FC<SmartCaptchaProps> = ({
  sitekey = HCAPTCHA_SITE_KEY,
  onVerify,
  onError,
  onExpire,
  size = 'normal',
  theme = 'light',
  className = '',
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hCaptchaRef = useRef(null);
  
  useEffect(() => {
    // Listen for custom hCaptcha events from our loader script
    const handleLoadError = () => {
      console.warn('hCaptcha failed to load (from event)');
      setLoadingError('hCaptcha could not load due to Content Security Policy restrictions.');
      setIsLoading(false);
    };
    
    const handleLoaded = () => {
      console.log('hCaptcha loaded successfully (from event)');
      setIsLoading(false);
      setLoadingError(null);
    };
    
    document.addEventListener('hcaptcha-load-error', handleLoadError);
    document.addEventListener('hcaptcha-loaded', handleLoaded);
    
    // Check if hCaptcha is available after a short delay
    const timer = setTimeout(() => {
      if (typeof window.hcaptcha === 'undefined') {
        console.warn('hCaptcha not loaded, checking for CSP issues');
        
        // Look for CSP errors in console
        const hasCspErrors = document.querySelectorAll('iframe[src*="hcaptcha.com"]').length === 0;
        
        if (hasCspErrors) {
          setLoadingError('hCaptcha could not load due to Content Security Policy restrictions.');
        }
        
        setIsLoading(false);
      } else {
        console.log('hCaptcha loaded successfully');
        setIsLoading(false);
      }
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('hcaptcha-load-error', handleLoadError);
      document.removeEventListener('hcaptcha-loaded', handleLoaded);
    };
  }, [retryCount]);
  
  // Handle errors from hCaptcha
  const handleError = (err: Error) => {
    console.error('hCaptcha error:', err);
    setLoadingError(`hCaptcha error: ${err.message}`);
    if (onError) {
      onError(err);
    }
  };
  
  // Append fallback marker to tokens from the fallback captcha
  const handleVerify = (token: string) => {
    // The FallbackCaptcha component should already use the createFallbackToken utility
    // but we double-check here for added safety
    if (useFallback && !isTokenFromFallback(token)) {
      console.warn('Received token from fallback captcha without proper prefix');
    }
    
    onVerify(token);
  };
  
  const handleRetryHCaptcha = () => {
    setIsLoading(true);
    setLoadingError(null);
    
    // Try to reload hCaptcha using our global helper
    if (window.retryHCaptchaLoad) {
      window.retryHCaptchaLoad();
    }
    
    // Increment retry count to trigger useEffect
    setRetryCount(prev => prev + 1);
  };
  
  const handleUseFallback = () => {
    setUseFallback(true);
    setLoadingError(null);
  };
  
  if (useFallback) {
    return (
      <div className={className}>
        <FallbackCaptcha 
          onVerify={handleVerify}
          onError={onError}
        />
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={`${className} p-4 border border-gray-200 rounded-md text-center`}>
        <div className="animate-pulse">Loading captcha verification...</div>
      </div>
    );
  }
  
  if (loadingError) {
    return (
      <div className={`${className} bg-yellow-50 border border-yellow-200 p-4 rounded-md`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-yellow-500 h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-700">{loadingError}</p>
            <div className="mt-2 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={handleRetryHCaptcha}
              >
                Retry hCaptcha
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={handleUseFallback}
              >
                Use Fallback Captcha
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {typeof window.hcaptcha !== 'undefined' ? (
        <HCaptcha
          ref={hCaptchaRef}
          sitekey={sitekey}
          onVerify={handleVerify}
          onError={handleError}
          onExpire={onExpire}
          size={size}
          theme={theme}
        />
      ) : (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-700">hCaptcha API not available.</p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            onClick={handleUseFallback}
          >
            Use Fallback Captcha
          </Button>
        </div>
      )}
    </div>
  );
}; 