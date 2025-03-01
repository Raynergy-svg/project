import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Environment variables loading check:');
console.log('VITE_SUPABASE_URL exists:', import.meta.env.VITE_SUPABASE_URL !== undefined);
console.log('VITE_SUPABASE_ANON_KEY exists:', import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined);

// Use environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

// Log actual values being used
console.log('Supabase initialization values:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 15) + '...');

// Log connection details in development mode
if (import.meta.env.DEV) {
  console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
  console.log(`Using Anon Key: ${supabaseAnonKey.substring(0, 15)}...`);
}

// Create a single instance to reuse - but keep exports at top level
let supabaseInstance;
try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    }
  });
  
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw error;
}

// Export at the top level
export const supabase = supabaseInstance;

// For cases where we need a new instance
export const createBrowserClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    });
  } catch (error) {
    console.error('Error creating browser client:', error);
    throw error;
  }
}; 