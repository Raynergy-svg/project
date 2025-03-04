// Import directly from the primary source instead of re-exporting
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

// Get environment variables and handle potential missing values
const getRequiredEnv = (name: string): string => {
  const value = import.meta.env[name];
  // In development, provide a more helpful error message if env vars are missing
  if (!value && import.meta.env.DEV) {
    console.warn(`Required environment variable ${name} is missing. Check your .env file.`);
  }
  return value || '';
};

// Use environment variables without fallbacks for better security
export const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
export const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

// Create the Supabase client with safety check
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    )
  : null;

// For cases where we need a new instance with specific options
export const createBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Cannot create Supabase browser client: missing environment variables');
    return null;
  }
  
  const options = { 
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      ...(import.meta.env.DEV && { debug: true })
    }
  };
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
};