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
  const [sessionData, setSessionData] = useState<any>(null);
  
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
  
  // Helper function to store session data
  const setSession = useCallback((session: any) => {
    console.log('Storing session data');
    setSessionData(session);
    
    // Optionally store in localStorage for persistence
    try {
      // Store a minimal version of the session to avoid localStorage size limits
      const minimalSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      };
      localStorage.setItem('auth_session', JSON.stringify(minimalSession));
      } catch (error) {
      console.warn('Failed to store session in localStorage:', error);
    }
  }, []);
  
  // Helper function to clear session data
  const clearSession = useCallback(() => {
    console.log('Clearing session data');
    setSessionData(null);
    try {
      localStorage.removeItem('auth_session');
        } catch (error) {
      console.warn('Failed to clear session from localStorage:', error);
    }
  }, []);
  
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
      // Always log to console as a reliable backup
      console.log('[Security Event]:', {
          ...eventData,
          timestamp: new Date().toISOString()
        });

      // First try to use the server API endpoint with more robust error handling
      let serverApiSuccess = false;
      try {
        // Use absolute URL to ensure we hit the right endpoint in production
        const apiUrl = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
          ? 'http://localhost:3000/api/auth/security-log'  // Local development - force HTTP
          : `${window.location.origin}/api/auth/security-log`;  // Production

        console.log(`Logging security event to: ${apiUrl}`);

        const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

        // Always treat as success for security logs to avoid interrupting auth
        serverApiSuccess = true;
        return;
      } catch (apiError) {
        console.warn('Failed to log security event via API, falling back to client:', apiError);
      }

      // Only proceed if server API call failed
      if (serverApiSuccess) return;

      // Fall back to direct database insertion if the API fails
      const { user_id, event_type, details, email } = eventData;
      
      // Get client IP
      let ip_address = '0.0.0.0';
      try {
        ip_address = await getClientIP();
      } catch (ipError) {
        console.warn('Failed to get client IP:', ipError);
      }
      
      const user_agent = navigator.userAgent;

      // Try both security_logs and profiles tables to maximize chances of success
      try {
        const { error } = await supabase.from('security_logs').insert({
          user_id: user_id || null,
          event_type,
          ip_address,
          user_agent,
          details,
          email: email || null,
          created_at: new Date().toISOString(),
        });

        if (error) {
          if (error.code === '404' || error.code === 'PGRST116') {
            console.log('Security logs table not available, trying to update profile activity instead');
            
            // If security_logs table doesn't exist, try to update the profile's last_activity
            if (user_id) {
              await supabase.from('profiles').update({
                last_activity: event_type,
                last_activity_at: new Date().toISOString(),
              }).eq('id', user_id);
            }
          } else {
            console.warn('Failed to log security event:', error);
          }
        }
      } catch (error) {
        console.warn('Error logging security event:', error);
        // Non-critical, so we don't rethrow
      }
    } catch (error) {
      console.warn('Error in logSecurityEvent:', error);
      // Non-critical function, so we don't rethrow to avoid breaking auth flows
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
      
      if (error) {
        console.error('Error fetching user data:', error);
        
        // If the profile doesn't exist, try to create it
        if (error.code === 'PGRST116' || error.message.includes('rows returned')) {
          console.log('Profile not found, attempting to create one...');
          
          // Get user info from auth
          const { data: userData } = await supabase.auth.getUser();
          
          if (!userData || !userData.user) {
            console.error('Failed to get user data from auth, will try session data');
            
            // Try to get from session as a last resort
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData?.session?.user) {
              console.log('Found user data in session');
              return {
                id: userId,
                email: sessionData.session.user.email || 'unknown@example.com',
                name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'User',
                isPremium: false,
                trialEndsAt: null,
                createdAt: sessionData.session.user.created_at || new Date().toISOString(),
                subscription: {
                  status: 'free',
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                }
              };
            }
            
            console.error('Could not retrieve user data from auth or session');
            throw new Error('Could not retrieve user data');
          }
          
          // Get current time for timestamps
          const now = new Date().toISOString();
          
          // Set trial end date to 7 days from now
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);
          const trialEndsAtISO = trialEndsAt.toISOString();
          
          // Create a profile entry with all required fields
          const { error: createError } = await supabase.from('profiles').insert({
            id: userId,
            name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
            is_premium: true,
            trial_ends_at: trialEndsAtISO,
            subscription: {
              status: 'trialing',
              plan_name: 'Basic',
              current_period_end: trialEndsAtISO
            },
            created_at: now,
            updated_at: now,
            last_sign_in_at: null,
            raw_app_meta_data: null,
            raw_user_meta_data: null
          });
          
          if (createError) {
            console.error('Error creating profile:', createError);
            throw new Error('Failed to create user profile');
          }
          
          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (fetchError || !newProfile) {
            throw new Error('Created profile but failed to fetch it');
          }
          
          console.log('Profile created successfully');
          return {
            id: userId,
            email: userData.user.email || 'unknown@example.com',
            name: newProfile.name,
            isPremium: !!newProfile.is_premium,
            trialEndsAt: newProfile.trial_ends_at,
            createdAt: newProfile.created_at,
            subscription: newProfile.subscription
          };
        }
        
        throw error;
      }
      
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
        console.error('Failed to get user data from auth, will try session data');
        
        // Try to get from session as a last resort
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          console.log('Found user data in session');
          return {
            id: userId,
            email: sessionData.session.user.email || 'unknown@example.com',
            name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'User',
            isPremium: false,
            trialEndsAt: null,
            createdAt: sessionData.session.user.created_at || new Date().toISOString(),
            subscription: {
              status: 'free',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          };
        }
        
        console.error('Could not retrieve user data from auth or session');
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
      
      // Normalize email format
      const sanitizedEmail = email.trim().toLowerCase();
      
      console.log(`Attempting login for ${sanitizedEmail}...`);
      
      // First try with direct client
      const { data: authData, error } = await authService.signIn(sanitizedEmail, password);
      
      // Check for auth error
      if (error) {
        console.error('Authentication error:', error);
        
        // Log failed login attempt (won't fail auth flow if logging fails)
        try {
          await logSecurityEvent({
            event_type: 'login_failed',
            details: `Login failed: ${error.message}`,
            email: sanitizedEmail
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        
        throw error;
      }
      
      if (!authData) {
        console.error('Missing auth data after authentication');
        throw new Error('Authentication succeeded but no data was returned');
      }
      
      console.log('Authentication successful, checking session data');
      
      // Check if we have a valid session
      if (!authData.session) {
        console.error('Missing session data in authData:', authData);
        throw new Error('Authentication succeeded but no session was returned');
      }
      
      // Store session in localStorage
      setSession(authData.session);
      
      // Safely get user ID - handle both standard and dev authentication structures
      let userId;
      
      if (authData.session.user?.id) {
        // Standard Supabase auth structure
        userId = authData.session.user.id;
      } else if (authData.user?.id) {
        // Alternative structure (from our dev endpoint)
        userId = authData.user.id;
      } else {
        console.error('Cannot find user ID in authentication data:', authData);
        throw new Error('Authentication succeeded but user ID is missing');
      }
      
      console.log(`Got user ID: ${userId}`);
      
      // Try to get user data
      try {
        console.log('Fetching user data...');
        const userData = await fetchUserData(userId);
        
        // Set user state
        setUser(userData);
        setIsAuthenticated(true);
        
        // Log successful login (won't fail auth flow if logging fails)
        try {
          await logSecurityEvent({
            user_id: userData.id,
            event_type: 'login_success',
            details: 'User logged in successfully',
            email: sanitizedEmail
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        
        console.log('Login process completed successfully');
        return { success: true, user: userData };
      } catch (userDataError) {
        console.error('Error fetching user data after login:', userDataError);
        
        // Create a minimal user from session/user data as fallback
        console.log('Creating minimal user object from available data');
        
        // Get email from wherever it's available
        const userEmail = authData.user?.email || 
                        authData.session.user?.email || 
                        sanitizedEmail;
        
        // Get name from metadata or generate from email
        const userName = (authData.user?.user_metadata?.name || 
                         authData.session.user?.user_metadata?.name || 
                         userEmail.split('@')[0] || 
                         'User');
                         
        const minimalUser: User = {
          id: userId,
          email: userEmail,
          name: userName,
          isPremium: false,
          trialEndsAt: null,
          createdAt: new Date().toISOString(),
          subscription: {
            status: 'free',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        };
        
        setUser(minimalUser);
        setIsAuthenticated(true);
        
        // Log warning about user data
        try {
          await logSecurityEvent({
            user_id: minimalUser.id,
            event_type: 'login_partial',
            details: 'User logged in but profile data could not be retrieved',
            email: userEmail
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        
        console.log('Login completed with minimal user data');
        return { success: true, user: minimalUser, warning: 'Using minimal user data' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error.message || 'Failed to authenticate',
        originalError: error 
      };
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
      clearSession(); // Clear the session data
      
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
      
      // First try with direct Supabase client
      const { data: authData, error } = await authService.signUp(email, password, {
        name: name || '',
      });
      
      // If direct client signup fails with a captcha error, try server-side signup
      if (error && (error.message.includes('captcha') || error.message.includes('429') || error.message.includes('rate limit'))) {
        console.log('Direct signup failed with captcha/rate limit, trying server API...');
        
        try {
          // Try to get a Turnstile token for server-side verification
          let turnstileToken = null;
          try {
            // Import the getTurnstileToken function dynamically to avoid circular dependencies
            const { getTurnstileToken } = await import('@/utils/supabase/client');
            turnstileToken = await getTurnstileToken();
            console.log('Got Turnstile token for server-side signup');
          } catch (tokenError) {
            console.warn('Failed to get Turnstile token for server signup:', tokenError);
            // Continue without token - server will decide if it's necessary
          }
          
          // Use absolute URL to ensure we hit the right endpoint in production
          const apiUrl = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
            ? 'http://localhost:3000/api/auth/signup'  // Local development - force HTTP
            : `${window.location.origin}/api/auth/signup`;  // Production

          console.log(`Attempting server signup via: ${apiUrl}`);

          // Use edge function as fallback
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email, 
              password,
              metadata: { name: name || '' },
              turnstileToken // Add the Turnstile token to the request
            }),
          });
          
          // First check if response is ok before trying to parse JSON
          if (!response.ok) {
            let errorMessage = 'Server signup failed';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
              
              // For debugging - log detailed error if available
              if (errorData.details) {
                console.error('Error details:', errorData.details);
              }
            } catch (jsonError) {
              console.error('Failed to parse error response:', jsonError);
              // If we can't parse the JSON, use the status text
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }
          
          // Now safely parse the JSON
          let serverAuthData;
          try {
            serverAuthData = await response.json();
          } catch (jsonError) {
            console.error('Failed to parse success response:', jsonError);
            throw new Error('Invalid response from signup server');
          }
          
          if (!serverAuthData.user) {
            throw new Error('Server signup successful but user data is missing');
          }
          
          // Log successful signup (won't fail auth flow if it errors)
          try {
            await logSecurityEvent({
              user_id: serverAuthData.user.id,
              event_type: 'signup_success',
              details: 'User registered successfully via server API',
              email: email,
            });
          } catch (logError) {
            console.warn('Failed to log security event:', logError);
          }
          
          // Since server confirms email directly, return needsEmailConfirmation as false
          return { needsEmailConfirmation: false };
        } catch (serverError) {
          console.error('Server-side signup failed:', serverError);
          
          // Log failed signup attempt (won't fail auth flow if it errors)
          try {
            await logSecurityEvent({
              event_type: 'signup_failed',
              details: `Signup failed (server): ${serverError.message}`,
              email: email,
            });
          } catch (logError) {
            console.warn('Failed to log security event:', logError);
          }
          
          throw serverError;
        }
      }
        
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
