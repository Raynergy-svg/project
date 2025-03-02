import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, SignUpData } from "@/types";
import { supabase } from "@/utils/supabase/client";

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
  login: (email: string, password: string) => Promise<void>;
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
  const navigate = useNavigate();

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // For localhost development with no Supabase setup, use mock data
        if (window.location.hostname === 'localhost' && 
            import.meta.env.MODE === 'development') {
          console.warn('Using mock user data for development. Bypassing Supabase auth.');
          const mockUser = {
            id: 'dev-user',
            email: 'dev@example.com',
            name: 'Developer',
            isPremium: true,
            createdAt: new Date().toISOString(),
            trialEndsAt: null,
            subscription: {
              status: 'active' as const,
              planName: 'Pro',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          };
          setUser(mockUser);
          setIsLoading(false);
          return;
        }

        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error.message);
          setIsLoading(false);
          return;
        }

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
        }
      } catch (error) {
        console.error('Failed to load user from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Reload user data when signed in or token refreshed
          loadUser();
        } else if (event === 'SIGNED_OUT') {
          // Clear user data when signed out
          setUser(null);
        }
      }
    );

    loadUser();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Computed properties for subscription status
  const isAuthenticated = !!user;
  const isSubscribed = !!user?.subscription?.status && user.subscription.status === 'active';
  const subscriptionStatus = user?.subscription?.status || 'free';
  const subscriptionPlan = user?.subscription?.planName;
  const subscriptionEndDate = user?.subscription?.currentPeriodEnd;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for specific error messages from Supabase
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email to confirm your account before signing in.');
        }
        throw error;
      }

      // User data will be loaded by the auth state change listener
      navigate("/dashboard");
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
