import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Log the Supabase URL for debugging
console.log('Connecting to Supabase at:', supabaseUrl);

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: true, // Enable debug mode for auth
    },
    global: {
      headers: {
        'x-application-name': 'smart-debt-flow',
      },
    },
  }
);

// Helper function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return false;
  }
};