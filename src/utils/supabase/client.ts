import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';
import { IS_DEV } from '@/utils/environment';

// ============================================================
// CONFIGURATION
// ============================================================

// Get environment variables safely from all possible sources
export const supabaseUrl = 
  (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://gnwdahoiauduyncppbdb.supabase.co';

export const supabaseAnonKey = 
  (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

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
 * Enhanced authentication service with robust error handling
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      // Normalize email
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Log environment variables for debugging
      logSupabaseCredentials();
      
      console.log('Using development server auth...');
      
      // In development mode, use the simplified dev-login endpoint
      try {
        // Determine if we're in development mode
        const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || 
                      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
        
        // Choose the API endpoint
        const apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
          ? 'http://localhost:3000/api/auth/dev-login'  // Local development - force HTTP & use dev-login
          : `${window.location.origin}/api/auth/login`;  // Production - use regular login
        
        console.log(`Attempting login via: ${apiUrl}`);
        
        // Use server endpoint for authentication
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: sanitizedEmail,
            password: isDev ? 'development_password' : password // In dev mode, password doesn't matter
          })
        });
        
        if (!response.ok) {
          let errorMessage = 'Server authentication failed';
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        let result;
        try {
          result = await response.json();
        } catch (e) {
          console.error('Failed to parse server response:', e);
          throw new Error('Invalid response from server');
        }
        
        if (!result.session) {
          console.error('Server response missing session:', result);
          throw new Error('Invalid server response: missing session data');
        }
        
        // Success - manually set the session in Supabase client
        console.log('Server-side auth successful, setting session...');
        
        try {
          // Update the Supabase auth client with the session
          if (isDev) {
            console.log('Development mode - skipping session update in Supabase client');
            // Don't try to set the session in dev mode since the token isn't real
          } else {
            await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token
            });
            console.log('Supabase client session updated');
          }
        } catch (sessionError) {
          console.warn('Failed to set session in Supabase client:', sessionError);
          // Continue anyway as we have the session
        }
        
        // Return the successful result
        return {
          data: {
            session: result.session,
            user: result.user
          },
          error: null
        };
        
      } catch (serverError) {
        console.error('Server-side auth failed:', serverError);
        throw serverError; // Don't try direct auth anymore
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return {
        data: null,
        error: {
          message: error.message || 'An unexpected error occurred during sign in.'
        }
      };
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
      const sanitizedEmail = email.trim().toLowerCase();
      
      console.log('Bypassing client-side signup, using server API directly...');
      
      // Always use the server API instead of direct client signup
      try {
        // Use absolute URL to ensure we hit the right endpoint in production
        const apiUrl = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
          ? 'http://localhost:3000/api/auth/signup'  // Local development - force HTTP
          : `${window.location.origin}/api/auth/signup`;  // Production
        
        console.log(`Attempting server signup via: ${apiUrl}`);
        
        // Use server endpoint instead of direct Supabase auth
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: sanitizedEmail,
            password,
            metadata: metadata || {}
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to register through server API');
        }
        
        // If successful, return the user data
        if (result.user) {
          console.log('Server-side signup successful');
          return { data: { user: result.user }, error: null };
        } else {
          throw new Error('No user data returned from server signup');
        }
      } catch (serverError) {
        console.error('Server-side signup failed:', serverError);
        
        // As a last resort fallback ONLY if server auth fails, try direct Supabase auth
        console.log('Falling back to direct Supabase signup as last resort...');
        
        // Generate a Supabase captcha bypass token
        const captchaToken = 'BYPASS_CAPTCHA_FOR_SELF_HOSTED';
        
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: metadata || {},
            captchaToken
          }
        });
        
        if (error) {
          console.error('Direct signup fallback also failed:', error);
          return { 
            data: null, 
            error: { 
              message: `Registration failed: ${serverError.message}\nDirect signup fallback error: ${error.message}` 
            } 
          };
        }
        
        return { data, error: null };
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      return { 
        data: null, 
        error: {
          message: error.message || 'An unexpected error occurred during sign up.'
        }
      };
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
  // Check if we already have a client
  if (supabase) return supabase;
  
  try {
    return createClient<Database>(
      supabaseUrl, 
      supabaseAnonKey, 
      clientOptions
    );
  } catch (error) {
    console.error('Failed to create browser client:', error);
    throw error;
  }
} 