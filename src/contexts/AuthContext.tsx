import React, { createContext, useState, useContext, useEffect, useRef } from "react";
// Used for redirecting users after login/logout operations
import { useNavigate } from "react-router-dom";
import type { User, SignUpData } from "@/types";
import { supabase, createBrowserClient } from "@/utils/supabase/client";
import { useDevAccount } from '@/hooks/useDevAccount';
import { encryptField, decryptField } from '@/utils/encryption';
import { logSecurityEvent, SecurityEventType } from '@/services/securityAuditService';
import { getClientIpThroughProxy, mockGetClientIp } from '@/api/clientIpProxy';
import { IS_DEV } from '@/utils/environment';

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
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('focus', updateActivity);
    window.addEventListener('activity', updateActivity); // Custom event from support pages
    
    // Special handling for support pages - extend session automatically
    const extendSessionOnSupportPages = () => {
      const path = window.location.pathname;
      if (path.includes('/support') || path.includes('/compliance') || path.includes('/help')) {
        // Automatically refresh activity timer every 5 minutes on support pages
        const supportPageInterval = setInterval(updateActivity, 5 * 60 * 1000);
        return () => clearInterval(supportPageInterval);
      }
    };
    
    const cleanupSupportInterval = extendSessionOnSupportPages();
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('focus', updateActivity);
      if (cleanupSupportInterval) cleanupSupportInterval();
    };
  }, []);
  
  // Session inactivity check
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      // Check if user is on a support page by looking for the lastSupportActivity in sessionStorage
      const lastSupportActivity = sessionStorage.getItem('lastSupportActivity');
      const isOnSupportPage = lastSupportActivity && (now - parseInt(lastSupportActivity)) < sessionTimeout;
      
      // Only log out if user is inactive AND not on a support page
      if (inactiveTime > sessionTimeout && !isOnSupportPage) {
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
    options?: Record<string, any>
  ): Promise<any> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Get client IP for security logs
      let ipAddress = "";
      try {
        ipAddress = await getClientIP();
      } catch (err) {
        console.warn("Failed to get client IP:", err);
        // Non-critical error, continue with login
      }
      
      // Check rate limiting (skip in development if needed)
      if (!isDevelopment) {
        try {
          const isRateLimited = await checkRateLimiting(email, ipAddress);
          if (isRateLimited) {
            await recordSecurityEvent({
              user_id: undefined,
              event_type: 'rate_limit_exceeded',
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              details: JSON.stringify({
                email,
                timestamp: new Date().toISOString(),
                reason: 'Too many login attempts'
              }),
              email
            });
            
            setIsLoading(false);
            return { 
              success: false, 
              error: 'Too many login attempts. Please try again later or reset your password.' 
            };
          }
        } catch (err) {
          console.warn("Rate limiting check failed:", err);
          // Non-critical error, continue with login attempt
        }
      }
      
      // For development, allow test users to bypass auth in dev environment with special credentials
      if (isDevelopment && email === 'dev@example.com' && password === 'development') {
        console.log("Development mode: Using simulated login");
        
        // Create a mock user for development
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000001', // Use a fixed ID for development
          email: 'dev@example.com',
          name: 'Development User',
          isPremium: true,
          trialEndsAt: null,
          createdAt: new Date().toISOString(),
          subscription: {
            status: 'active',
            planName: 'developer',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          }
        };
        
        // Set user state directly
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        setLastActivity(Date.now());
        
        // Record successful login event
        try {
          await recordSecurityEvent({
            user_id: mockUser.id,
            event_type: 'login_success_dev',
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            details: JSON.stringify({
              timestamp: new Date().toISOString(),
              mode: 'development'
            }),
            email
          });
        } catch (err) {
          console.warn("Failed to record dev login event:", err);
        }
        
        return { success: true };
      }
      
      // Regular authentication flow
      try {
        console.log("Attempting to sign in with Supabase:", email);
        
        // Log the options passed to signInWithPassword
        if (options && options.captchaToken) {
          console.log("Using CAPTCHA token for authentication");
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          ...(options || {})
        });
        
        if (error) {
          // Enhanced error logging for debugging
          console.error('Authentication error details:', {
            message: error.message,
            status: error.status,
            name: error.name
          });
          
          // Record failed login attempt
          try {
            await recordSecurityEvent({
              user_id: undefined,
              event_type: 'login_failed',
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              details: JSON.stringify({
                error: error.message,
                code: error.status,
                timestamp: new Date().toISOString()
              }),
              email
            });
          } catch (recordError) {
            console.error("Failed to record failed login attempt:", recordError);
          }
          
          let errorMessage = 'Invalid login credentials';
          
          // Handle specific errors with more user-friendly messages
          if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please confirm your email before signing in. Check your inbox for a confirmation link.';
          } else if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'The email or password you entered is incorrect. Please try again.';
          } else if (error.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later or reset your password.';
          } else if (error.status === 401) {
            errorMessage = 'Your login session has expired. Please sign in again.';
          } else if (error.status === 404 || error.status === 406) {
            // Resource issues - this might happen in dev if tables aren't set up correctly
            if (isDevelopment) {
              errorMessage = 'Development environment setup incomplete. Some database tables may be missing.';
            } else {
              errorMessage = 'We\'re experiencing technical difficulties. Please try again later.';
            }
          } else if (error.message.includes('captcha verification')) {
            console.error('CAPTCHA verification failed:', error);
            errorMessage = 'CAPTCHA verification failed. Please try again or contact support if the issue persists.';
          } else if (error.status === 500) {
            // Handle the specific 500 Internal Server Error case
            console.error('Database error during login:', error);
            
            // Check for specific database field errors
            if (error.message.includes('last_sign_in') || error.message.includes('last_login')) {
              errorMessage = 'We need to run a database update. Please contact the administrator to run the SQL scripts to add the required fields.';
            } else {
              errorMessage = 'We\'re experiencing database issues. This might be due to missing fields in the auth schema. Please contact support.';
            }
            
            // Log detailed error for debugging
            console.debug('Login 500 error details:', {
              message: error.message,
              status: error.status,
              name: error.name
            });
          } else if (error.status >= 500) {
            errorMessage = 'Our servers are experiencing issues. Please try again later.';
          }
          
          setAuthError(errorMessage);
          setIsLoading(false);
          return { success: false, error: errorMessage };
        }
        
        // Authentication successful
        if (data.user) {
          // Record successful login
          try {
            await recordSecurityEvent({
              user_id: data.user.id,
              event_type: 'login_success',
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              details: JSON.stringify({
                timestamp: new Date().toISOString()
              }),
              email
            });
          } catch (recordError) {
            console.error("Failed to record successful login:", recordError);
          }
          
          // Reset the last activity time
          setLastActivity(Date.now());
          
          // Fetching additional user data will be handled by the session listener
          setIsLoading(false);
          return { success: true };
        }
        
        setIsLoading(false);
        return { success: false, error: 'Unknown error during login' };
      } catch (err) {
        console.error('Supabase authentication error:', err);
        setIsLoading(false);
        return { 
          success: false, 
          error: err instanceof Error ? err.message : 'Error during authentication' 
        };
      }
    } catch (err: any) {
      console.error('Unexpected error during login:', err);
      
      // Try to record the error
      try {
        await recordSecurityEvent({
          user_id: undefined,
          event_type: 'login_error',
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
          details: JSON.stringify({
            error: err.message || 'Unknown error',
            timestamp: new Date().toISOString()
          }),
          email
        });
      } catch (recordError) {
        console.error("Failed to record login error:", recordError);
      }
      
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Login error: ${err.message || 'Unknown error'}` 
        : 'An unexpected error occurred. Please try again later.';
        
      setAuthError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
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
      // Use our proxy service to avoid CSP issues
      const { ip } = IS_DEV 
        ? await mockGetClientIp() 
        : await getClientIpThroughProxy();
      
      return ip || 'unknown';
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
  
  // Log security events for auditing
  const recordSecurityEvent = async (eventData: {
    user_id?: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    details: string;
    email?: string;
  }) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return { success: false, error: 'Supabase client not initialized' };
      }
      
      // Format details as JSON if it's a string
      const parsedDetails = typeof eventData.details === 'string' 
        ? JSON.parse(eventData.details) 
        : eventData.details;
      
      // Try to call our database function to record the security event
      try {
        const { data, error } = await supabase.rpc('insert_security_event', {
          p_user_id: eventData.user_id || null,
          p_event_type: eventData.event_type,
          p_ip_address: eventData.ip_address,
          p_user_agent: eventData.user_agent,
          p_email: eventData.email || null,
          p_details: parsedDetails
        });

        if (error) {
          console.warn('Error recording security event:', error);
          // Store the event in local storage as fallback
          storeSecurityEventLocally(eventData);
        }

        return { success: !error, error };
      } catch (rpcError) {
        console.warn('RPC error recording security event:', rpcError);
        // Fallback to direct table insert if RPC fails (function might not exist yet)
        try {
          const { error: insertError } = await supabase
            .from('security_events')
            .insert({
              user_id: eventData.user_id || null,
              event_type: eventData.event_type,
              ip_address: eventData.ip_address,
              user_agent: eventData.user_agent,
              email: eventData.email || null,
              details: parsedDetails
            });
            
          if (insertError) {
            console.warn('Direct insert error:', insertError);
            storeSecurityEventLocally(eventData);
          }
          
          return { success: !insertError, error: insertError };
        } catch (insertCatchError) {
          console.warn('Insert catch error:', insertCatchError);
          storeSecurityEventLocally(eventData);
          return { success: false, error: insertCatchError };
        }
      }
    } catch (error) {
      console.error('Error recording security event:', error);
      // Store the event in local storage as fallback
      storeSecurityEventLocally(eventData);
      return { success: false, error };
    }
  };

  // Helper function to store security events locally when DB storage fails
  const storeSecurityEventLocally = (eventData: {
    user_id?: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    details: string;
    email?: string;
  }): void => {
    try {
      // Get existing events or initialize empty array
      const storedEvents = JSON.parse(localStorage.getItem('offline_security_events') || '[]');
      // Add timestamp to event
      const eventWithTimestamp = {
        ...eventData,
        timestamp: new Date().toISOString(),
        stored_locally: true
      };
      // Add new event
      storedEvents.push(eventWithTimestamp);
      // Store back to localStorage
      localStorage.setItem('offline_security_events', JSON.stringify(storedEvents));
    } catch (error) {
      console.error('Error storing security event locally:', error);
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
