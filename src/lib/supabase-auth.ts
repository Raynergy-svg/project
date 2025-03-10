import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Configuration for Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a browser client (client-side only)
export const createBrowserSupabaseClient = () => 
  createBrowserClient(supabaseUrl, supabaseAnonKey);

// Create standard supabase client (used in both server and client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Gets the current session, handling both client and server environments
 */
export const getCurrentSession = async () => {
  if (isBrowser()) {
    const client = createBrowserSupabaseClient();
    const { data: { session } } = await client.auth.getSession();
    return session;
  }
  
  // In server environment, we'd use createServerClient here
  return null;
};

/**
 * Gets the current user, handling both client and server environments
 */
export const getCurrentUser = async () => {
  if (isBrowser()) {
    const client = createBrowserSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    return user;
  }
  
  // In server environment, we'd use createServerClient here
  return null;
};

/**
 * Signs in a user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

/**
 * Signs up a user with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

/**
 * Signs out the current user
 */
export const signOut = async () => {
  const client = createBrowserSupabaseClient();
  const { error } = await client.auth.signOut();
  
  if (error) throw error;
};

// This will be expanded as we migrate more functionality 