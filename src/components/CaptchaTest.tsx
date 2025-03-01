import React, { useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { HCAPTCHA_SITE_KEY } from '@/utils/captcha';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const CaptchaTest: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  
  const onVerify = (token: string) => {
    console.log('Verification succeeded!', token);
    setToken(token);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>hCaptcha Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-100 rounded text-sm overflow-auto">
          <pre>Site Key: {HCAPTCHA_SITE_KEY}</pre>
        </div>
        
        <div className="border border-gray-200 p-4 rounded-md flex justify-center">
          <HCaptcha
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={onVerify}
            onError={(err) => console.error('hCaptcha Error:', err)}
            onExpire={() => setToken(null)}
          />
        </div>
        
        {token && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <p className="text-green-700 font-medium">Captcha verified!</p>
            <p className="text-xs text-gray-500 mt-1">Token: {token.substring(0, 20)}...</p>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          If the captcha doesn't appear above, there might be an issue with:
          <ul className="list-disc pl-5 mt-2">
            <li>The site key configuration</li>
            <li>Network connectivity to hCaptcha servers</li>
            <li>Content security policy blocking the script</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}; 