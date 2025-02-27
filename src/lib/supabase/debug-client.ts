import { createClient } from '@supabase/supabase-js';

// Log the environment variables
console.log('Connecting to Supabase at:', import.meta.env.VITE_SUPABASE_URL);
console.log('Using anon key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Key is defined' : 'Key is undefined');

// Create a debug version of the Supabase client
export const debugSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Add debug logging for auth operations
const originalSignUp = debugSupabase.auth.signUp;
debugSupabase.auth.signUp = async (params) => {
  console.log('Attempting to sign up with params:', JSON.stringify({
    email: params.email,
    options: params.options,
    // Don't log the password for security reasons
  }));
  
  try {
    const result = await originalSignUp.call(debugSupabase.auth, params);
    console.log('Sign up result:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Test function to verify connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await debugSupabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('Supabase connection test succeeded:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return { success: false, error };
  }
}; 