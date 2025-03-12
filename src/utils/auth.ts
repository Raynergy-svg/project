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

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Get the user from the client side
 */
export async function getCurrentUser() {
  const supabase = createClientComponentClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the session from the client side
 */
export async function getSession() {
  const supabase = createClientComponentClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
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
  const supabase = createClientComponentClient();
  try {
    await supabase.auth.signOut();
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

/**
 * Create a browser client for client-side operations
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
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.signUp({
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
 * Reset password for a user
 */
export async function resetPassword(email: string) {
  try {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { data: null, error };
  }
}

/**
 * Update the user's password
 */
export async function updatePassword(password: string) {
  try {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { data: null, error };
  }
} 