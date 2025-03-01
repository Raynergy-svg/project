import React, { useState, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { HCAPTCHA_SITE_KEY } from '@/utils/captcha';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FallbackCaptcha } from './FallbackCaptcha';
import { AlertTriangle } from 'lucide-react';

export const CaptchaTest: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [hCaptchaLoaded, setHCaptchaLoaded] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if hCaptcha script is loaded after a short delay
    const timer = setTimeout(() => {
      const hcaptchaExists = typeof window.hcaptcha !== 'undefined';
      console.log('hCaptcha loaded check:', hcaptchaExists);
      
      setHCaptchaLoaded(hcaptchaExists);
      if (!hcaptchaExists) {
        setIsFallback(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const onVerify = (token: string) => {
    console.log('Verification succeeded!', token);
    setToken(token);
  };

  const onError = (err: Error) => {
    console.error('hCaptcha Error:', err);
    setIsFallback(true);
  };
  
  const resetCaptcha = () => {
    setToken(null);
    if (!isFallback && window.hcaptcha) {
      window.hcaptcha.reset();
    }
  };
  
  const forceFallback = () => {
    setIsFallback(true);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>hCaptcha Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-100 rounded text-sm overflow-auto">
          <pre>Site Key: {HCAPTCHA_SITE_KEY}</pre>
          <pre>Using Fallback: {isFallback ? 'Yes' : 'No'}</pre>
          <pre>hCaptcha Loaded: {hCaptchaLoaded === null ? 'Checking...' : hCaptchaLoaded ? 'Yes' : 'No'}</pre>
        </div>
        
        <div className="border border-gray-200 p-4 rounded-md flex justify-center">
          {isFallback ? (
            <FallbackCaptcha onVerify={onVerify} onError={onError} />
          ) : (
            <HCaptcha
              sitekey={HCAPTCHA_SITE_KEY}
              onVerify={onVerify}
              onError={onError}
              onExpire={() => setToken(null)}
            />
          )}
        </div>
        
        {hCaptchaLoaded === false && !isFallback && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start gap-2">
            <AlertTriangle className="text-yellow-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-700">hCaptcha couldn't be loaded due to Content Security Policy restrictions.</p>
              <Button 
                variant="outline" 
                className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={forceFallback}
              >
                Use Fallback Captcha
              </Button>
            </div>
          </div>
        )}
        
        {token && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <p className="text-green-700 font-medium">Captcha verified!</p>
            <p className="text-xs text-gray-500 mt-1">Token: {token.substring(0, 20)}...</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={resetCaptcha}
            >
              Reset Captcha
            </Button>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          If the captcha doesn't appear above, there might be an issue with:
          <ul className="list-disc pl-5 mt-2">
            <li>The site key configuration</li>
            <li>Network connectivity to hCaptcha servers</li>
            <li>Content security policy blocking the script - check the browser console for CSP errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}; 