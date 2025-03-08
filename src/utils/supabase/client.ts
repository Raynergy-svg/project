import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';
import { IS_DEV } from '@/utils/environment';
// import { logSecurityEvent } from '../security'; // This import is causing an error
import { TURNSTILE_SITE_KEY, isTurnstileDisabled, generateBypassToken } from '../turnstile';

// ============================================================
// CONFIGURATION
// ============================================================

// Prefer Vite environment variables
export const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof window !== 'undefined' && (window as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://gnwdahoiauduyncppbdb.supabase.co';

export const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof window !== 'undefined' && (window as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

// Get Turnstile site key from environment
export const turnstileSiteKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TURNSTILE_SITE_KEY) ||
  (typeof window !== 'undefined' && (window as any).env?.VITE_TURNSTILE_SITE_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_TURNSTILE_SITE_KEY);

// Standard client options for browser environments
const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, clientOptions);

// Diagnostic function to log environment variables
export function logSupabaseCredentials() {
  console.log('Supabase URL being used:', supabaseUrl);
  
  // Mask the key for security (show first 8 chars and last 8 chars)
  const maskedKey = supabaseAnonKey.substring(0, 8) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 8);
  console.log('Supabase Anon Key being used:', maskedKey);
  
  // Check which environment variables are available
  console.log('Available environment variables:');
  
  if (typeof window !== 'undefined' && (window as any).env) {
    console.log('Window env:', {
      NEXT_PUBLIC_SUPABASE_URL: (window as any).env?.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: (window as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    });
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    console.log('Import.meta env:', {
      VITE_SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      VITE_SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    });
  }
  
  if (typeof process !== 'undefined' && process.env) {
    console.log('Process env:', {
      VITE_SUPABASE_URL: process.env?.VITE_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env?.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      SUPABASE_URL: process.env?.SUPABASE_URL ? 'Set' : 'Not set',
      VITE_SUPABASE_ANON_KEY: process.env?.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      SUPABASE_ANON_KEY: process.env?.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      VITE_ANON_KEY: process.env?.VITE_ANON_KEY ? 'Set' : 'Not set'
    });
  }
  
  // Check for captcha variables
  console.log('Captcha bypass variables:');
  const captchaVars = [
    'SKIP_AUTH_CAPTCHA',
    'VITE_SKIP_AUTH_CAPTCHA',
    'NEXT_PUBLIC_SKIP_AUTH_CAPTCHA',
    'SUPABASE_AUTH_CAPTCHA_DISABLE',
    'VITE_SUPABASE_AUTH_CAPTCHA_DISABLE',
    'NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE'
  ];
  
  captchaVars.forEach(varName => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      console.log(`${varName} (import.meta): ${import.meta.env?.[varName] ? 'Set' : 'Not set'}`);
    }
    if (typeof process !== 'undefined' && process.env) {
      console.log(`${varName} (process): ${process.env?.[varName] ? 'Set' : 'Not set'}`);
    }
  });
}

// Call the diagnostic function if in development mode
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  logSupabaseCredentials();
}

// ============================================================
// CLIENT INITIALIZATION
// ============================================================

// Client configuration
const clientOptions = {
    auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};

// Create Supabase client with error handling
let supabaseClient: SupabaseClient<Database>;

try {
  supabaseClient = createClient<Database>(
    supabaseUrl, 
    supabaseAnonKey, 
    clientOptions
  );
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Fallback to null client - the app will handle this gracefully
  supabaseClient = null as any;
}

// Export the client instance
export const supabase = supabaseClient;

// Now that the client is initialized and exported, we can verify the connection
// This function will be executed only after the module is fully loaded
if (supabaseClient && typeof window !== 'undefined') {
  // Only run connection check in browser environment, not during SSR
  // Use a longer timeout and only in non-production environments for development diagnostics
  const isDev = 
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  
  if (isDev) {
    // In development, perform a more thorough check but after a slight delay
    setTimeout(() => {
      checkSupabaseConnection()
        .then(isConnected => {
          if (isConnected) {
            console.log('✅ Supabase connection is active');
          } else {
            console.warn('⚠️ Supabase connection check did not pass, but app will continue');
          }
        })
        .catch(err => {
          console.warn('Supabase connectivity check failed:', err);
        });
    }, 500); // Longer timeout to ensure module is fully loaded
  } else {
    // In production, just log a connection attempt error if it happens
    // but don't actively try to verify the connection
    console.log('Supabase client initialized for production');
  }
}

