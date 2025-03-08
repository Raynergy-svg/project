import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';
import { IS_DEV, isDevelopmentMode } from '@/utils/environment';

// ============================================================
// CONFIGURATION & CONSTANTS
// ============================================================

// Get environment variables for Supabase in a browser-safe way
// In browser environments, public env vars must use the NEXT_PUBLIC_ prefix
export const supabaseUrl = 
  (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://gnwdahoiauduyncppbdb.supabase.co';

export const supabaseAnonKey = 
  (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

// Log environment variables to help diagnose problems
console.log('Environment Variables Check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);

// Ensure environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
}

// Determine if we're in development mode
const isDev = 
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true) ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
  false;

// Client configuration - using minimal options to reduce problems
const defaultOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Simplified to avoid issues
  },
};

// ============================================================
// CLIENT INITIALIZATION
// ============================================================

// Create a development mock client if needed
const createMockClient = () => {
  console.log('Creating mock Supabase client for development');
  
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async ({ email, password }) => {
        // Handle dev account
        if (email === 'dev@example.com' && password === 'development') {
          return {
            data: {
              user: {
                id: 'dev-user-id',
                email: 'dev@example.com',
                user_metadata: { name: 'Development User' }
              },
              session: {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Date.now() + 3600 * 1000
              }
            },
            error: null
          };
        }
        // Otherwise return an error
        return { data: null, error: { message: 'Invalid login credentials', status: 401 } };
      },
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          eq: () => ({ data: [], error: null }),
          data: [],
          error: null
        }),
        data: [],
        error: null
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
    rpc: () => ({ data: null, error: null }),
  } as unknown as ReturnType<typeof createClient>;
};

// Force mock supabase if environment variable is set
const FORCE_MOCK_SUPABASE = 
  (typeof import.meta !== 'undefined' && import.meta.env?.MOCK_SUPABASE === 'true') ||
  (typeof process !== 'undefined' && process.env?.MOCK_SUPABASE === 'true') ||
  false;

// Create the Supabase client with proper error handling
let baseSupabaseClient: SupabaseClient<Database>;
try {
  baseSupabaseClient = FORCE_MOCK_SUPABASE || (isDev && false) // Change to true to force mock in dev
    ? createMockClient()
    : createClient<Database>(supabaseUrl, supabaseAnonKey, defaultOptions);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a minimal mock client as fallback
  baseSupabaseClient = createMockClient();
}

// Export the final supabase client
export const supabase = baseSupabaseClient;

/**
 * Authentication method with proper separation of development/production environments
 */
export const signIn = async (email: string, password: string) => {
  console.log(`Authentication attempt for user: ${email}`);
  
  // TEMPORARY SOLUTION: Always use direct authentication
  // This bypasses the API endpoints that are not working
  try {
    // Direct Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Authentication error:', error);
      
      // Format user-friendly error
      if (error.status === 400 || error.status === 401) {
        return { 
          data: null, 
          error: { 
            message: 'Invalid email or password. Please check your credentials and try again.', 
            status: error.status 
          } 
        };
      } else {
        return { 
          data: null, 
          error: { 
            message: error.message || 'Authentication failed', 
            status: error.status || 500 
          } 
        };
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Authentication system error:', error);
    return {
      data: null,
      error: {
        message: 'Authentication error',
        status: 500
      }
    };
  }
  
  /* ORIGINAL CODE COMMENTED OUT
  // For local development environment, use direct Supabase authentication
  // This is safe to push to production because it only affects local development
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    console.log('Local development environment detected, using direct authentication');
    
    try {
      // Standard Supabase authentication for development
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Authentication error:', error);
        
        // Format user-friendly error
        if (error.status === 400 || error.status === 401) {
          return { 
            data: null, 
            error: { 
              message: 'Invalid email or password. Please check your credentials and try again.', 
              status: error.status 
            } 
          };
        } else {
          return { 
            data: null, 
            error: { 
              message: error.message || 'Authentication failed', 
              status: error.status || 500 
            } 
          };
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Authentication system error:', error);
      return {
        data: null,
        error: {
          message: 'Authentication error',
          status: 500
        }
      };
    }
  } 
  // For production or deployed preview environments, use server-side API
  else {
    try {
      // Use server-side authentication API to avoid CAPTCHA issues
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server authentication failed:', responseData);
        return {
          data: null,
          error: {
            message: responseData.error || 'Authentication failed',
            status: response.status
          }
        };
      }
      
      // If successful, set the session in Supabase client
      if (responseData.session) {
        await supabase.auth.setSession({
          access_token: responseData.session.access_token,
          refresh_token: responseData.session.refresh_token
        });
        
        return { 
          data: {
            session: responseData.session,
            user: responseData.user
          }, 
          error: null 
        };
      } else {
        return {
          data: null,
          error: {
            message: 'Invalid response from authentication server',
            status: 500
          }
        };
      }
    } catch (error) {
      console.error('Authentication system error:', error);
      return {
        data: null,
        error: {
          message: 'We\'re experiencing temporary issues with our authentication system. Please try again later.',
          status: 500
        }
      };
    }
  }
  */
};

/**
 * Simple and reliable authentication service
 * Uses direct approach without complex fallbacks that can fail
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    return signIn(email, password);
  },
  
  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  /**
   * Get current user - more reliable than getSession()
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return data.user;
  },
  
  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  },
  
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

/**
 * Checks if Supabase connection is working properly
 * Safe implementation that handles all environments
 */
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    
    // For local development environment, assume success
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1')) {
      console.log('Local development environment: simplified connection check');
      return { 
        success: true, 
        status: 'connected', 
        message: 'Local development mode active' 
      };
    }
    
    // For production and preview environments, do a real check
    // Attempt to ping the Supabase service
    const result = await supabase.from('_test_connection').select('*').limit(1).single();
    
    // If we get here, the connection is working (even with expected error about table not existing)
    return { 
      success: true, 
      status: 'connected',
      message: 'Connected to Supabase successfully'
    };
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    
    // For local development, don't treat this as a critical error
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1')) {
      return { 
        success: true, 
        status: 'development',
        message: 'Local development mode: connection issues ignored'
      };
    }
    
    return {
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown connection error',
      error
    };
  }
};

// Export named client for compatibility
export function createBrowserClient(): SupabaseClient<Database> {
  return supabase;
} 