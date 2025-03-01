import React, { useState } from 'react';
import { CaptchaTest } from '@/components/CaptchaTest';
import { SmartCaptcha } from '@/components/SmartCaptcha';
import { CaptchaVerificationDemo } from '@/components/CaptchaVerificationDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CaptchaTestPage() {
  const [smartCaptchaToken, setSmartCaptchaToken] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Captcha Test Page</h1>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
          <h2 className="text-blue-800 font-medium">About This Page</h2>
          <p className="text-blue-700 mt-1">
            This page demonstrates three different approaches to implementing captchas with fallback options:
          </p>
          <ul className="list-disc pl-5 mt-2 text-blue-700 space-y-1">
            <li>The <strong>Standard Test</strong> uses the original implementation with manual fallback.</li>
            <li>The <strong>Smart Captcha</strong> uses our new component with automatic fallback.</li>
            <li>The <strong>Server Verification</strong> demo tests our API endpoint for server-side verification.</li>
          </ul>
        </div>
        
        {/* Server Verification Demo - New! */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Server Verification</h2>
          <CaptchaVerificationDemo />
        </div>
        
        {/* Original CaptchaTest Component */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Standard Test</h2>
          <CaptchaTest />
        </div>
        
        {/* SmartCaptcha Demo */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Smart Captcha</h2>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>SmartCaptcha Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                This component automatically detects if hCaptcha fails to load and provides a fallback solution.
              </p>
              
              <div className="border border-gray-200 p-4 rounded-md flex justify-center">
                <SmartCaptcha 
                  onVerify={(token) => {
                    console.log('SmartCaptcha verification successful:', token);
                    setSmartCaptchaToken(token);
                  }}
                  onError={(err) => {
                    console.error('SmartCaptcha error:', err);
                  }}
                  onExpire={() => {
                    console.log('SmartCaptcha expired');
                    setSmartCaptchaToken(null);
                  }}
                />
              </div>
              
              {smartCaptchaToken && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-md flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 font-medium">Verification Successful!</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Using fallback: {smartCaptchaToken.startsWith('fallback:') ? 'Yes' : 'No'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Token: {smartCaptchaToken.substring(0, 20)}...
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSmartCaptchaToken(null)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-2">
                <AlertCircle className="text-amber-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-700 text-sm">
                    The SmartCaptcha component automatically handles CSP errors and provides a fallback.
                    It's recommended to use this component in production for better user experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 