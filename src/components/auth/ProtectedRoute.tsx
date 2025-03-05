import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/utils/supabase/client';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);

  // Enhanced auth check - runs every time the component is mounted and periodically
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Additional validation - check if the session is still valid directly with Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Log session verification (useful for debugging)
        console.debug('Session validation result:', sessionData?.session ? 'Valid session' : 'No session');
        
        if (sessionError) {
          console.error('Session validation error:', sessionError);
          setAuthError('Your session is invalid or has expired. Please sign in again.');
          setIsLoading(false);
          return;
        }
        
        if (!sessionData.session) {
          console.warn('No valid session found during route protection check');
          setAuthError('Your session has expired. Please sign in again.');
          setIsLoading(false);
          return;
        }

        // Update last auth check timestamp
        setLastAuthCheck(Date.now());
        setAuthError(null);
      } catch (error) {
        console.error('Authentication check error:', error);
        setAuthError('Failed to verify your authentication status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Run auth check when component mounts or if auth state changes
    if (!authLoading) {
      checkAuth();
    }

    // Set up periodic auth check every 5 minutes
    const authCheckInterval = setInterval(() => {
      // Only run periodic checks if the user is supposed to be authenticated
      if (isAuthenticated) {
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(authCheckInterval);
  }, [isAuthenticated, authLoading]);

  // Check subscription status when auth is confirmed
  useEffect(() => {
    async function checkSubscription() {
      // Skip subscription check if not required
      if (!requireSubscription) {
        setHasSubscription(true);
        setIsLoading(false);
        return;
      }

      // Always bypass subscription check in development mode
      if (window.location.hostname === 'localhost' || 
          import.meta.env.MODE === 'development') {
        console.log('Development mode detected - bypassing subscription check');
        setHasSubscription(true);
        setIsLoading(false);
        return;
      }
      
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Query the user's subscription status from Supabase
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('status, subscription_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking subscription:', error);
          // If we can't check the subscription (API error, etc.), allow access in development
          // but block in production
          if (import.meta.env.MODE === 'development') {
            console.warn('Development mode - allowing access despite subscription check error');
            setHasSubscription(true);
          } else {
            setHasSubscription(false);
          }
        } else {
          // Check if subscription is active
          setHasSubscription(data && data.status === 'active');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Same fallback behavior as above
        if (import.meta.env.MODE === 'development') {
          console.warn('Development mode - allowing access despite error');
          setHasSubscription(true);
        } else {
          setHasSubscription(false);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && !authLoading) {
      checkSubscription();
    }
  }, [isAuthenticated, user, authLoading, requireSubscription]);

  // While checking authentication or subscription status
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white">
        <Shield className="w-10 h-10 text-[#88B04B] animate-pulse mb-4" />
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">Verifying your session</h1>
          <p className="text-gray-400 mt-1">Please wait while we secure your dashboard</p>
        </div>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If auth error occurred
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white p-4">
        <Alert variant="destructive" className="mb-6 max-w-md w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
        <button 
          onClick={() => window.location.href = `/signin?from=${encodeURIComponent(location.pathname)}`}
          className="px-4 py-2 bg-[#88B04B] text-white rounded-md hover:bg-[#78A03B] transition-colors"
        >
          Sign In Again
        </button>
      </div>
    );
  }

  // If not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to={`/signin?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If subscription is required but user doesn't have one
  if (requireSubscription && !hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white p-4">
        <div className="max-w-md w-full bg-[#2A2A2A] p-6 rounded-xl border border-white/10">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold">Subscription Required</h1>
            <p className="text-gray-400 mt-2">You need an active subscription to access this feature</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = "/?pricing=true"}
              className="px-4 py-2 bg-[#88B04B] text-white rounded-md hover:bg-[#78A03B] transition-colors"
            >
              View Pricing
            </button>
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="px-4 py-2 bg-transparent border border-white/20 text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authentication and subscription checks passed, render the protected content
  return <>{children}</>;
}
