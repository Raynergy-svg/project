'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-adapter';

export default function AccessDeniedPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get the custom message if provided in query, or use default
  const message = searchParams.get('message') || "You don't have permission to access this page.";
  
  // Get the previous path if available
  const from = searchParams.get('from') || '/';
  
  // Handle going back to the previous page
  const goBack = () => {
    if (typeof window !== 'undefined') {
      // Use window.history.back() for cleaner navigation
      window.history.back();
    }
  };
  
  // Handle refreshing the current page
  const tryAgain = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-destructive/10 mb-6">
            <ShieldAlert className="w-12 h-12 text-destructive" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          
          <p className="text-muted-foreground mb-8">
            {user ? 
              "Your account doesn't have the necessary permissions to access this resource." : 
              "You need to be logged in with appropriate permissions to access this resource."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2" 
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2" 
              onClick={tryAgain}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button 
              className="flex items-center justify-center gap-2" 
              asChild
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </Button>
          </div>
          
          {!user && (
            <div className="mt-8 pt-6 border-t border-border w-full">
              <p className="text-sm text-muted-foreground mb-4">
                Need to sign in or create an account?
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth">Create Account</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
