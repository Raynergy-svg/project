import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Get Supabase URL and key directly from environment with explicit checks
const getSupabaseUrl = () => {
  // Check for Next.js specific env vars first
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
  
  // Fall back to Vite env vars
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  
  // Hard-coded fallback
  return 'https://gnwdahoiauduyncppbdb.supabase.co';
};

const getSupabaseAnonKey = () => {
  // Check for Next.js specific env vars first
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  
  // Fall back to Vite env vars
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  
  // Hard-coded fallback (not ideal but necessary for migration)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';
};

// Standard Supabase client (works in both client and server)
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());

// Create a browser-specific client (for client-side only)
export const createBrowserSupabaseClient = () => {
  // Make sure we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Cannot create browser client in a non-browser environment');
  }
  
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
};

// Helper to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Gets the current session
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Gets the current user
 */
export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Signs in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

/**
 * Signs up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, options = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

/**
 * Signs out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}; 