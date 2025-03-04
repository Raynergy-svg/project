// Import the necessary Supabase client components
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables and handle potential missing values
const getRequiredEnv = (name: string) => {
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

// Create a development mock client if needed
const createMockClient = () => {
  console.log('Creating mock Supabase client for development');
  
  // This is a simple mock client for development purposes
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Mock auth error' } }),
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

// Create the Supabase client
export const supabase = (!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV
  ? createMockClient() // Use mock client in development if env vars are missing
  : (supabaseUrl && supabaseAnonKey) 
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