import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a browser client for client-side operations
export const createSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    return null; // Don't create a browser client on the server
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Function to get the user from an existing auth context or create a new connection
export const getUserFromSupabase = async (existingClient?: any) => {
  try {
    const client = existingClient || createSupabaseBrowserClient() || createClient(supabaseUrl, supabaseAnonKey);
    
    if (!client) {
      console.error('No Supabase client available');
      return null;
    }
    
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return data.user;
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return null;
  }
};

// Function to sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const client = createSupabaseBrowserClient() || createClient(supabaseUrl, supabaseAnonKey);
    
    if (!client) {
      throw new Error('No Supabase client available');
    }
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Function to sign out
export const signOut = async () => {
  try {
    const client = createSupabaseBrowserClient() || createClient(supabaseUrl, supabaseAnonKey);
    
    if (!client) {
      throw new Error('No Supabase client available');
    }
    
    const { error } = await client.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// This adapter helps bridge the gap between your existing auth system
// and Next.js while you migrate 