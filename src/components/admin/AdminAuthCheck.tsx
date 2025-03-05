import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/loading-screen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { IS_DEV } from '@/utils/environment';

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck: React.FC<AdminAuthCheckProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsChecking(true);
      setError(null);
      
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }
        
        // In development mode, automatically grant admin access
        if (IS_DEV) {
          console.log('[DEV] Auto-granting admin access in development mode');
          setIsAdmin(true);
          return;
        }
        
        // Here you would typically check if the user has admin role/permissions
        // This could be fetched from your user metadata, a separate admin table, or via an API call
        const hasAdminRole = user.app_metadata?.role === 'admin' || 
                             user.user_metadata?.isAdmin === true;
        
        // For additional security, you could also make a server call to verify admin status
        // const { data, error } = await supabase
        //   .from('admin_users')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .single();
        
        // setIsAdmin(!!data);

        setIsAdmin(hasAdminRole);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin permissions. Please try again later.');
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (isLoading || isChecking) {
    return (
      <LoadingScreen 
        message="Verifying administrative access..." 
        fullScreen={true} 
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Authorization Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="mr-2"
            >
              Return to Home
            </Button>
            <Button
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to access denied page or home page
    return (
      <Navigate 
        to="/access-denied" 
        state={{ from: location, message: "You don't have administrative privileges." }} 
        replace 
      />
    );
  }

  // User is authenticated and has admin privileges
  return <>{children}</>;
};

export default AdminAuthCheck; 