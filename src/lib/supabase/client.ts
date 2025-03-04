// Import the necessary Supabase client components
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables and handle potential missing values
const getRequiredEnv = (name) => {
  const value = import.meta.env[name];
  // In development, provide a more helpful error message if env vars are missing
  if (!value && import.meta.env.DEV) {
    console.warn(`Required environment variable ${name} is missing. Check your .env file.`);
  }
  return value;
};

// Export the supabase URL and key for reuse
export const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
export const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

// Create the Supabase client only if environment variables are available
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

// Helper function to check if Supabase is properly configured
export async function checkSupabaseConnection() {
  if (!supabase) {
    console.error('Supabase client not initialized due to missing environment variables');
    return false;
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return false;
  }
}