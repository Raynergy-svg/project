import { useState } from 'react';
import { useAuth } from '@/contexts/auth-adapter';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // Default test account info
  const defaultDevEmail = 'dev@example.com';
  const defaultDevPassword = 'password123';  // Don't worry - this is only for dev mode

  const handleDevSignIn = async () => {
    if (!IS_DEV) {
      console.warn('Dev sign-in attempted in production mode');
      return { success: false };
    }

    setLoading(true);
    setError(null);
    
    try {
      // In development, we provide special handling for dev accounts
      const result = await login(defaultDevEmail, defaultDevPassword);
      
      if (result?.error) {
        throw new Error(result.error.message || 'Authentication failed');
      }
      
      // Using App Router navigation
      router.push('/dashboard');
      return { success: true, user: result.user };
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
    // Only provide dev account info in development mode
    devAccountInfo: IS_DEV 
      ? { email: defaultDevEmail, password: 'Any password works in dev mode' }
      : null
  };
}

export default useDevSignIn; 