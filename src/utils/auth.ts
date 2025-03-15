/**
 * Auth utility functions for authentication with Supabase
 * This is the main auth utility file that consolidates functionality
 * from various auth implementations across the project.
 * 
 * IMPORTANT: This file contains only client-safe code that can be used
 * in both client and server contexts.
 */

import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase as supabaseClient, supabaseUrl, supabaseAnonKey } from './supabase/client';

// Helper to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Cache for the client to avoid creating multiple instances
let cachedClient: any = null;

/**
 * Get the singleton Supabase client
 * This ensures only one instance is created in the browser
 */
function getClient() {
  try {
    // Always use the main client from the client.ts file if available
    if (isBrowser() && supabaseClient) {
      return supabaseClient;
    }
    
    // Otherwise, create a client with the right method for the current environment
    if (isBrowser()) {
      if (!cachedClient) {
        // In browser environments, create with createBrowserClient
        try {
          cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
        } catch (error) {
          console.error('Error creating browser client:', error);
          // Fallback to browser client if needed
          cachedClient = createClient(supabaseUrl, supabaseAnonKey);
        }
      }
      return cachedClient;
    }
    
    // For server environments (this should be rare in this client-side file)
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to get Supabase client:', error);
    // Return a minimal client that won't throw errors when methods are called
    return createClient(supabaseUrl || '', supabaseAnonKey || '');
  }
}

/**
 * Get the user from the client side
 */
export async function getCurrentUser() {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return null;
    }
    
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return data?.user || null;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return null;
    }
    
    const { data, error } = await client.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return data?.session || null;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
}

/**
 * Sign out the user
 */
export async function signOut() {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return { error: new Error('Authentication service unavailable') };
    }
    
    const { error } = await client.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Unexpected error signing out:', error);
    return { error };
  }
}

/**
 * Create a Supabase browser client
 * This is a legacy function and should be avoided in favor of getClient()
 */
export function createSupabaseBrowserClient() {
  if (!isBrowser()) {
    return null; // Don't create a browser client on the server
  }
  
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating browser client:', error);
    return null;
  }
}

/**
 * Sign in a user with email and password
 */
export async function signInWithEmail(email: string, password: string, options?: any) {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return { data: null, error: new Error('Authentication service unavailable') };
    }
    
    // Validate inputs
    if (!email || !password) {
      return { 
        data: null, 
        error: new Error('Email and password are required') 
      };
    }
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
      ...options
    });
    
    if (error) {
      console.error('Error signing in with email:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error signing in with email:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred during sign in') 
    };
  }
}

/**
 * Sign up a user with email and password
 */
export async function signUpWithEmail(email: string, password: string, options?: any) {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return { data: null, error: new Error('Authentication service unavailable') };
    }
    
    // Validate inputs
    if (!email || !password) {
      return { 
        data: null, 
        error: new Error('Email and password are required') 
      };
    }
    
    const { data, error } = await client.auth.signUp({
      email,
      password,
      ...options
    });
    
    if (error) {
      console.error('Error signing up with email:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error signing up with email:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred during sign up') 
    };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return { data: null, error: new Error('Authentication service unavailable') };
    }
    
    // Validate input
    if (!email) {
      return { 
        data: null, 
        error: new Error('Email is required') 
      };
    }
    
    const { data, error } = await client.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error resetting password:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred during password reset') 
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(password: string) {
  try {
    const client = getClient();
    if (!client || !client.auth) {
      console.error('Supabase client or auth is not available');
      return { data: null, error: new Error('Authentication service unavailable') };
    }
    
    // Validate input
    if (!password) {
      return { 
        data: null, 
        error: new Error('Password is required') 
      };
    }
    
    const { data, error } = await client.auth.updateUser({
      password
    });
    
    if (error) {
      console.error('Error updating password:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating password:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred during password update') 
    };
  }
} 