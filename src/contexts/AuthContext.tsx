import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { User, SignUpData } from "@/types";
import { supabase, createBrowserClient } from "@/utils/supabase/client";
import { useDevAccount } from '@/hooks/useDevAccount';

export interface User {
  id: string;
  name?: string;
  email: string;
  emailIv?: string;
  nameIv?: string;
  isPremium: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  subscription?: {
    status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing';
    planName?: string;
    currentPeriodEnd: Date;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, options?: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignUpData) => Promise<{ needsEmailConfirmation?: boolean }>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | undefined;
  subscriptionEndDate: Date | undefined;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | undefined>(undefined);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();
  
  // Use dev account system in development mode
  const { isDevAccount, verifyDevCredentials } = useDevAccount();

  // Safety timeout - don't block the app for more than 5 seconds
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading safety timeout reached, continuing without auth');
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for mock authentication in development mode
        if (process.env.NODE_ENV === 'development') {
          try {
            const mockTokenData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
            if (mockTokenData.access_token === 'fake-dev-token') {
              console.log('Development mode: Loading mock user data');
              
              // Mock user data for development
              const mockUser = {
                id: 'dev-user-123',
                email: 'dev@example.com',
                isPremium: true,
                trialEndsAt: null,
                createdAt: new Date().toISOString(),
                subscription: {
                  status: 'active',
                  planName: 'Premium Dev',
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                }
              };
              
              setUser(mockUser);
              setIsAuthenticated(true);
              setIsLoading(false);
              setIsSubscribed(true);
              setSubscriptionStatus('active');
              setSubscriptionPlan('Premium Dev');
              setSubscriptionEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
              
              return;
            }
          } catch (e) {
            // If parsing fails, continue with normal user loading
            console.error('Error parsing mock token', e);
          }
        }
        
        // Normal user loading flow for production
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (session) {
          // Get user data from Supabase auth
          const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !authUser) {
            console.error('Error getting user:', userError?.message);
            setIsLoading(false);
            return;
          }

