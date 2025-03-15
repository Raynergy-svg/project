'use client';

import React, { useState } from 'react';
import TurnstileCaptcha from '../TurnstileCaptcha';

export default function TurnstileTest() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleVerify = (captchaToken: string) => {
    setToken(captchaToken);
    setError(null);
    console.log('Turnstile verification successful!', captchaToken.substring(0, 10) + '...');
  };
  
  const handleError = (err: Error) => {
    setError(err.message);
    console.error('Turnstile error:', err);
  };
  
  const handleExpire = () => {
    setToken(null);
    setError('Verification expired. Please verify again.');
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Turnstile Test</h2>
      
      <TurnstileCaptcha
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        theme="auto"
        size="normal"
        className="mb-4"
      />
      
      {token && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          <p className="font-semibold">Verification successful!</p>
          <p className="text-sm break-all">
            Token: {token.substring(0, 20)}...
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 