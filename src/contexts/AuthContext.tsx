import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { supabase, authService } from '@/utils/supabase/client';
import { IS_DEV } from '@/utils/environment';

// ============================================================
// TYPES
// ============================================================

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

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, options?: Record<string, any>) => Promise<any>;
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

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER COMPONENT
// ============================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Session activity tracking
  const activityTimeout = useRef<number | null>(null);
  const inactivityLimit = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  // Reset activity timer on user interaction
  const updateActivity = useCallback(() => {
    if (activityTimeout.current) {
      window.clearTimeout(activityTimeout.current);
    }
    
    // Set a new timeout - auto logout after inactivity
    if (isAuthenticated) {
      activityTimeout.current = window.setTimeout(() => {
        console.log('User inactive for too long, logging out');
        logout();
      }, inactivityLimit);
    }
  }, [isAuthenticated]);
  
  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  
  /**
   * Gets client's IP address for security logging
   */
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get IP address:', error);
      return '0.0.0.0';
    }
  };
  
  /**
   * Log security events
   */
  const logSecurityEvent = async (eventData: {
    user_id?: string;
    event_type: string;
    details: string;
    email?: string;
  }) => {
    try {
      // Get client information
      const ipAddress = await getClientIP();
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
      
      // Log to Supabase directly
      if (supabase) {
        try {
          await supabase.from('security_logs').insert({
            user_id: eventData.user_id,
            event_type: eventData.event_type,
            ip_address: ipAddress,
            user_agent: userAgent,
            details: eventData.details,
            email: eventData.email,
            created_at: new Date().toISOString()
          });
        } catch (dbError) {
          // Non-critical, just log to console
          console.warn('Could not write security log to database:', dbError);
        }
      }
      
      // Always log to console as backup
      console.log('[Security Event]:', {
        ...eventData,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Just log the error but don't interrupt the authentication flow
      console.warn('Error recording security event (non-critical):', error);
    }
  };
  
  /**
   * Fetch user data from Supabase
   */
  const fetchUserData = async (userId: string): Promise<User> => {
    try {
      // Fetch user profile from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error('User profile not found');
      }
      
      // Get subscription info if available
      let subscription;
      try {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (subData) {
          subscription = {
            status: subData.status,
            planName: subData.plan_name,
            currentPeriodEnd: new Date(subData.current_period_end)
          };
        }
      } catch (subError) {
        console.warn('Error fetching subscription:', subError);
        // Non-critical, continue without subscription data
      }
      
      // Return structured user object
      return {
        id: userId,
        name: data.name,
        email: data.email,
        emailIv: data.email_iv,
        nameIv: data.name_iv,
        isPremium: !!subscription && subscription.status === 'active',
        trialEndsAt: data.trial_ends_at,
        createdAt: data.created_at,
        subscription
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Return minimal user data if profile fetch fails
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData || !userData.user) {
        throw new Error('Could not retrieve user data');
      }
      
      return {
        id: userId,
        email: userData.user.email || 'unknown@example.com',
        isPremium: false,
        trialEndsAt: null,
        createdAt: userData.user.created_at || new Date().toISOString(),
      };
    }
  };

  // ============================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================
  
  /**
   * Initialize authentication state
   */
  const initAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current session
      const { session, error } = await authService.getSession();
      
      if (error || !session) {
        // No active session, set unauthenticated state
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch user data
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Set activity timeout
        updateActivity();
        
        // Log successful auth initialization
        logSecurityEvent({
          user_id: userData.id,
          event_type: 'session_restored',
          details: 'User session restored successfully'
        });
      } catch (userError) {
        console.error('Failed to fetch user data during init:', userError);
        setUser(null);
        setIsAuthenticated(false);
        
        // Try to clean up the invalid session
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Authentication initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [updateActivity]);
  
  /**
   * Login function
   */
  const login = async (
    email: string,
    password: string,
    options?: {
      data?: Record<string, any>;
    }
  ): Promise<any> => {
    try {
      setIsLoading(true);
      
      // Perform authentication
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        // Log failed login attempt
        await logSecurityEvent({
          event_type: 'login_failed',
          details: `Login failed: ${error.message}`,
          email: email,
        });
        
        throw new Error(error.message);
      }
      
      if (!data?.session || !data?.user) {
        throw new Error('Authentication successful but session data is missing');
      }
      
      // Fetch complete user data
      try {
        const userData = await fetchUserData(data.user.id);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Log successful login
        await logSecurityEvent({
          user_id: data.user.id,
          event_type: 'login_success',
          details: 'User logged in successfully',
          email: email,
        });
        
        return { user: userData };
      } catch (userDataError) {
        console.error('Failed to fetch user data after login:', userDataError);
        
        // Fall back to basic user info
        const basicUser = {
          id: data.user.id,
          email: data.user.email || email,
          isPremium: false,
          trialEndsAt: null,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        
        setUser(basicUser);
        setIsAuthenticated(true);
        
        return { user: basicUser };
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logout function
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Log the logout event before signing out
      if (user) {
        await logSecurityEvent({
          user_id: user.id,
          event_type: 'logout',
          details: 'User logged out',
          email: user.email,
        });
      }
      
      // Sign out from Supabase
      const { error } = await authService.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
      }
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any activity timers
      if (activityTimeout.current) {
        window.clearTimeout(activityTimeout.current);
        activityTimeout.current = null;
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Signup function
   */
  const signup = async (data: SignUpData): Promise<{ needsEmailConfirmation?: boolean }> => {
    try {
      setIsLoading(true);
      
      const { email, password, name } = data;
      
      // Register user with Supabase
      const { data: authData, error } = await authService.signUp(email, password, {
        name: name || '',
      });
      
      if (error) {
        await logSecurityEvent({
          event_type: 'signup_failed',
          details: `Signup failed: ${error.message}`,
          email: email,
        });
        
        throw new Error(error.message);
      }
      
      // Log successful signup
      await logSecurityEvent({
        user_id: authData?.user?.id,
        event_type: 'signup_success',
        details: 'User registered successfully',
        email: email,
      });
      
      // In development, we might auto-confirm emails
      if (IS_DEV && authData?.user) {
        try {
          // Create profile entry
          await supabase.from('profiles').insert({
            id: authData.user.id,
            email: email,
            name: name || '',
            created_at: new Date().toISOString(),
          });
        } catch (profileError) {
          console.warn('Error creating profile in dev mode:', profileError);
        }
        
        return { needsEmailConfirmation: false };
      }
      
      return { needsEmailConfirmation: true };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Resend confirmation email
   */
  const resendConfirmationEmail = async (email: string) => {
    try {
      setIsLoading(true);
      
      // We're using password reset as email confirmation
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      // Log the event
      await logSecurityEvent({
        event_type: 'confirmation_email_sent',
        details: 'Confirmation email resent',
        email: email,
      });
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Update user data
   */
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          // Add other fields as needed
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setUser({ ...user, ...data });
      
      // Log the event
      await logSecurityEvent({
        user_id: user.id,
        event_type: 'profile_updated',
        details: 'User profile updated',
        email: user.email,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // ============================================================
  // DERIVED STATE & SIDE EFFECTS
  // ============================================================
  
  // Set up session and event listeners
  useEffect(() => {
    // Initialize auth on mount
    initAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        try {
          const userData = await fetchUserData(session.user.id);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data on auth change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    
    // Set up activity listeners for session management
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, updateActivity);
    });
    
    // Clean up
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
      
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, updateActivity);
      });
      
      if (activityTimeout.current) {
        window.clearTimeout(activityTimeout.current);
      }
    };
  }, [updateActivity, initAuth]);
  
  // Compute subscription state
  const isSubscribed = !!user?.isPremium;
  const subscriptionStatus = user?.subscription?.status || 'free';
  const subscriptionPlan = user?.subscription?.planName;
  const subscriptionEndDate = user?.subscription?.currentPeriodEnd;
  
  // Provide context
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