          // Get additional user data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error getting profile:', profileError.message);
          }

          // Create a combined user object with auth and profile data
          const userData: User = {
            id: authUser.id,
            name: authUser.user_metadata?.name || profileData?.name,
            email: authUser.email || '',
            isPremium: profileData?.is_premium || false,
            trialEndsAt: profileData?.trial_ends_at || null,
            createdAt: authUser.created_at || new Date().toISOString(),
            subscription: profileData?.subscription ? {
              status: profileData.subscription.status || 'free',
              planName: profileData.subscription.plan_name,
              currentPeriodEnd: profileData.subscription.current_period_end 
                ? new Date(profileData.subscription.current_period_end) 
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            } : undefined
          };

          setUser(userData);
          setIsAuthenticated(true);
          setIsSubscribed(!!userData.subscription?.status && userData.subscription.status === 'active');
          setSubscriptionStatus(userData.subscription?.status || 'free');
          setSubscriptionPlan(userData.subscription?.planName);
          setSubscriptionEndDate(userData.subscription?.currentPeriodEnd);
        }
      } catch (error) {
        console.error('Failed to load user from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load user initially
    loadUser();

    // Skip Supabase auth state subscription in development mode with mock auth
    if (process.env.NODE_ENV === 'development') {
      try {
        const mockTokenData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
        if (mockTokenData.access_token === 'fake-dev-token') {
          console.log('Development mode: Using mock authentication');
          return () => {}; // No cleanup needed for mock auth
        }
      } catch (e) {
        // If parsing fails, continue with normal auth flow
        console.error('Error parsing mock token', e);
      }
    }

    // Normal Supabase auth state subscription for production
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Reload user data when signed in or token refreshed
          loadUser();
        } else if (event === 'SIGNED_OUT') {
          // Clear user data when signed out
          setUser(null);
          setIsAuthenticated(false);
          setIsSubscribed(false);
          setSubscriptionStatus('free');
          setSubscriptionPlan(undefined);
          setSubscriptionEndDate(undefined);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, options?: Record<string, any>) => {
    setIsLoading(true);
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.DEV;
      
      // Special handling for development accounts in development mode
      if (isDevelopment && isDevAccount(email)) {
        console.log('Development mode: Using development account');
        
        // Verify dev credentials (any password works for dev accounts)
        const { valid, account } = verifyDevCredentials(email, password);
        
        if (valid && account) {
          // Create a mock user with the dev account details
          const mockUser: User = {
            id: account.id,
            email: account.email,
            name: account.name,
            isPremium: account.isPremium,
            trialEndsAt: null,
            createdAt: new Date().toISOString(),
            subscription: {
              status: account.isPremium ? 'active' : 'free',
              planName: account.isPremium ? 'Premium Plan' : 'Free Plan',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            }
          };
          
          // Update auth state
          setUser(mockUser);
          setIsAuthenticated(true);
          
          // Return mock data
          return { user: mockUser };
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      if (isDevelopment) {
        console.log('Development mode: Using development auth flow');
        
        // For development, we need to explicitly handle captcha
        const tempClient = createBrowserClient();
        
        // Special dev auth options with captcha hack for development
        const devOptions = {
          captchaToken: 'ignored-in-dev-mode',
          gotrue: {
            detectSessionInUrl: false,
            autoRefreshToken: true,
            persistSession: true,
            multiTab: true,
          }
        };
        
        // Use the temp client for auth in dev mode
        const { data, error } = await tempClient.auth.signInWithPassword({
          email,
          password,
          options: devOptions
        });

        if (error) {
          console.error('Development login error:', error);
          // Check for specific error messages from Supabase
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email to confirm your account before signing in.');
          }
          
          // Special handling for captcha errors in dev
          if (error.message.includes('captcha')) {
            console.warn('Captcha verification failed in development mode. Using fallback session...');
            
            // For development only - create mock session
            // This is just a development convenience - NEVER do this in production
            const mockUser: User = {
              id: 'dev-user-id',
              email: email,
              isPremium: true,
              trialEndsAt: null,
              createdAt: new Date().toISOString(),
              subscription: {
                status: 'active',
                planName: 'Developer Plan',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              }
            };
            
            setUser(mockUser);
            setIsAuthenticated(true);
            return { user: mockUser };
          }
          
          throw error;
        }

        return data;
      } else {
        // Normal authentication flow with captcha for production
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: options
        });

        if (error) {
          // Check for specific error messages from Supabase
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email to confirm your account before signing in.');
          }
          throw error;
        }

        return data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Sign out with Supabase auth
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear user state (will also be cleared by auth state change listener)
      setUser(null);
      setIsAuthenticated(false);
      setIsSubscribed(false);
      setSubscriptionStatus('free');
      setSubscriptionPlan(undefined);
      setSubscriptionEndDate(undefined);
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) throw error;

      if (!authData.user) {
        throw new Error('Signup succeeded but no user was returned');
      }

      // Create a profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: data.name,
            is_premium: !!data.subscriptionId,
            trial_ends_at: data.subscriptionId 
              ? null 
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            subscription: data.subscriptionId ? {
              status: 'active',
              plan_name: 'Premium',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            } : {
              status: 'trialing',
              plan_name: 'Basic',
              current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway - the user is created but profile insertion failed
      }

      // Check if email confirmation is required
      const needsEmailConfirmation = !authData.user.confirmed_at && !!authData.user.confirmation_sent_at;

      if (needsEmailConfirmation) {
        return { needsEmailConfirmation: true };
      }

      // User data will be loaded by the auth state change listener
      navigate("/dashboard");
      return {};
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update user_metadata in Supabase auth
      if (data.name) {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: data.name,
          }
        });

        if (error) {
          console.error('Error updating user metadata:', error);
        }
      }

      // Update profile in the profiles table
      const updateData: Record<string, any> = {};
      if (data.name) updateData.name = data.name;
      if (data.isPremium !== undefined) updateData.is_premium = data.isPremium;
      if (data.trialEndsAt) updateData.trial_ends_at = data.trialEndsAt;
      if (data.subscription) updateData.subscription = {
        status: data.subscription.status,
        plan_name: data.subscription.planName,
        current_period_end: data.subscription.currentPeriodEnd?.toISOString(),
      };

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (error) {
          console.error('Error updating profile:', error);
        }
      }

      // Update local state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setIsSubscribed(!!updatedUser.subscription?.status && updatedUser.subscription.status === 'active');
      setSubscriptionStatus(updatedUser.subscription?.status || 'free');
      setSubscriptionPlan(updatedUser.subscription?.planName);
      setSubscriptionEndDate(updatedUser.subscription?.currentPeriodEnd);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        signup,
        resendConfirmationEmail, 
        isLoading,
        isAuthenticated,
        isSubscribed,
        subscriptionStatus,
        subscriptionPlan,
        subscriptionEndDate,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
