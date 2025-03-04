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

// Create a mock Supabase client for development without backend
export const createMockSupabaseClient = () => {
  // Helper function to create a standard error response
  const mockError = (message = 'Mock error') => ({ 
    data: null, 
    error: { message, code: '42P01' } 
  });
  
  // Create a proxy that simulates Supabase client but always returns errors
  // This will force services to fall back to mock implementations
  const mockClient = {
    from: () => {
      // Create a query builder that properly chains all methods
      const queryBuilder = {
        // Basic query methods
        select: () => {
          const selectChain = {
            eq: () => selectChain,
            neq: () => selectChain,
            gt: () => selectChain,
            gte: () => selectChain,
            lt: () => selectChain,
            lte: () => selectChain,
            like: () => selectChain,
            ilike: () => selectChain,
            is: () => selectChain,
            in: () => selectChain,
            contains: () => selectChain,
            containedBy: () => selectChain,
            rangeGt: () => selectChain,
            rangeGte: () => selectChain,
            rangeLt: () => selectChain,
            rangeLte: () => selectChain,
            rangeAdjacent: () => selectChain,
            overlaps: () => selectChain,
            textSearch: () => selectChain,
            filter: () => selectChain,
            not: () => selectChain,
            or: () => selectChain,
            and: () => selectChain,
            
            // Execution methods
            limit: () => selectChain,
            single: () => Promise.resolve(mockError()),
            maybeSingle: () => Promise.resolve(mockError()),
            order: () => selectChain,
            range: () => selectChain,
            execute: () => Promise.resolve(mockError()),
          };
          return selectChain;
        },
        
        // Insert operations
        insert: () => {
          const insertChain = {
            select: () => ({
              single: () => Promise.resolve(mockError()),
              execute: () => Promise.resolve(mockError()),
            }),
            execute: () => Promise.resolve(mockError()),
          };
          return insertChain;
        },
        
        // Update operations
        update: () => {
          const updateChain = {
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve(mockError()),
              }),
              execute: () => Promise.resolve(mockError()),
            }),
            match: () => ({
              execute: () => Promise.resolve(mockError()),
            }),
            select: () => ({
              single: () => Promise.resolve(mockError()),
            }),
            execute: () => Promise.resolve(mockError()),
          };
          return updateChain;
        },
        
        // Delete operations
        delete: () => {
          const deleteChain = {
            eq: () => Promise.resolve(mockError()),
            match: () => Promise.resolve(mockError()),
            execute: () => Promise.resolve(mockError()),
          };
          return deleteChain;
        },
      };
      
      return queryBuilder;
    },
    
    // Functions API
    functions: {
      invoke: (name: string, params?: any) => {
        console.log(`Mock mode: Intercepted function call to "${name}"`, params);
        return Promise.resolve(mockError(`Mock mode: Function call to "${name}" intercepted`));
      },
    },
    
    // RPC API
    rpc: (functionName: string, params?: any) => {
      console.log(`Mock mode: Intercepted RPC call to "${functionName}"`, params);
      
      // Special handling for execute_sql and security_execute_sql
      if (functionName === 'execute_sql' || functionName === 'security_execute_sql') {
        // Parse the SQL query to log what's being attempted
        const sqlQuery = params?.sql || params?.sql_query || '';
        console.log('Mock mode: SQL query intercepted:', sqlQuery?.substring(0, 150) + (sqlQuery?.length > 150 ? '...' : ''));
        
        // Return error to force fallback to mock implementations
        return Promise.resolve({ 
          data: null, 
          error: { 
            message: `Mock mode: SQL execution blocked for "${functionName}"`, 
            code: '42P01',
            details: 'Function intercepted by mock mode' 
          } 
        });
      }
      
      // Default behavior for other RPC calls
      return Promise.resolve({ 
        data: null, 
        error: { 
          message: `Mock mode: RPC call to "${functionName}" intercepted`, 
          code: '42P01' 
        } 
      });
    },
    
    // Auth API
    auth: {
      getUser: () => Promise.resolve({ 
        data: { 
          user: { 
            id: 'mock-user-id',
            email: 'mock@example.com',
            user_metadata: {
              full_name: 'Mock User'
            }
          } 
        }, 
        error: null 
      }),
      getSession: () => Promise.resolve({
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'mock@example.com',
              user_metadata: {
                full_name: 'Mock User'
              }
            },
            access_token: 'mock-token'
          }
        },
        error: null
      }),
      onAuthStateChange: (callback: any) => {
        console.log('Mock mode: Auth state change listener registered');
        // Return a mock unsubscribe function
        return {
          data: { subscription: { unsubscribe: () => console.log('Mock unsubscribe called') } },
          error: null
        };
      },
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com',
            user_metadata: {
              full_name: 'Mock User'
            }
          },
          session: {
            access_token: 'mock-token'
          }
        },
        error: null
      }),
      signInWithOAuth: () => Promise.resolve({ error: null }),
    },
    
    // Storage API
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve(mockError()),
        download: () => Promise.resolve(mockError()),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock-storage-url.com/file.png' } }),
        list: () => Promise.resolve(mockError()),
        remove: () => Promise.resolve(mockError()),
      }),
    },
  };

  return mockClient;
};

// Function to create either a real or mock client based on environment
function createFinalClient() {
  // Wrap with dev mode handler for missing tables
  const devClient = createDevModeClient(baseClient);
  
  // Check if we should use mock client 
  const FORCE_MOCK_SUPABASE = import.meta.env.VITE_MOCK_SUPABASE === 'true';
  
  if (FORCE_MOCK_SUPABASE) {
    console.log('⚠️ Using mock Supabase client - all services will use mock data');
    
    // Create the mock client
    const mockClient = createMockSupabaseClient();
    
    // Return a proxy that forwards calls to the mock client when possible
    // @ts-ignore: Type mismatch is expected, but functionally this works for mock data
    return new Proxy(devClient, {
      get(target, prop, receiver) {
        // Check if the mock client has this property
        if (prop in mockClient) {
          return mockClient[prop];
        }
        
        // Fall back to the original client for properties not in the mock
        return Reflect.get(target, prop, receiver);
      }
    });
  }
  
  // If no mock is needed, return the regular dev client
  return devClient;
}

// Export the appropriate client based on environment
export const supabase = createFinalClient();

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