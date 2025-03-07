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
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [sessionTimeout, setSessionTimeout] = useState<number>(3 * 60 * 60 * 1000); // 3 hours default
  const navigate = useNavigate();
  
  // Use dev account system in development mode
  const { isDevAccount, verifyDevCredentials } = useDevAccount();

  // Handle user activity tracking for session management
  useEffect(() => {
    const updateActivity = () => {
      setLastActivityTime(Date.now());
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
      const inactiveTime = now - lastActivityTime;
      
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
  }, [isAuthenticated, lastActivityTime, sessionTimeout]);

  // Initialize auth by checking for session and setting up user
  useEffect(() => {
    // Function to check current auth session
    const initAuth = async () => {
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          // We have a session, fetch the user data
          const user = await fetchUserData(data.session.user.id);
          setUser(user);
          setIsAuthenticated(true);
          setLastActivityTime(Date.now());
        } else {
          // No active session
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(error instanceof Error ? error.message : 'Failed to check authentication');
      }
    };

    // Wrapper function that handles loading state
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        await initAuth();
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication initialization failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Listen for authentication changes (sign in/sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'User session found' : 'No session');
      
      if (event === 'SIGNED_IN' && session) {
        try {
          // Fetch user data when signed in
          setIsLoading(true);
          const user = await fetchUserData(session.user.id);
          setUser(user);
          setIsAuthenticated(true);
          
          // Reset activity timer
          setLastActivityTime(Date.now());
          
          // Record successful sign-in to security logs
          const ip = await getClientIP();
          await recordSecurityEvent({
            user_id: session.user.id,
            event_type: 'sign_in_successful',
            ip_address: ip,
            user_agent: navigator.userAgent,
            details: JSON.stringify({
              method: 'session_auth_change',
              timestamp: new Date().toISOString()
            })
          });
        } catch (error) {
          console.error('Error handling sign in:', error);
          
          // If there's an issue with user data, log the user out
          if (error instanceof Error && error.message.includes('user data')) {
            await supabase.auth.signOut();
            setAuthError('Error loading user profile. Please sign in again.');
          }
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setIsAuthenticated(false);
        setLastActivityTime(null);
      }
    });
    
    // Always clean up the listener
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Update the login function to simplify options and remove CAPTCHA handling
  const login = async (
    email: string,
    password: string,
    options?: {
      data?: Record<string, any>;
    }
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
        setLastActivityTime(Date.now());
        
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
        
        // Format options properly for Supabase (without CAPTCHA)
        const authOptions: {
          email: string;
          password: string;
          options?: {
            redirectTo?: string;
          };
        } = {
          email,
          password,
          options: {}
        };
        
        // Add other options if provided
        if (options && options.data) {
          authOptions.options = {
            ...authOptions.options,
            ...options.data
          };
        }
        
        console.log("Auth options (sensitive info redacted):", {
          ...authOptions,
          password: "********"
        });
        
        // Add a retry mechanism for 500 errors
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          const { data, error } = await supabase.auth.signInWithPassword(authOptions);
          
          if (error) {
            // Enhanced error logging for debugging
            console.error(`Authentication error on attempt ${retryCount + 1} of ${maxRetries + 1}:`, {
              message: error.message,
              status: error.status,
              name: error.name
            });
            
            // When handling errors, remove specific CAPTCHA error handling
            // Instead of checking for CAPTCHA errors, just handle general 500 errors
            if (error.status === 500) {
              console.log(`Retrying authentication after 500 error (attempt ${retryCount + 1} of ${maxRetries})`);
              retryCount++;
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              continue;
            }
            
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
            if (error.message.includes('Invalid login credentials')) {
              errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.message.includes('Email not confirmed')) {
              errorMessage = 'Please check your email and follow the confirmation link before signing in.';
            } else if (error.message.includes('Too many requests')) {
              errorMessage = 'Too many login attempts. Please try again later.';
            } else if (error.message.includes('Token expired')) {
              errorMessage = 'Your session has expired. Please sign in again.';
            } else if (error.status >= 500) {
              errorMessage = 'Our servers are experiencing issues. Please try again later.';
            } else {
              console.error('Unhandled authentication error:', error);
            }
            
            setAuthError(errorMessage);
            setIsLoading(false);
            throw new Error(errorMessage);
          }
          
          // If we reached here, authentication succeeded
          break;
        }
        
        // Authentication successful
        if (data?.user) {
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
          setLastActivityTime(Date.now());
          
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
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return '0.0.0.0'; // Default if unable to fetch
    }
  };
  
  // Fetch user data with profile information after authentication
  const fetchUserData = async (userId: string): Promise<User> => {
    if (!userId) {
      throw new Error('Cannot fetch user data: No user ID provided');
    }
    
    try {
      // First get the user's auth data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Error getting auth user: ${userError.message}`);
      }
      
      if (!userData?.user) {
        throw new Error('No user found in auth data');
      }
      
      // Then get the extended profile data from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.warn(`Could not fetch user profile: ${profileError.message}`);
        // Return basic user data even if profile can't be fetched
        return {
          id: userData.user.id,
          email: userData.user.email || '',
          isPremium: false,
          trialEndsAt: null,
          createdAt: userData.user.created_at || new Date().toISOString()
        };
      }
      
      // Combine auth user and profile data
      const user: User = {
        id: userData.user.id,
        email: userData.user.email || '',
        name: profileData?.name || undefined,
        isPremium: profileData?.is_premium || false,
        trialEndsAt: profileData?.trial_ends_at || null,
        createdAt: userData.user.created_at || new Date().toISOString(),
        // Add subscription data if available
        subscription: profileData?.subscription_status ? {
          status: profileData.subscription_status as any,
          planName: profileData.subscription_plan,
          currentPeriodEnd: profileData.subscription_end_date ? new Date(profileData.subscription_end_date) : new Date()
        } : undefined
      };
      
      return user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  
  // Records security events like login attempts and password changes
  const recordSecurityEvent = async (eventData: {
    user_id: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    details: string;
  }) => {
    try {
      // Check if the security_logs table exists by querying its structure
      const { error: checkError } = await supabase
        .from('security_logs')
        .select('id')
        .limit(1);
      
      // If there's an error here, the table likely doesn't exist
      if (checkError) {
        console.warn('Security logs table not available:', checkError.message);
        return; // Exit early, can't log security events
      }
      
      const { error } = await supabase
        .from('security_logs')
        .insert([eventData]);
      
      if (error) {
        console.error('Error recording security event:', error);
      }
    } catch (err) {
      // Log but don't throw - security logging should not block authentication
      console.error('Failed to record security event:', err);
    }
  };

  const signup = async (data: SignUpData): Promise<{ needsEmailConfirmation?: boolean }> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Extract consent data if provided
      const { consentRecord, ...signupData } = data;
      
      // Prepare signup options
      const signupOptions: any = {
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            // Add any other profile data here
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      };
      
      // Perform the signup
      const { data: authData, error } = await supabase.auth.signUp(signupOptions);
      
      if (error) throw error;

      // If signup was successful and we have consent information
      if (authData.user && consentRecord) {
        try {
          // Store each consent type separately in the user_consent_records table
          const consentTypes = [
            { type: 'terms_of_service', value: consentRecord.termsAccepted },
            { type: 'privacy_policy', value: consentRecord.privacyAccepted },
            { type: 'marketing', value: consentRecord.marketingConsent },
            { type: 'data_processing', value: consentRecord.dataProcessingConsent },
            { type: 'age_verification', value: consentRecord.ageVerified },
          ];
          
          // Record each consent type
          for (const consent of consentTypes) {
            // Skip if consent property is undefined
            if (consent.value === undefined) continue;
            
            // Store consent record
            await supabase.rpc('record_user_consent', {
              p_user_id: authData.user.id,
              p_consent_type: consent.type,
              p_consent_given: consent.value,
              p_consent_version: consentRecord.consentVersion || '1.0',
              p_consent_method: consentRecord.consentMethod || 'signup_form',
              p_ip_address: consentRecord.ipAddress || null,
              p_user_agent: consentRecord.userAgent || navigator.userAgent,
              p_metadata: { 
                signup_flow: true,
                timestamp: consentRecord.timestamp || new Date().toISOString()
              }
            });
          }
        } catch (consentError) {
          // Log error but don't fail the signup
          console.error('Failed to record consent:', consentError);
        }
      }

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
      setLastActivityTime(Date.now());
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
