import React, { useEffect } from 'react';
import { SupabaseAuthTest } from '@/components/SupabaseAuthTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AuthDemo() {
  // Add a useEffect to load the captcha debugging script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/captcha-check.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const runCaptchaCheck = () => {
    console.log('Running manual captcha check...');
    // Check if the hCaptcha script exists and is loaded
    const hcaptchaScript = document.querySelector('script[src*="hcaptcha.com"]');
    console.log('hCaptcha script found:', !!hcaptchaScript);
    console.log('hCaptcha API available:', !!window.hcaptcha);
    
    // Check for any hCaptcha elements
    const hcaptchaElements = document.querySelectorAll('iframe[src*="hcaptcha.com"]');
    console.log('hCaptcha elements on page:', hcaptchaElements.length);
    hcaptchaElements.forEach(el => {
      console.log('hCaptcha element:', el);
    });
    
    // Alert user
    alert(`hCaptcha status:\nScript loaded: ${!!hcaptchaScript}\nAPI available: ${!!window.hcaptcha}\nhCaptcha elements: ${hcaptchaElements.length}\n\nSee console for details.`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Authentication Demo</CardTitle>
          <CardDescription>
            This page demonstrates our authentication system with hCaptcha integration for enhanced security.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Security Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Email and password authentication</li>
              <li>hCaptcha integration to prevent automated attacks</li>
              <li>Secure token handling</li>
              <li>Email verification</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-2">
            <AlertCircle className="text-amber-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Captcha Not Visible?</h3>
              <p className="text-amber-700 text-sm mt-1">
                If you don't see the captcha below, there may be an issue with loading the hCaptcha script.
                Click the button below to run a diagnostic check.
              </p>
              <Button 
                variant="outline" 
                className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={runCaptchaCheck}
              >
                Run Captcha Diagnostic
              </Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Try It Out</h2>
            <p className="mb-4">
              Use the form below to test our authentication system. You can sign up with a test email or sign in if you
              already have an account.
            </p>
            <SupabaseAuthTest />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 