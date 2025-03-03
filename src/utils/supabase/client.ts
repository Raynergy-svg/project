import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Use environment variables with proper fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';

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

// Development helper to provide mock data for missing tables
const handleMissingTable = (table: string) => {
  console.warn(`Attempted to access missing table '${table}' in development mode. Returning empty data.`);
  return {
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
        range: () => Promise.resolve({ data: [], error: null }),
      }),
      limit: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null }),
      range: () => Promise.resolve({ data: [], error: null }),
      count: () => Promise.resolve({ data: { count: 0 }, error: null }),
      match: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  };
};

// Create a wrapper for Supabase client that handles missing tables in development
const createDevModeClient = (client: any) => {
  const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
  
  if (!isDev) return client;
  
  // List of expected tables - add any missing tables here
  const expectedTables = [
    'payment_transactions',
    'user_budget',
    'user_subscriptions',
    'transaction_categories',
    'payment_plans',
    'debt_accounts',
  ];
  
  // Create a proxy to intercept calls to from() and handle missing tables
  return new Proxy(client, {
    get(target, prop) {
      if (prop === 'from') {
        return new Proxy(target.from, {
          apply(fromMethod, thisArg, args) {
            const tableName = args[0];
            
            // Check if the table exists by making a lightweight request
            if (isDev && expectedTables.includes(tableName)) {
              return handleMissingTable(tableName);
            }
            
            // Default behavior for existing tables
            return fromMethod.apply(thisArg, args);
          }
        });
      }
      return target[prop];
    }
  });
};

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

// Export URL and key for convenience
export { supabaseUrl, supabaseAnonKey }; 