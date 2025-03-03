// Import directly from the primary source instead of re-exporting
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

// Use environment variables with proper fallbacks for development
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

// Create the Supabase client with standard configuration
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

// For cases where we need a new instance with specific options
export const createBrowserClient = () => {
  const options = { 
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      ...(import.meta.env.DEV && { debug: true })
    }
  };
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
};