import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';

// Use environment variables with proper fallbacks for development
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.wLiLa-B6gYS9VX7-7-K1i_4d2qX52UDmIUVniBpQZK4';

// Ensure environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
  // Don't throw in production, use fallbacks instead
  if (import.meta.env.DEV) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
}

// Log connection details in both development and production
console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
console.log(`Using Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);

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

// Force mock supabase if environment variable is set
const FORCE_MOCK_SUPABASE = import.meta.env.VITE_MOCK_SUPABASE === 'true';

// Create the base Supabase client
const baseSupabaseClient = FORCE_MOCK_SUPABASE
  ? createMockClient()
  : createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );

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

// Export the final supabase client with dev mode enhancements if needed
export const supabase = import.meta.env.DEV 
  ? createDevModeClient(baseSupabaseClient)
  : baseSupabaseClient;

// Export createBrowserClient for compatibility
export function createBrowserClient(): SupabaseClient<Database> {
  return supabase;
}

// Helper function to check if Supabase is properly configured
export async function checkSupabaseConnection() {
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