// ============================================================
// CONNECTION VERIFICATION
// ============================================================

/**
 * Checks if the Supabase connection is active
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try to check a table that actually exists in the database
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // If there's an error with profiles table, try another approach
      if (error) {
      console.warn('Could not access profiles table:', error.message);
      
      // Try to check auth session as a fallback
      try {
        const { data } = await supabase.auth.getSession();
        // If we can call the auth API without network errors, connection works
        return true;
      } catch (authError) {
        console.error('Auth session check failed:', authError);
        return false;
      }
    }
    
    // If we got here, the connection is working
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

// ============================================================
// AUTHENTICATION METHODS
// ============================================================

/**
 * Gets a Turnstile token for authentication
 * - In development mode with SKIP_AUTH_CAPTCHA=true, returns a bypass token
 * - In production, renders the Turnstile widget and returns the token
 */
export async function getTurnstileToken(): Promise<string> {
  console.log('Getting Turnstile token...');
  
  // In development mode or when explicitly disabled, use bypass token
  if (IS_DEV || isTurnstileDisabled()) {
    console.log('Using Turnstile bypass token in development mode');
    return generateBypassToken();
  }
  
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    console.log('Not in browser environment, using bypass token');
    return generateBypassToken();
  }
  
  // Check if Turnstile widget container exists
  const turnstileContainer = document.getElementById('turnstile-container');
  if (!turnstileContainer) {
    console.warn('Turnstile container not found in the document');
    // Always return bypass token if container missing
    return generateBypassToken();
  }
  
  // Check if Turnstile script is loaded or loading it for the first time
  if (typeof window.turnstile === 'undefined') {
    console.warn('Turnstile script not loaded, attempting to load it dynamically');
    
    try {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
      
      // Wait for script to load with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Turnstile script loading timeout'));
        }, 5000);
        
        script.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load Turnstile script'));
        };
      });
    } catch (error) {
      console.error('Failed to load Turnstile script:', error);
      // Return bypass token if script fails to load
      return generateBypassToken();
    }
  }
  
  // If Turnstile is still not defined after loading attempt, return bypass token
  if (typeof window.turnstile === 'undefined') {
    console.warn('Turnstile still not available after loading attempt');
    return generateBypassToken();
  }
  
  // Render the widget and get the token
  try {
    return await renderTurnstileWidget(turnstileContainer);
    } catch (error) {
    console.error('Failed to render Turnstile widget:', error);
    // Return bypass token if rendering fails
    return generateBypassToken();
  }
}

// Helper function to render the Turnstile widget and get a token
function renderTurnstileWidget(container: HTMLElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Safety check
      if (typeof window.turnstile === 'undefined') {
        return reject(new Error('Turnstile not available'));
      }
      
      // Clear any existing content in the container
      container.innerHTML = '';
      
      // Get the site key from environment or use test key
      const siteKey = TURNSTILE_SITE_KEY || '0x4AAAAAAAK5LpjT0Jzv4jzl'; // Fallback to test key
      
      console.log(`Rendering Turnstile widget with site key: ${siteKey}`);
      
      // Max wait time for token
      const tokenTimeout = setTimeout(() => {
        if (widgetId) {
          try {
            window.turnstile.remove(widgetId);
          } catch (e) {
            console.error('Failed to remove widget after timeout:', e);
          }
        }
        reject(new Error('Turnstile token timeout after 30 seconds'));
      }, 30000);
      
      // Render Turnstile widget
      const widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token: string) => {
          clearTimeout(tokenTimeout);
          console.log('Turnstile verification successful');
          resolve(token);
        },
        'error-callback': () => {
          clearTimeout(tokenTimeout);
          reject(new Error('Turnstile verification failed'));
        },
        'expired-callback': () => {
          clearTimeout(tokenTimeout);
          reject(new Error('Turnstile token expired'));
        },
        'timeout-callback': () => {
          clearTimeout(tokenTimeout);
          reject(new Error('Turnstile verification timed out'));
        },
        theme: 'auto',
        execution: 'execute'
      });
      
      if (!widgetId) {
        clearTimeout(tokenTimeout);
        reject(new Error('Failed to render Turnstile widget'));
        return;
      }
      
      // Execute the widget (required for 'execute' mode)
      setTimeout(() => {
        if (typeof window.turnstile !== 'undefined' && widgetId) {
          try {
            window.turnstile.execute(widgetId);
          } catch (e) {
            console.error('Failed to execute Turnstile widget:', e);
            clearTimeout(tokenTimeout);
            reject(new Error('Failed to execute Turnstile widget'));
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      reject(error);
    }
  });
}

