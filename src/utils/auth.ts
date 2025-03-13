/**
 * Auth utility functions for authentication with Supabase
 * This is the main auth utility file that consolidates functionality
 * from various auth implementations across the project.
 * 
 * IMPORTANT: This file contains only client-safe code that can be used
 * in both client and server contexts.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createBrowserClient } from '@supabase/ssr';
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
  // Always use the main client from the client.ts file if available
  if (isBrowser() && supabaseClient) {
    return supabaseClient;
  }
  
  // Otherwise, create a client with the right method for the current environment
  if (isBrowser()) {
    if (!cachedClient) {
      // In browser environments, create with createClientComponentClient
      try {
        cachedClient = createClientComponentClient();
      } catch (error) {
        console.error('Error creating client component client:', error);
        // Fallback to browser client if needed
        cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
      }
    }
    return cachedClient;
  }
  
  // For server environments (this should be rare in this client-side file)
  return createClientComponentClient();
}

/**
 * Get the user from the client side
 */
export async function getCurrentUser() {
  const client = getClient();
  try {
    const { data: { user } } = await client.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  const client = getClient();
  try {
    const { data: { session } } = await client.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Sign out the user
 */
export async function signOut() {
  const client = getClient();
  try {
    await client.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
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
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Sign in a user with email and password
 */
export async function signInWithEmail(email: string, password: string, options?: any) {
  try {
    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
      ...options
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return { data: null, error };
  }
}

/**
 * Sign up a user with email and password
 */
export async function signUpWithEmail(email: string, password: string, options?: any) {
  try {
    const client = getClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      ...options
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up with email:', error);
    return { data: null, error };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const client = getClient();
    const { data, error } = await client.auth.resetPasswordForEmail(email);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { data: null, error };
  }
}

/**
 * Update user password
 */
export async function updatePassword(password: string) {
  try {
    const client = getClient();
    const { data, error } = await client.auth.updateUser({
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { data: null, error };
  }
} 