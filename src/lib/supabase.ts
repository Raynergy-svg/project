import { createClient } from '@supabase/supabase-js';

// Debug logging to track Supabase initialization
console.log('Initializing Supabase client in lib/supabase.ts');

// Try to get URL and key from different sources
let supabaseUrl = '';
let supabaseKey = '';

// Check window.ENV first (from worker)
if (typeof window !== 'undefined' && window.ENV) {
  console.log('Found window.ENV object');
  supabaseUrl = window.ENV.SUPABASE_URL || '';
  supabaseKey = window.ENV.SUPABASE_ANON_KEY || '';
  console.log('From window.ENV - URL exists:', !!supabaseUrl, 'Key exists:', !!supabaseKey);
}

// If not found in window.ENV, try import.meta.env
if (!supabaseUrl || !supabaseKey) {
  console.log('Checking import.meta.env for Supabase credentials');
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  console.log('From import.meta.env - URL exists:', !!supabaseUrl, 'Key exists:', !!supabaseKey);
}

// Last resort fallback - NOTE: These should be replaced with your actual values if needed
if (!supabaseUrl || !supabaseKey) {
  console.log('Using fallback values for Supabase');
  supabaseUrl = 'https://gnwdahoiauduyncppbdb.supabase.co';
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';
}

// Log final values being used
console.log('Final Supabase values:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'missing');

// Create the client outside of try/catch but initialize it inside
let supabaseClient: any;

try {
  if (!supabaseUrl) {
    throw new Error('supabaseUrl is required but was not found in any source');
  }
  if (!supabaseKey) {
    throw new Error('supabaseKey is required but was not found in any source');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('Supabase client initialized successfully in lib/supabase.ts');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a placeholder that will throw a better error when used
  supabaseClient = {
    auth: {
      signIn: () => { throw new Error('Supabase client not properly initialized'); },
      signUp: () => { throw new Error('Supabase client not properly initialized'); }
    },
    from: () => { throw new Error('Supabase client not properly initialized'); }
  } as any;
}

// Export at top level (outside of try/catch block)
export const supabase = supabaseClient;