// Function to log security events, placeholder until we create the security module
async function logSecurityEvent(event: { 
  event_type: string; 
  user_id?: string; 
  details?: Record<string, any> | string;
  email?: string;
}) {
  try {
    console.log(`Security event: ${event.event_type}`, event);
    
    // In development, just log to console and don't try to write to DB
    if (IS_DEV) {
      return;
    }
    
    // In production, try to log to security_logs table
    try {
      const { error } = await supabase
        .from('security_logs')
        .insert({
          user_id: event.user_id || null,
          event_type: event.event_type,
          details: typeof event.details === 'string' ? event.details : JSON.stringify(event.details || {}),
          email: event.email || null,
          created_at: new Date().toISOString(),
        });
        
      if (error) {
        // If table doesn't exist, just log to console
        if (error.code === '42P01') { // Table doesn't exist
          console.warn('security_logs table does not exist, skipping DB logging');
          return;
        }
        
        console.error('Failed to log security event to DB:', error);
      }
    } catch (dbError) {
      console.error('Exception logging security event to DB:', dbError);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Enhanced authentication service with robust error handling
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      // Normalize email
      email = email.trim().toLowerCase();
      
      console.log(`Signing in user with email: ${email}`);
      
      // Get Turnstile token
      let captchaToken = null;
      try {
        if (!IS_DEV && !isTurnstileDisabled()) {
          captchaToken = await getTurnstileToken();
          console.log('Got Turnstile token for login');
        } else {
          console.log('Turnstile is bypassed in development mode');
          captchaToken = generateBypassToken();
        }
      } catch (error) {
        console.error('Failed to get Turnstile token:', error);
        // In development, use bypass token
        if (IS_DEV) {
          console.log('Development mode: using bypass token for login');
          captchaToken = generateBypassToken();
        } else {
          // In production, return an error if we can't get a real token
          return { error: new Error('Captcha verification failed. Please try again.') };
        }
      }
      
      // Sign in with Supabase
      let signInOptions: any = {};
      
      // Always include captcha token (regular token or bypass token)
      signInOptions.captchaToken = captchaToken;
      
      // Log which sign-in approach we're using
      if (captchaToken === generateBypassToken()) {
        console.log('Using bypass token for login');
      } else {
        console.log('Using real Turnstile token for login');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }, signInOptions);
      
      if (error) {
        // If login fails with captcha error but we're in dev mode, 
        // try one more approach without sending any captcha token
        if (IS_DEV && (error.message.includes('captcha') || error.message.includes('429') || error.message.includes('rate limit'))) {
          console.log('Login failed with captcha/rate limit error, trying without captcha token...');
          
          try {
            // Try direct login without any captcha token at all
            const { data: directData, error: directError } = await supabase.auth.signInWithPassword({
              email,
              password,
              // No options parameter at all
            });
            
            if (directError) {
              console.error('Direct login without captcha failed:', directError);
              return { error: directError };
            }
            
            return { data: directData };
          } catch (directError) {
            console.error('Direct login without captcha failed with exception:', directError);
            return { error: directError };
          }
        }
        
        console.error('Supabase sign-in error:', error);
        
        // Try to log the failure but don't fail if logging fails
        try {
          await logSecurityEvent({
            event_type: 'login_failed',
            details: `Login failed: ${error.message}`,
            email: email,
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        
        return { error };
      }
      
      // Log security event (but don't fail if it errors)
      try {
        await logSecurityEvent({
          event_type: 'user_login',
          user_id: data.user?.id,
          details: {
            email,
            provider: 'email',
          },
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      return { data };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error };
    }
  },
  
  /**
   * Sign out the current user
   */
  async signOut() {
    try {
    const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error during sign out:', error);
      return { 
        error: { 
          message: 'Failed to sign out properly',
          status: 500
        }
      };
    }
  },
  
  /**
   * Get the current user
   */
  async getUser() {
    try {
    const { data, error } = await supabase.auth.getUser();
      return { user: data?.user || null, error };
    } catch (error) {
      console.error('Error getting user:', error);
      return { 
        user: null, 
        error: {
          message: 'Failed to get user information',
          status: 500
        }
      };
    }
  },
  
  /**
   * Get the current session
   */
  async getSession() {
    try {
    const { data, error } = await supabase.auth.getSession();
      return { session: data?.session || null, error };
    } catch (error) {
      console.error('Error getting session:', error);
      return { 
        session: null, 
        error: {
          message: 'Failed to get session information',
          status: 500
        }
      };
    }
  },
  
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    try {
      // Normalize email
      email = email.trim().toLowerCase();
      
      console.log(`Signing up user with email: ${email}`);
      
      // Get Turnstile token
      let captchaToken = null;
      try {
        if (!IS_DEV && !isTurnstileDisabled()) {
          captchaToken = await getTurnstileToken();
          console.log('Got Turnstile token for signup');
        } else {
          console.log('Turnstile is bypassed in development mode');
          captchaToken = generateBypassToken();
        }
      } catch (error) {
        console.error('Failed to get Turnstile token:', error);
        // In development, use bypass token
        if (IS_DEV) {
          console.log('Development mode: using bypass token');
          captchaToken = generateBypassToken();
        } else {
          // In production, return an error if we can't get a real token
          return { error: new Error('Captcha verification failed. Please try again.') };
        }
      }
      
      // Options for signup
      const options: any = {
        data: metadata || {}
      };
      
      // Always include captcha token (regular token or bypass token)
      options.captchaToken = captchaToken;
      
      // Log which signup approach we're using
      if (captchaToken === generateBypassToken()) {
        console.log('Using bypass token for signup');
      } else {
        console.log('Using real Turnstile token for signup');
      }
      
      // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) {
        // If signup fails with captcha error but we're in dev mode, 
        // try one more approach without sending any captcha token
        if (IS_DEV && (error.message.includes('captcha') || error.message.includes('429') || error.message.includes('rate limit'))) {
          console.log('Signup failed with captcha/rate limit error, trying without captcha token...');
          
          try {
            // Try direct signup without any captcha token at all
            const { data: directData, error: directError } = await supabase.auth.signUp({
      email,
      password,
      options: {
                data: metadata || {}
                // No captchaToken field at all
              }
            });
            
            if (directError) {
              console.error('Direct signup without captcha failed:', directError);
              return { error: directError };
            }
            
            return { data: directData };
          } catch (directError) {
            console.error('Direct signup without captcha failed with exception:', directError);
            return { error: directError };
          }
        }
        
        console.error('Supabase sign-up error:', error);
        
        // Try to log the failure but don't fail if logging fails
        try {
          await logSecurityEvent({
            event_type: 'signup_failed',
            details: `Signup failed: ${error.message}`,
            email: email,
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        
        return { error };
      }
      
      // Log successful signup (but don't fail if it errors)
      try {
        await logSecurityEvent({
          user_id: data?.user?.id,
          event_type: 'signup_success',
          details: 'User registered successfully',
          email: email,
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      return { data };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  },
  
  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase()
      );

      return { data, error };
    } catch (error) {
      console.error('Error sending password reset:', error);
      return { 
        data: null, 
        error: {
          message: 'Failed to send password reset email',
          status: 500
        }
      };
    }
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Creates a client specifically for browser environments
 */
export function createBrowserClient(): SupabaseClient<Database> {
  // Use standard createClient instead of any Next.js specific client
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
} 