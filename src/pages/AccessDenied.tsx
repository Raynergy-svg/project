import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShieldAlert, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-adapter';

const AccessDenied = () => {
  const router = useRouter();
  const { message, from } = router.query;
  const { user } = useAuth();
  
  // Get the custom message if provided in query, or use default
  const customMessage = typeof message === 'string' ? message : "You don't have permission to access this page.";
  
  // Get the previous path if available
  const previousPath = typeof from === 'string' ? from : '/';
  
  const goBack = () => {
    // Navigate back to previous path if it's not the current path
    if (previousPath !== router.pathname) {
      router.push(previousPath);
    } else {
      // Otherwise go to home
      router.push('/');
    }
  };
  
  const tryAgain = () => {
    // Refresh the page
    router.reload();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-100 mb-4">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>{customMessage}</AlertDescription>
          </Alert>
          
          <p className="text-gray-600 mb-6">
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
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 