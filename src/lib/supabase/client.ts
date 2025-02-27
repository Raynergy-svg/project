import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the proxy server URL for local development
const supabaseUrl = 'http://localhost:3000/supabase';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  throw new Error('Missing Supabase credentials. Please check your environment variables: VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for the entire application
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
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
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return { success: false, error };
  }
};

// Helper function to handle auth errors
export const handleAuthError = (error: any) => {
  if (!error) return null;
  
  // Map common Supabase auth errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please check your email and confirm your account before signing in.',
    'User already registered': 'An account with this email already exists. Please sign in instead.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
    'Rate limit exceeded': 'Too many attempts. Please try again later.',
  };
  
  const errorMessage = error.message || 'An unexpected error occurred';
  return errorMap[errorMessage] || errorMessage;
};