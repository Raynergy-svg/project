"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    // The actual verification is handled by the route.ts file
    // This component is just for user feedback during the process
    
    // Check if we have error from the redirect
    const error = searchParams?.get('error');
    
    if (error === 'verification_failed') {
      setStatus('error');
      setMessage('Email verification failed. Please try again or contact support.');
      // Redirect to sign in after a delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } else {
      // If we're here, the route handler is processing the verification
      // We'll just show a loading state briefly
      setTimeout(() => {
        // This is a fallback - the route handler should redirect
        // before this timeout if successful
        setStatus('error');
        setMessage('Verification is taking longer than expected.');
      }, 5000);
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Verifying Your Email</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Email Verified!</h1>
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
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
