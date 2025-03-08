import React, { createContext, useState, useContext, useEffect, useRef } from "react";
// Used for redirecting users after login/logout operations
import { useNavigate } from "react-router-dom";
import type { User, SignUpData } from "@/types";
import { supabase, createBrowserClient, signIn, directAuthenticate } from "@/utils/supabase/client";
import { useDevAccount } from '@/hooks/useDevAccount';
import { encryptField, decryptField } from '@/utils/encryption';
import { logSecurityEvent, SecurityEventType } from '@/services/securityAuditService';
import { getClientIpThroughProxy, mockGetClientIp } from '@/api/clientIpProxy';
import { IS_DEV, isFeatureEnabled } from '@/utils/environment';

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

  // Update the login function to try multiple authentication methods if the standard one fails with CAPTCHA errors
  const login = async (
    email: string,
    password: string,
    options?: {
      data?: Record<string, any>;
    }
  ): Promise<any> => {
    setIsLoading(true);
    setAuthError(null);
    
    const ipAddress = await getClientIP();
    
    try {
      // Check for rate limiting first
      const isRateLimited = await checkRateLimiting(email, ipAddress);
      if (isRateLimited) {
        const rateLimitError = new Error('Too many login attempts. Please try again later.');
        console.error('Rate limiting applied:', rateLimitError);
        throw rateLimitError;
      }
      
      // For development mode, handle special dev account
      if (IS_DEV && email === 'dev@example.com' && password === 'development') {
        console.log('Using development authentication');
        
        // Create a mock user for development
        const mockUser: User = {
          id: 'dev-user-id',
          email: 'dev@example.com',
          name: 'Development User',
          isPremium: true,
          trialEndsAt: null,
          createdAt: new Date().toISOString(),
          subscription: {
            status: 'active',
            planName: 'Developer Plan',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          }
        };
        
        // Set the mock user in state
        setUser(mockUser);
        setIsAuthenticated(true);
        setLastActivityTime(Date.now());
        
        return { success: true, user: mockUser };
      }
      
      let authData = null; // Will store our authentication data
      let authError = null;
      
      try {
        // First try: Standard authentication
        console.log('Using standard Supabase authentication');
        const result = await signIn(email, password);
        
        // Check if there was a CAPTCHA error
        if (result.error && result.error.message && 
            (result.error.message.includes('captcha') || 
             (typeof result.error === 'object' && 'code' in result.error && result.error.code === 'captcha_failed'))) {
          console.log('CAPTCHA error detected, trying direct authentication...');
          throw new Error('CAPTCHA error detected');
        }
        
        // If there's another type of error, process it
        if (result.error) {
          authError = result.error;
          throw result.error;
        }
        
        // If we reach here, authentication was successful
        authData = result.data;
        console.log('Login successful with standard auth');
      } catch (error) {
        // If first method failed with CAPTCHA error, try the direct method
        if (error instanceof Error && error.message.includes('CAPTCHA')) {
          try {
            console.log('Trying direct authentication method...');
            const directResult = await directAuthenticate(email, password);
            
            if (directResult.error) {
              authError = directResult.error;
              throw directResult.error;
            }
            
            authData = directResult.data;
            console.log('Login successful with direct auth');
          } catch (directError) {
            console.error('Direct authentication also failed:', directError);
            authError = directError instanceof Error 
              ? directError 
              : new Error('Authentication failed after multiple attempts');
          }
        } else {
          // Not a CAPTCHA error, just pass along the original error
          authError = error;
        }
      }
      
      // If we still have an error after all attempts, handle it
      if (authError && !authData) {
        // Convert error to user-friendly message
        let errorMessage = 'Invalid login credentials';
        
        // Handle specific error cases
        if (authError.message && authError.message.includes('Invalid login')) {
          errorMessage = 'Invalid email or password';
        } else if (authError.message && authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before signing in';
        } else if (authError.message && authError.message.includes('Rate limit')) {
          errorMessage = 'Too many sign-in attempts. Please try again later.';
        } else if (authError.status === 500 || authError.status === 503) {
          errorMessage = 'Our servers are experiencing issues. Please try again later.';
        }
        
        // Record the failed login attempt if security logging is enabled
        if (isFeatureEnabled('ENABLE_SECURITY_LOGGING')) {
          try {
            await recordSecurityEvent({
              email,
              event_type: 'auth.login.failed',
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              details: `Failed login attempt: ${authError.message}`
            });
          } catch (loggingError) {
            // Don't fail the whole auth process if logging fails
            console.error('Error recording security event:', loggingError);
          }
        }
        
        console.error('Authentication error after all attempts:', new Error(errorMessage));
        throw new Error(errorMessage);
      }
      
      // If we got here without error and have auth data, proceed with login
      if (authData && authData.session) {
        try {
          // Try to record successful login
          try {
            await recordSecurityEvent({
              user_id: authData.user?.id,
              event_type: 'auth.login.success',
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              details: 'Successful login',
              email: authData.user?.email || email
            });
          } catch (recordError) {
            // Security logging is non-critical
            console.warn("Could not record login event:", recordError);
          }
          
          // Fetch detailed user data including profile
          const userData = await fetchUserData(authData.user?.id || '');
          
          // Update the user state
          setUser(userData);
          setIsAuthenticated(true);
          setLastActivityTime(Date.now());
          
          // Store user id in session storage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('last_auth', new Date().toISOString());
          }
          
          setIsLoading(false);
          return { success: true, user: userData };
        } catch (userDataError) {
          console.error("Error fetching user data after login:", userDataError);
          
          // We can continue with basic user data
          const basicUser = {
            id: authData.user?.id || '',
            email: authData.user?.email || email,
            isPremium: false,
            trialEndsAt: null,
            createdAt: authData.user?.created_at || new Date().toISOString()
          };
          
          setUser(basicUser);
          setIsAuthenticated(true);
          setLastActivityTime(Date.now());
          
          setIsLoading(false);
          return { success: true, user: basicUser };
        }
      } else {
        setIsLoading(false);
        throw new Error('Authentication failed - no session data returned');
      }
    } catch (error) {
      console.error('Outer login error:', error);
      setAuthError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
      throw error;
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
      // Use the provided mock function instead of direct fetch
      // This avoids CSP violations by using our own API endpoint
      const result = await mockGetClientIp();
      return result.ip;
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
      
      // Now try to get the user's profile data (handle gracefully if table doesn't exist)
      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!profileError && profileData) {
          profile = profileData;
        } else if (profileError && profileError.code !== 'PGRST116') { 
          // PGRST116 is "relation 'profiles' does not exist"
          console.warn('Error fetching profile:', profileError);
        }
      } catch (profileFetchError) {
        // Non-critical error, continue with minimal user data
        console.warn('Could not fetch profile data:', profileFetchError);
      }
      
      // Try to get subscription status (handle gracefully if table doesn't exist)
      let subscription = null;
      try {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!subscriptionError && subscriptionData) {
          subscription = {
            status: subscriptionData.status || 'free',
            planName: subscriptionData.plan_name,
            currentPeriodEnd: new Date(subscriptionData.current_period_end || Date.now())
          };
        } else if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.warn('Error fetching subscription:', subscriptionError);
        }
      } catch (subscriptionFetchError) {
        // Non-critical error, continue with minimal user data
        console.warn('Could not fetch subscription data:', subscriptionFetchError);
      }
      
      // Construct the user object with whatever data we could get
      const user: User = {
        id: userId,
        email: userData.user.email || '',
        name: profile?.full_name || userData.user.user_metadata?.name,
        emailIv: profile?.email_iv,
        nameIv: profile?.name_iv,
        isPremium: subscription?.status === 'active' || false,
        trialEndsAt: profile?.trial_ends_at || null,
        createdAt: userData.user.created_at || new Date().toISOString(),
        subscription
      };
      
      return user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
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
    user_id?: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    details: string;
    email?: string;
  }) => {
    try {
      // Check if the security_logs table exists
      const { count, error: checkError } = await supabase
        .from('security_logs')
        .select('id', { count: 'exact', head: true });
      
      // If there's an error checking for the table (like 404 Not Found), 
      // the table doesn't exist and we should silently return
      if (checkError) {
        console.log('Security logs table not found, skipping event recording');
        return;
      }
      
      // If we got here, the table exists, so insert the record
      const { error } = await supabase
        .from('security_logs')
        .insert({
          user_id: eventData.user_id || null,
          event_type: eventData.event_type,
          ip_address: eventData.ip_address,
          user_agent: eventData.user_agent,
          details: eventData.details,
          email: eventData.email || null
        });
        
      if (error) {
        console.warn('Failed to record security event:', error);
      }
    } catch (error) {
      // Silent fail - security logging is non-critical to the app functioning
      console.warn('Security event recording failed silently:', error);
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
