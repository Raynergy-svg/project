import React, { createContext, useState, useContext, useEffect, useRef } from "react";
// Used for redirecting users after login/logout operations
import { useNavigate } from "react-router-dom";
import type { User, SignUpData } from "@/types";
import { supabase, createBrowserClient } from "@/utils/supabase/client";
import { useDevAccount } from '@/hooks/useDevAccount';
import { encryptField, decryptField } from '@/utils/encryption';
import { logSecurityEvent, SecurityEventType } from '@/services/securityAuditService';

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

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [sessionTimeout, setSessionTimeout] = useState<number>(3 * 60 * 60 * 1000); // 3 hours default
  const navigate = useNavigate();
  
  // Use dev account system in development mode
  const { isDevAccount, verifyDevCredentials } = useDevAccount();

  // Handle user activity tracking for session management
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Track user activity to prevent timeouts during active usage
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);
  
  // Session inactivity check
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      if (inactiveTime > sessionTimeout) {
        console.log('Session timeout due to inactivity');
        logout();
        navigate('/signin?session=expired');
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInactivity);
  }, [isAuthenticated, lastActivity, sessionTimeout]);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setAuthError(sessionError.message);
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
        
        if (session) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user:', userError);
            setAuthError(userError.message);
            setIsAuthenticated(false);
            setUser(null);
            return;
          }
          
          if (userData?.user) {
            // Get user settings from database
            const { data: userSettings, error: settingsError } = await supabase
              .from('user_settings')
              .select('session_timeout')
              .eq('user_id', userData.user.id)
              .single();
              
            if (!settingsError && userSettings?.session_timeout) {
              // Convert minutes to milliseconds
              setSessionTimeout(userSettings.session_timeout * 60 * 1000);
            }
            
            setUser(userData.user);
            setIsAuthenticated(true);
            
            // Record login security event
            await recordSecurityEvent({
              user_id: userData.user.id,
              event_type: 'session_continued',
              ip_address: await getClientIP(),
              user_agent: navigator.userAgent,
              details: 'Session restored during application initialization'
            });
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        
        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session) {
            const { user } = session;
            
            if (user) {
              setUser(user);
              setIsAuthenticated(true);
              setLastActivity(Date.now());
              
              // Record login security event
              await recordSecurityEvent({
                user_id: user.id,
                event_type: 'sign_in',
                ip_address: await getClientIP(),
                user_agent: navigator.userAgent,
                details: 'User signed in successfully'
              });
            }
          }
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAuthenticated(false);
            navigate('/signin');
          }
          
          if (event === 'USER_UPDATED' && session) {
            setUser(session.user);
          }
          
          if (event === 'PASSWORD_RECOVERY') {
            navigate('/reset-password');
          }
        });
        
        return () => {
          authListener.subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication initialization failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Improved login function with comprehensive error handling
  const login = async (
    email: string,
    password: string,
    captchaToken?: string,
    redirectTo?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Get client IP for security logging
      const clientIP = await getClientIP();
      
      // Implement rate limiting for login attempts
      const rateLimited = await checkRateLimiting(email, clientIP);
      if (rateLimited) {
        setAuthError('Too many login attempts. Please try again later.');
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }
      
      // Handling development environment for easier testing
      if (import.meta.env.MODE === 'development' && 
          (email.endsWith('@example.com') || email.endsWith('@test.com'))) {
        console.log('Development mode detected - bypassing captcha');
        
        // Simple login without captcha for development
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Login error:', error);
          setAuthError(error.message);
          
          // Record failed login attempt
          await recordSecurityEvent({
            event_type: 'failed_login',
            email: email, // We don't have user_id yet for failed logins
            ip_address: clientIP,
            user_agent: navigator.userAgent,
            details: `Failed login attempt: ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
        
        if (data?.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setLastActivity(Date.now());
          
          // Navigate to dashboard or specified redirect
          navigate(redirectTo || '/dashboard');
          
          // Record successful login security event
          await recordSecurityEvent({
            user_id: data.user.id,
            event_type: 'sign_in',
            ip_address: clientIP,
            user_agent: navigator.userAgent,
            details: 'User signed in successfully (dev mode)'
          });
          
          return { success: true };
        }
      } else {
        // Production login with captcha
        if (!captchaToken) {
          setAuthError('CAPTCHA verification required');
          return { success: false, error: 'CAPTCHA verification required' };
        }
        
        // Verify captcha token on server side
        const verifyCaptchaResponse = await fetch('/api/verify-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: captchaToken }),
        });
        
        if (!verifyCaptchaResponse.ok) {
          const captchaError = await verifyCaptchaResponse.text();
          setAuthError(`CAPTCHA verification failed: ${captchaError}`);
          return { success: false, error: `CAPTCHA verification failed: ${captchaError}` };
        }
        
        // Proceed with login after captcha validation
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Login error:', error);
          setAuthError(error.message);
          
          // Check for specific error conditions
          if (error.message.includes('Email not confirmed')) {
            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            return { success: false, error: 'Please verify your email before signing in' };
          }
          
          // Record failed login attempt
          await recordSecurityEvent({
            event_type: 'failed_login',
            email: email,
            ip_address: clientIP,
            user_agent: navigator.userAgent,
            details: `Failed login attempt: ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
        
        if (data?.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setLastActivity(Date.now());
          
          // Get user's preferred session timeout setting
          const { data: userSettings } = await supabase
            .from('user_settings')
            .select('session_timeout')
            .eq('user_id', data.user.id)
            .single();
            
          if (userSettings?.session_timeout) {
            // Convert minutes to milliseconds
            setSessionTimeout(userSettings.session_timeout * 60 * 1000);
          }
          
          // Navigate to dashboard or specified redirect
          navigate(redirectTo || '/dashboard');
          
          // Record successful login security event
          await recordSecurityEvent({
            user_id: data.user.id,
            event_type: 'sign_in',
            ip_address: clientIP,
            user_agent: navigator.userAgent,
            details: 'User signed in successfully'
          });
          
          return { success: true };
        }
      }
      
      // Fallback error if we reach this point
      setAuthError('An unexpected error occurred during login');
      return { success: false, error: 'An unexpected error occurred during login' };
    } catch (error) {
      console.error('Login exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        // Record logout security event
        await recordSecurityEvent({
          user_id: user.id,
          event_type: 'sign_out',
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
          details: 'User signed out successfully'
        });
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        setAuthError(error.message);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        navigate('/signin');
      }
    } catch (error) {
      console.error('Logout exception:', error);
      setAuthError(error instanceof Error ? error.message : 'An unexpected error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get client IP for security logging
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Could not get client IP:', error);
      return 'unknown';
    }
  };
  
  // Helper function to implement rate limiting
  const checkRateLimiting = async (email: string, ipAddress: string): Promise<boolean> => {
    if (import.meta.env.MODE === 'development') {
      return false; // Skip rate limiting in development
    }
    
    try {
      // Check recent login attempts for this email and IP
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { count, error } = await supabase
        .from('security_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'failed_login')
        .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
        .gte('created_at', fiveMinutesAgo.toISOString());
        
      if (error) {
        console.error('Rate limiting check error:', error);
        return false; // Default to allowing login if check fails
      }
      
      // Limit to 5 attempts in 5 minutes
      return count !== null && count >= 5;
    } catch (error) {
      console.error('Rate limiting check exception:', error);
      return false;
    }
  };
  
  // Helper function to record security events
  const recordSecurityEvent = async (eventData: {
    user_id?: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    details: string;
    email?: string;
  }) => {
    try {
      // Format details as JSON if it's a string
      const parsedDetails = typeof eventData.details === 'string' 
        ? JSON.parse(eventData.details) 
        : eventData.details;
      
      // Call our database function to record the security event
      const { data, error } = await supabase.rpc('insert_security_event', {
        p_user_id: eventData.user_id || null,
        p_event_type: eventData.event_type,
        p_ip_address: eventData.ip_address,
        p_user_agent: eventData.user_agent,
        p_email: eventData.email || null,
        p_details: parsedDetails
      });

      if (error) {
        console.error('Error recording security event:', error);
      }

      return { success: !error, error };
    } catch (error) {
      console.error('Failed to record security event:', error);
      return { success: false, error };
    }
  };

  const signup = async (data: SignUpData): Promise<{ needsEmailConfirmation?: boolean }> => {
    try {
      // Encrypt sensitive user data
      const { encryptedValue: encryptedEmail, iv: emailIv } = await encryptField(data.email);
      
      let nameIv = '';
      let encryptedName = '';
      if (data.name) {
        const result = await encryptField(data.name);
        encryptedName = result.encryptedValue;
        nameIv = result.iv;
      }

      // Sign up the user
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            // Store encrypted data and IVs
            email: encryptedEmail,
            emailIv: emailIv,
            name: encryptedName,
            nameIv: nameIv,
            isPremium: false,
            subscription: {
              status: 'free'
            }
          },
          captchaToken: data.captchaToken
        }
      });

      if (error) throw error;

      // Check if email confirmation is required
      const needsEmailConfirmation = authData.user?.identities?.length === 0;
      return { needsEmailConfirmation };

    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
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
      setIsAuthenticated(true);
      setLastActivity(Date.now());
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
        isSubscribed: !!user?.subscription?.status && user.subscription.status === 'active',
        subscriptionStatus: user?.subscription?.status || 'free',
        subscriptionPlan: user?.subscription?.planName,
        subscriptionEndDate: user?.subscription?.currentPeriodEnd,
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
