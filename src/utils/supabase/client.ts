import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Use environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

// Log connection details in development mode
if (import.meta.env.DEV) {
  console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
  console.log(`Using Anon Key: ${supabaseAnonKey.substring(0, 15)}...`);
}

const defaultOptions = {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'smart-debt-flow',
    },
  }
};

// Create a single instance to reuse with standard configuration
// We're using default fetch to avoid CORS and certificate issues
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, defaultOptions);

// For cases where we need a new instance
export const createBrowserClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, defaultOptions);
};

// Also export URL and key for convenience
export { supabaseUrl, supabaseAnonKey }; 