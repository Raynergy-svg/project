// Direct implementation of useAuth hook
import { useEffect, useState } from 'react';
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

  // Check if the user is subscribed (has an active subscription)
  const isSubscribed = user?.subscription?.status === 'active' || user?.subscription?.status === 'trialing';

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session using our auth utility
        const currentSession = await authUtils.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setIsAuthenticated(true);
          
          // Get user profile data
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user profile:', userError);
          } else if (userData) {
            // Get subscription data if available
            let subscriptionData = null;
            
            try {
              const { data: subData, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (!subError && subData) {
                subscriptionData = {
                  status: subData.status as any,
                  planName: subData.plan_name as string,
                  currentPeriodEnd: new Date(subData.current_period_end as string)
                };
              }
            } catch (subError) {
              console.error('Error fetching subscription:', subError);
            }
            
            // Set user with profile and subscription data
            setUser({
              id: userData.id as string,
              name: userData.name as string | undefined,
              email: currentSession.user.email || '',
              isPremium: !!subscriptionData && subscriptionData.status === 'active',
              trialEndsAt: userData.trial_ends_at as string | null,
              createdAt: userData.created_at as string,
              subscription: subscriptionData as any
            });
          }
        } else {
          // No session found
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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
          
          // Get user profile data
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user profile:', userError);
          } else if (userData) {
            // Get subscription data if available
            let subscriptionData = null;
            
            try {
              const { data: subData, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', newSession.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (!subError && subData) {
                subscriptionData = {
                  status: subData.status as any,
                  planName: subData.plan_name as string,
                  currentPeriodEnd: new Date(subData.current_period_end as string)
                };
              }
            } catch (subError) {
              console.error('Error fetching subscription:', subError);
            }
            
            // Set user with profile and subscription data
            setUser({
              id: userData.id as string,
              name: userData.name as string | undefined,
              email: newSession.user.email || '',
              isPremium: !!subscriptionData && subscriptionData.status === 'active',
              trialEndsAt: userData.trial_ends_at as string | null,
              createdAt: userData.created_at as string,
              subscription: subscriptionData as any
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      if (data && data.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string, options?: any) => {
    try {
      console.log('Attempting login for:', email);
      
      // Use the captchaToken from options if available
      if (options?.captchaToken) {
        console.log('🔑 AUTH: Using provided captcha token for authentication');
      } else {
        console.warn('🔑 AUTH: No captcha token provided for authentication');
      }
      
      // Use our consolidated auth utility with the captcha token
      const { data, error } = await authUtils.signInWithEmail(email, password, options);
      
      if (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string, options?: any) => {
    try {
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
        return { success: false, error: error.message };
      }
      
      console.log('Signup successful');
      return { success: true };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Use our consolidated auth utility
      await authUtils.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      // Get the current session
      const currentSession = await authUtils.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);
        
        // Get user data after refreshing session
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user profile:', userError);
        } else if (userData) {
          // Handle subscription data the same way as in initAuth
          let subscriptionData = null;
          
          try {
            const { data: subData, error: subError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', currentSession.user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (!subError && subData) {
              subscriptionData = {
                status: subData.status as any,
                planName: subData.plan_name as string,
                currentPeriodEnd: new Date(subData.current_period_end as string)
              };
            }
          } catch (subError) {
            console.error('Error fetching subscription:', subError);
          }
          
          // Set user with profile and subscription data
          setUser({
            id: userData.id as string,
            name: userData.name as string | undefined,
            email: currentSession.user.email || '',
            isPremium: !!subscriptionData && subscriptionData.status === 'active',
            trialEndsAt: userData.trial_ends_at as string | null,
            createdAt: userData.created_at as string,
            subscription: subscriptionData as any
          });
        }
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Return the auth context
  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isSubscribed,
    login,
    signup,
    logout,
    refreshSession
  };
}
