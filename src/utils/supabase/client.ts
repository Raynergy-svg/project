import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';

// Get environment variables for Supabase
// Note: For client-side code, environment variables must be prefixed with VITE_
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log environment variables to help diagnose problems
console.log('Environment Variables Check:');
console.log('- VITE_SUPABASE_URL present:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('- VITE_SUPABASE_ANON_KEY present:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Ensure environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
  // Don't throw in production, but log the error
  if (import.meta.env.DEV) {
    console.warn('Try adding these to your .env file:');
    console.warn('VITE_SUPABASE_URL=your_url_here');
    console.warn('VITE_SUPABASE_ANON_KEY=your_key_here');
  }
}

// Avoid logging sensitive credentials
console.log(`Initializing Supabase client${import.meta.env.DEV ? ` with URL: ${supabaseUrl}` : ''}`);

const defaultOptions = {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
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
      onAuthStateChange: (callback) => {
        // Return a subscription object with an unsubscribe method
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async ({ email, password }) => {
        // For the dev account, return a successful login
        if (email === 'dev@example.com' && password === 'development') {
          return {
            data: {
              user: {
                id: 'dev-user-id',
                email: 'dev@example.com',
                user_metadata: { name: 'Development User' }
              },
              session: {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Date.now() + 3600 * 1000
              }
            },
            error: null
          };
        }
        // Otherwise return an error
        return { data: null, error: { message: 'Invalid login credentials', status: 401 } };
      },
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

// Create the Supabase client with proper error handling
let baseSupabaseClient: SupabaseClient<Database>;
try {
  baseSupabaseClient = FORCE_MOCK_SUPABASE
    ? createMockClient()
    : createClient<Database>(supabaseUrl, supabaseAnonKey, defaultOptions);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Fallback to mock client if real client initialization fails
  baseSupabaseClient = createMockClient();
}

// Export the final supabase client
export const supabase = baseSupabaseClient;

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
      return { isConnected: false, error: error.message };
    }
    return { isConnected: true, error: null };
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return { 
      isConnected: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    };
  }
} 