"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Processing your authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have a code in the URL
      const code = searchParams.get('code');
      
      // If no code in the URL, redirect to sign in page
      if (!code) {
        setStatus('error');
        setMessage('No authentication code found');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
        return;
      }
      
      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        setMessage('Authentication successful!');
        
        // Wait a moment and redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error: any) {
        console.error('Authentication error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed. Please try again.');
        
        // Redirect to sign in after a delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    };
    
    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Authenticating...</h1>
            <p className="text-muted-foreground">
              Please wait while we complete your sign in.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Success!</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the dashboard...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold">Authentication Failed</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
