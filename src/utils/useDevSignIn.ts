import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@/empty-module';
import { IS_DEV } from '@/utils/environment';

/**
 * Hook to handle development sign-in logic.
 * In development mode, provides a simplified authentication flow
 * while still using real Supabase authentication.
 */
export function useDevSignIn() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDevSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In development, we provide special handling for dev accounts
      // The login function in AuthContext will detect if this is a dev account
      const result = await login(email, password);
      
      // The login function now handles the navigation to dashboard
      // So we don't need to navigate here anymore
      if (result && result.user) {
        return { success: true };
      }
      
      return { success: false, message: 'Authentication failed' };
    } catch (err) {
      console.error('Development sign-in error:', err);
      
      // Show a simplified error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Authentication failed';
        
      setError(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDevSignIn,
    loading,
    error,
    // Only provide dev account info in development mode, using our environment utility
    devAccountInfo: IS_DEV 
      ? 'For testing, use dev@example.com with any password'
      : ''
  };
}

export default useDevSignIn; 