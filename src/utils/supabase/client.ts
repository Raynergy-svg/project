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
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://gnwdahoiauduyncppbdb.supabase.co';

export const supabaseAnonKey = 
  (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

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
  
  // Verify connection on init but don't block
  checkSupabaseConnection().catch(err => 
    console.warn('Supabase connectivity check failed:', err)
  );
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Fallback to null client - the app will handle this gracefully
  supabaseClient = null as any;
}

// Export the client instance
export const supabase = supabaseClient;

// ============================================================
// CONNECTION VERIFICATION
// ============================================================

/**
 * Checks if the Supabase connection is active
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    // Some instances don't have this table, so let's try another approach if that fails
    if (error && error.code === '42P01') {
      // Try to get session as another way to test connection
      const { data } = await supabase.auth.getSession();
      // If we can call the API without network errors, connection works
      return true;
    }
    
    return !error;
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
      // Validate inputs
      if (!email || !password) {
        return {
          data: null,
          error: {
            message: 'Email and password are required',
            status: 400
          }
        };
      }

      // Standardize email format
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Attempt authentication directly with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        console.error('Authentication error:', error);
        
        // Format user-friendly error messages
        const errorMessage = error.message === 'Invalid login credentials'
          ? 'The email or password you entered is incorrect. Please try again.'
          : error.message || 'Authentication failed';
          
        return { 
          data: null, 
          error: { 
            message: errorMessage, 
            status: error.status || 401,
            code: error.code
          } 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected authentication error:', error);
      
      return {
        data: null,
        error: {
          message: 'We encountered an unexpected error while signing you in. Please try again later.',
          status: 500
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata || {},
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { 
        data: null, 
        error: {
          message: 'Failed to create your account',
          status: 500
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