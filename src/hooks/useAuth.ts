// Direct implementation of useAuth hook
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { IS_DEV } from '@/utils/environment';
import { Session, User } from '@supabase/supabase-js';
import * as authUtils from '@/utils/auth';

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  isPremium: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  subscription?: {
    status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing';
    planName?: string;
    currentPeriodEnd: Date;
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if the user is subscribed (has an active subscription)
  const isSubscribed = user?.subscription?.status === 'active' || user?.subscription?.status === 'trialing';

  // Fetch user profile data
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.error('Cannot fetch user profile: No user ID provided');
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user profile:', userError);
        return null;
      }
      
      return userData;
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return null;
    }
  }, []);

  // Fetch subscription data
  const fetchSubscription = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.error('Cannot fetch subscription: No user ID provided');
        return null;
      }

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (subError) {
        // This might not be an error if the user simply doesn't have a subscription
        if (subError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching subscription:', subError);
        }
        return null;
      }
      
      return subData ? {
        status: subData.status as any,
        planName: subData.plan_name as string,
        currentPeriodEnd: new Date(subData.current_period_end as string)
      } : null;
    } catch (error) {
      console.error('Unexpected error fetching subscription:', error);
      return null;
    }
  }, []);

  // Build user profile with subscription data
  const buildUserProfile = useCallback(async (currentSession: Session) => {
    try {
      if (!currentSession?.user) {
        console.error('Cannot build user profile: No session user');
        return null;
      }

      const userData = await fetchUserProfile(currentSession.user.id);
      if (!userData) return null;

      const subscriptionData = await fetchSubscription(currentSession.user.id);
      
      return {
        id: userData.id as string,
        name: userData.name as string | undefined,
        email: currentSession.user.email || '',
        isPremium: !!subscriptionData && subscriptionData.status === 'active',
        trialEndsAt: userData.trial_ends_at as string | null,
        createdAt: userData.created_at as string,
        subscription: subscriptionData as any
      };
    } catch (error) {
      console.error('Error building user profile:', error);
      return null;
    }
  }, [fetchUserProfile, fetchSubscription]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);
        
        // Get the current session using our auth utility
        const currentSession = await authUtils.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setIsAuthenticated(true);
          
          // Build user profile with subscription data
          const userProfile = await buildUserProfile(currentSession);
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.error('Failed to build user profile');
            setAuthError('Failed to load user profile');
          }
        } else {
          // No session found
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initialize auth
    initAuth();
    
    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && newSession) {
          setSession(newSession);
          setIsAuthenticated(true);
          setAuthError(null);
          
          // Build user profile with subscription data
          const userProfile = await buildUserProfile(newSession);
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.error('Failed to build user profile after sign in');
            setAuthError('Failed to load user profile');
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
        } else if (event === 'USER_UPDATED' && newSession) {
          setSession(newSession);
          
          // Refresh user profile data
          const userProfile = await buildUserProfile(newSession);
          
          if (userProfile) {
            setUser(userProfile);
          }
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      if (data && data.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, [buildUserProfile]);

  // Login function
  const login = async (email: string, password: string, options?: any) => {
    try {
      setAuthError(null);
      
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email and password are required' 
        };
      }
      
      console.log('Attempting login for:', email);
      
      // Use the captchaToken from options if available
      if (options?.captchaToken) {
        console.log('🔑 AUTH: Using provided captcha token for authentication');
      } else {
        console.warn('🔑 AUTH: No captcha token provided for authentication');
      }
      
      // Use Supabase client directly for now to avoid any circular dependencies
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        ...(options?.captchaToken ? { captchaToken: options.captchaToken } : {})
      });
      
      if (error) {
        console.error('Login error:', error.message);
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Login successful');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Unexpected login error:', error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string, options?: any) => {
    try {
      setAuthError(null);
      
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email and password are required' 
        };
      }
      
      console.log('Attempting signup for:', email);
      
      // Base options with user data
      const baseOptions: any = {
        data: { name },
        ...options
      };
      
      // Use our consolidated auth utility with the captcha token
      const { data, error } = await authUtils.signUpWithEmail(email, password, baseOptions);
      
      if (error) {
        console.error('Signup error:', error.message);
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Signup successful');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Unexpected signup error:', error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthError(null);
      
      // Use our consolidated auth utility
      const { error } = await authUtils.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        setAuthError(error.message);
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      setAuthError(error instanceof Error ? error.message : 'An unexpected error occurred during logout');
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Get the current session
      const currentSession = await authUtils.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);
        
        // Build user profile with subscription data
        const userProfile = await buildUserProfile(currentSession);
        
        if (userProfile) {
          setUser(userProfile);
        } else {
          console.error('Failed to build user profile during refresh');
          setAuthError('Failed to refresh user profile');
        }
      } else {
        // No session found
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setAuthError('Failed to refresh session');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setAuthError(null);
      
      if (!email) {
        return { 
          success: false, 
          error: 'Email is required' 
        };
      }
      
      const { data, error } = await authUtils.resetPassword(email);
      
      if (error) {
        console.error('Reset password error:', error.message);
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Unexpected reset password error:', error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update password function
  const updatePassword = async (password: string) => {
    try {
      setAuthError(null);
      
      if (!password) {
        return { 
          success: false, 
          error: 'Password is required' 
        };
      }
      
      const { data, error } = await authUtils.updatePassword(password);
      
      if (error) {
        console.error('Update password error:', error.message);
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Unexpected update password error:', error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isSubscribed,
    authError,
    login,
    signup,
    logout,
    refreshSession,
    resetPassword,
    updatePassword
  };
}
