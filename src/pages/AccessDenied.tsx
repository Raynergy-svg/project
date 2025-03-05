import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const AccessDenied = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get the custom message if provided in state, or use default
  const { message } = (location.state as { message?: string, from?: string }) || {};
  const customMessage = message || "You don't have permission to access this page.";
  
  // Get the previous path if available
  const { from } = (location.state as { from?: { pathname: string } }) || {};
  const previousPath = from?.pathname || '/';
  
  const goBack = () => {
    // Navigate back to previous path if it's not the current path
    if (previousPath !== location.pathname) {
      navigate(previousPath);
    } else {
      // Otherwise go to home
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Access Denied
          </h1>
          
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Unauthorized Access</AlertTitle>
            <AlertDescription>
              {customMessage}
            </AlertDescription>
          </Alert>

          <div className="text-gray-600 text-sm">
            {user ? (
              <p>You are signed in as {user.email}, but your account doesn't have the required permissions.</p>
            ) : (
              <p>You need to sign in with an account that has the required permissions.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
          <Button 
            variant="outline" 
            onClick={goBack}
            className="space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>
          
          <Button 
            variant="outline"
            asChild
          >
            <Link to="/" className="inline-flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </Button>
          
          {!user && (
            <Button 
              asChild
            >
              <Link to="/signin" className="inline-flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 