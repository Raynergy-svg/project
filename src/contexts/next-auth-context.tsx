'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase-client';

// Define types
interface UserProfile {
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

interface NextAuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  login: (email: string, password: string) => Promise<{ user: UserProfile | null; error: any }>;
  signup: (email: string, password: string, name?: string) => Promise<{ user: UserProfile | null; error: any }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create auth context
const NextAuthContext = createContext<NextAuthContextType | undefined>(undefined);

// Provider component
export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if the user is authenticated
  const isAuthenticated = !!user && !!session;
  
  // Check if the user is subscribed (has an active subscription)
  const isSubscribed = !!user?.isPremium || (user?.subscription?.status === 'active' || user?.subscription?.status === 'trialing');

  // Function to map Supabase user to our user profile model
  const mapUserToProfile = async (supabaseUser: User): Promise<UserProfile | null> => {
    if (!supabaseUser) return null;
    
    try {
      // Get user profile data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      if (error) throw error;
      
      // If we don't have a profile yet, create a minimal one
      if (!data) {
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          isPremium: false,
          trialEndsAt: null,
          createdAt: supabaseUser.created_at || new Date().toISOString(),
        };
      }
      
      // Map Supabase profile to our user model
      return {
        id: data.id,
        name: data.name,
        email: supabaseUser.email || data.email || '',
        isPremium: data.is_premium || false,
        trialEndsAt: data.trial_ends_at,
        createdAt: data.created_at,
        subscription: data.subscription ? {
          status: data.subscription.status,
          planName: data.subscription.plan_name,
          currentPeriodEnd: new Date(data.subscription.current_period_end),
        } : undefined,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          
          // Get the user data
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (currentUser) {
            // Map to our user profile model
            const userProfile = await mapUserToProfile(currentUser);
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            const userProfile = await mapUserToProfile(newUser);
            setUser(userProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setSession(data.session);
      
      if (data.user) {
        const userProfile = await mapUserToProfile(data.user);
        setUser(userProfile);
        return { user: userProfile, error: null };
      }
      
      return { user: null, error: 'User not found' };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      
      if (error) throw error;
      
      setSession(data.session);
      
      if (data.user) {
        const userProfile = await mapUserToProfile(data.user);
        setUser(userProfile);
        return { user: userProfile, error: null };
      }
      
      return { user: null, error: 'User not created' };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Refresh session
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      setSession(refreshedSession);
      
      if (refreshedSession?.user) {
        const userProfile = await mapUserToProfile(refreshedSession.user);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const contextValue: NextAuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    isSubscribed,
    login,
    signup,
    logout,
    refreshSession,
  };

  return (
    <NextAuthContext.Provider value={contextValue}>
      {children}
    </NextAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useNextAuth() {
  const context = useContext(NextAuthContext);
  
  if (context === undefined) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  
  return context;
}

// WithAuth HOC for protected routes
export function withAuth(Component: React.ComponentType<any>) {
  const WithAuthComponent = (props: any) => {
    const { isAuthenticated, isLoading } = useNextAuth();
    const router = useRouter();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(`/signin?from=${encodeURIComponent(pathname)}`);
      }
    }, [isAuthenticated, isLoading, router, pathname]);
    
    if (isLoading) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return null; // Will redirect in the useEffect
    }
    
    return <Component {...props} />;
  };
  
  return WithAuthComponent;
} 