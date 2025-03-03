import { createClient } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';

// Use environment variables with proper fallbacks for development
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

// Ensure environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Log connection details in development mode only
if (import.meta.env.DEV) {
  console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
  console.log(`Using Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);
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

// Helper for better error messages in dev mode
function createDevModeClient(client: ReturnType<typeof createClient<Database>>) {
  // Only apply the wrapper in development mode
  if (!import.meta.env.DEV) {
    return client;
  }

  // Create proxy to intercept methods and add error handling
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      
      // Only intercept functions
      if (typeof value !== 'function') {
        return value;
      }
      
      // Wrap method calls to add error handling
      return function(...args: any[]) {
        try {
          const result = value.apply(target, args);
          
          // If it's a promise, add error handling
          if (result instanceof Promise) {
            return result.catch((error) => {
              console.error(`Supabase error in method ${String(prop)}:`, error);
              
              // Common errors checking
              if (error.code === 'PGRST116') {
                console.warn('Table or view might not exist. Check your migrations and database setup.');
              }
              
              if (error.code === '42501') {
                console.warn('Permission denied. Check your RLS policies.');
              }
              
              throw error;
            });
          }
          
          return result;
        } catch (error) {
          console.error(`Error calling Supabase method ${String(prop)}:`, error);
          throw error;
        }
      };
    },
  });
}

// Create a single instance to reuse with standard configuration
const baseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, defaultOptions);
// Wrap with dev mode handler for missing tables
export const supabase = createDevModeClient(baseClient);

// For cases where we need a new instance with specific options
export const createBrowserClient = () => {
  // In development mode, configure the client to bypass captcha verification
  const options = { 
    ...defaultOptions,
    ...(import.meta.env.DEV && { 
      auth: {
        ...defaultOptions.auth,
        autoRefreshToken: true,
        // Development-specific settings to make auth easier in dev mode
        debug: true 
      }
    })
  };
  
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, options);
  return createDevModeClient(client);
}; 