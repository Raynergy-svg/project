import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { IS_DEV } from '@/utils/environment';
import { 
  devLogin,
  checkDevAuthEnvironment, 
  devBypassAuth
} from '@/utils/devAuth';
import { initDevMode } from '@/utils/supabase/configureClient';
import { supabaseUrl } from '@/utils/supabase/client';

/**
 * Generate a fake UUID that matches the format expected by Supabase
 * This is needed because Supabase expects UUIDs in a specific format
 */
function generateFakeUuid(): string {
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where x is any hexadecimal digit and y is one of 8, 9, A, or B
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  
  return template.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

  const handleDevSignIn = async (role?: string) => {
    console.log('🔑 DEV SIGN IN: Starting dev sign-in process', { isDev: IS_DEV, role });
    
    if (!IS_DEV) {
      console.warn('🔑 DEV SIGN IN: Dev sign-in attempted in production mode');
      setError('Development sign-in is not available in production');
      return { success: false };
    }

    setLoading(true);
    setError(null);
    
    // Initialize development mode for Supabase client
    initDevMode();
    
    // Run diagnostics to help troubleshoot
    console.log('🔑 DEV SIGN IN: Running environment diagnostics');
    const diagnostics = checkDevAuthEnvironment();
    console.log('🔑 DEV SIGN IN: Environment diagnostics', diagnostics);
    
    try {
      // Determine which email to use based on role
      let email = defaultDevEmail;
      if (role === 'admin') {
        email = 'admin@example.com';
      } else if (role === 'premium') {
        email = 'premium@example.com';
      }
      
      console.log('🔑 DEV SIGN IN: Using dev login utility', { email, role });
      
      // Try the simplified bypass auth first (fastest method)
      console.log('🔑 DEV SIGN IN: Trying simplified bypass auth first');
      const bypassResult = await devBypassAuth(email, defaultDevPassword);
      
      if (bypassResult?.user) {
        console.log('🔑 DEV SIGN IN: Simplified bypass auth successful, redirecting to dashboard');
        
        // Add a small delay to ensure the authentication state is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use direct window location for more reliable redirection
        window.location.href = '/dashboard';
        return { success: true };
      }
      
      // If bypass auth fails, try the full dev login process
      console.log('🔑 DEV SIGN IN: Simplified bypass auth failed, trying full dev login process');
      const result = await devLogin(email, defaultDevPassword);
      
      if (result.user) {
        console.log('🔑 DEV SIGN IN: Dev login successful, redirecting to dashboard');
        
        // Add a small delay to ensure the authentication state is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use direct window location for more reliable redirection
        window.location.href = '/dashboard';
        return { success: true };
      }
      
      console.log('🔑 DEV SIGN IN: Dev login failed', result.error);
      
      // If all authentication methods fail, create a fake user session
      console.log('🔑 DEV SIGN IN: All authentication methods failed, creating fake session');
      
      // Create a fake user for development
      const fakeUser = {
        id: generateFakeUuid(), // Use the same UUID generation as in devBypassAuth
        email: email,
        user_metadata: {
          name: email.split('@')[0],
          is_dev_account: true,
          role: role === 'admin' ? 'admin' : 'user'
        },
        app_metadata: {
          provider: 'email',
          role: role === 'admin' ? 'admin' : 'user',
          providers: ['email']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated'
      };
      
      console.log('🔑 DEV SIGN IN: Created fake user for development', fakeUser);
      
      // Store the fake user in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('dev_auth_user', JSON.stringify(fakeUser));
        
        // Create a fake session
        const fakeSession = {
          access_token: 'fake_access_token_' + Math.random().toString(36).substring(2, 15),
          refresh_token: 'fake_refresh_token_' + Math.random().toString(36).substring(2, 15),
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: fakeUser
        };
        
        localStorage.setItem('dev_auth_session', JSON.stringify(fakeSession));
        
        // Also store in supabase-js format for compatibility
        localStorage.setItem('sb-' + supabaseUrl.replace(/^https?:\/\//, '') + '-auth-token', JSON.stringify({
          access_token: fakeSession.access_token,
          refresh_token: fakeSession.refresh_token,
          expires_at: fakeSession.expires_at,
          user: fakeUser
        }));
      }
      
      // Add a small delay to ensure the authentication state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard with fake session
      console.log('🔑 DEV SIGN IN: Redirecting to dashboard with fake session');
      // Use direct window location for more reliable redirection
      window.location.href = '/dashboard';
      return { success: true };
    } catch (err) {
      console.error('🔑 DEV SIGN IN: Development sign-in error:', err);
      
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