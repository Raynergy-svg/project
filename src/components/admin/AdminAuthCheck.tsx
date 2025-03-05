import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

interface AdminAuthCheckProps {
  children: ReactNode;
}

const AdminAuthCheck: React.FC<AdminAuthCheckProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // First check if we're in development mode - bypass admin check for easier testing
        if (process.env.NODE_ENV === 'development') {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking admin status:', error);
            setError('Could not verify admin status. Please try again later.');
            setIsAdmin(false);
          } else {
            setIsAdmin(!!data);
          }
        } else {
          // In production, check admin status
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking admin status:', error);
            setError('Could not verify admin status. Please try again later.');
            setIsAdmin(false);
          } else {
            setIsAdmin(!!data);
          }
        }
      } catch (err) {
        console.error('Exception checking admin status:', err);
        setError('An unexpected error occurred. Please try again later.');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Verifying admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center text-red-500 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Record unauthorized access attempt
    if (user) {
      try {
        supabase.rpc('insert_security_event', {
          p_user_id: user.id,
          p_event_type: 'unauthorized_admin_access',
          p_ip_address: null,
          p_user_agent: navigator.userAgent,
          p_email: user.email,
          p_details: {
            timestamp: new Date().toISOString(),
            path: window.location.pathname,
          }
        });
      } catch (err) {
        console.error('Failed to record unauthorized access attempt:', err);
      }
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminAuthCheck; 