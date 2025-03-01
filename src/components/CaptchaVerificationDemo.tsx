import React, { useState } from 'react';
import { SmartCaptcha } from './SmartCaptcha';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from './ui/badge';
import { verifyTokenWithServer, isTokenFromFallback } from '@/utils/captcha';

interface CaptchaVerificationDemoProps {
  className?: string;
}

export const CaptchaVerificationDemo: React.FC<CaptchaVerificationDemoProps> = ({ 
  className = ''
}) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [verifyingWithServer, setVerifyingWithServer] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    fallback: boolean;
    message: string;
  } | null>(null);
  
  // Handle when captcha is verified
  const handleCaptchaVerify = (token: string) => {
    console.log('Captcha verified:', token.substring(0, 20) + '...');
    setCaptchaToken(token);
    setVerificationResult(null);
  };
  
  // Handle captcha error
  const handleCaptchaError = (err: Error) => {
    console.error('Captcha error:', err);
    setCaptchaToken(null);
    setVerificationResult(null);
  };
  
  // Reset the demo
  const resetDemo = () => {
    setCaptchaToken(null);
    setVerificationResult(null);
    
    // Reset the hCaptcha widget if it exists
    if (typeof window.hcaptcha !== 'undefined') {
      window.hcaptcha.reset();
    }
  };
  
  // Verify the token with our server API
  const handleVerifyWithServer = async () => {
    if (!captchaToken) {
      return;
    }
    
    setVerifyingWithServer(true);
    
    try {
      console.log('Verifying token with server...');
      const result = await verifyTokenWithServer(captchaToken);
      
      console.log('Verification result:', result);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying token:', error);
      setVerificationResult({
        success: false,
        fallback: isTokenFromFallback(captchaToken),
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setVerifyingWithServer(false);
    }
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Server-side Verification Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This demo shows how to verify a captcha token with our server API. Complete the captcha
          below, then click the button to verify it on the server.
        </p>
        
        <div className="border border-gray-200 p-4 rounded-md flex justify-center">
          <SmartCaptcha
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onExpire={() => setCaptchaToken(null)}
          />
        </div>
        
        {captchaToken && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Captcha Token</h3>
              <Badge variant={isTokenFromFallback(captchaToken) ? "warning" : "default"}>
                {isTokenFromFallback(captchaToken) ? "Fallback" : "hCaptcha"}
              </Badge>
            </div>
            <code className="text-xs bg-gray-100 p-2 block rounded overflow-hidden text-ellipsis">
              {captchaToken.substring(0, 40)}...
            </code>
            
            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleVerifyWithServer}
                disabled={verifyingWithServer}
                className="flex-1"
              >
                {verifyingWithServer ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify with Server'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetDemo}
                disabled={verifyingWithServer}
                className="flex-shrink-0"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
        
        {verificationResult && (
          <div className={`
            border p-4 rounded-md flex items-start gap-2
            ${verificationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
            }
          `}>
            {verificationResult.success ? (
              <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`font-medium ${verificationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
              </h3>
              <p className={`text-sm mt-1 ${verificationResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.message}
              </p>
              {verificationResult.fallback && (
                <Badge variant="warning" className="mt-2">
                  Fallback Captcha
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 