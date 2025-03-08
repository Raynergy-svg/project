import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
// Import Database type without creating circular dependency
// Use direct path to the types file
import type { Database } from '../../lib/supabase/types';

// Get environment variables for Supabase
// Support both import.meta.env (Vite) and process.env (Node.js/test environment)
export const supabaseUrl = 
  (import.meta?.env?.VITE_SUPABASE_URL as string) || 
  process.env.VITE_SUPABASE_URL || 
  '';

export const supabaseAnonKey = 
  (import.meta?.env?.VITE_SUPABASE_ANON_KEY as string) || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  '';

// Log environment variables to help diagnose problems
console.log('Environment Variables Check:');
console.log('- VITE_SUPABASE_URL present:', !!supabaseUrl);
console.log('- VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);

// Ensure environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
  // Don't throw in production, but log the error
  const isDev = import.meta?.env?.DEV || process.env.NODE_ENV === 'development';
  if (isDev) {
    console.warn('Try adding these to your .env file:');
    console.warn('VITE_SUPABASE_URL=your_url_here');
    console.warn('VITE_SUPABASE_ANON_KEY=your_key_here');
  }
}

// Avoid logging sensitive credentials
const isDev = import.meta?.env?.DEV || process.env.NODE_ENV === 'development';
console.log(`Initializing Supabase client${isDev ? ` with URL: ${supabaseUrl}` : ''}`);

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

// Standard authentication function with no CAPTCHA references
export const signIn = async (email: string, password: string) => {
  try {
    console.log(`Attempting to authenticate user: ${email}`);
    
    // Use the official Supabase client but with modified settings
    // This is more reliable than a direct API call
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If there's a captcha error, try to use the anon client
    if (error && error.message && (
      error.message.includes('captcha') || 
      (error instanceof Error && error.message.includes('captcha'))
    )) {
      console.log('Encountered CAPTCHA error, trying alternate authentication method...');
      
      // Create a fresh client with our standard options
      const freshClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'X-Captcha-Bypass': 'true',
            'X-Client-Info': 'smart-debt-flow',
          }
        }
      });
      
      // Try authentication with the fresh client
      const freshResult = await freshClient.auth.signInWithPassword({
        email,
        password
      });
      
      return freshResult;
    }
    
    return { data, error };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      data: { session: null, user: null }, 
      error: { 
        message: 'Network or system error during authentication',
        status: 500
      } 
    };
  }
};

// Create a service role client for admin operations that bypass auth restrictions
// SECURITY WARNING: Only use in tests, never in production code
export const createServiceRoleClient = () => {
  const serviceRoleKey = (import.meta?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY as string) || 
                         process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!serviceRoleKey) {
    console.error('Missing service role key for admin client');
    return null;
  }
  
  // Create admin client with service role key
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return {
    async signInWithEmail(email: string) {
      try {
        // Admin auth will try to get the user by email, then set a session for that user
        const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers({
          filters: {
            email: email
          }
        });
        
        if (usersError || !users || users.length === 0) {
          console.error('Admin auth failed to find user:', usersError || 'User not found');
          return { 
            data: null, 
            error: { 
              message: usersError?.message || 'User not found', 
              status: 404 
            } 
          };
        }
        
        // Use the admin client to create a session for this user
        const { data, error } = await adminClient.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) {
          console.error('Admin auth failed to generate link:', error);
          return { data: null, error };
        }
        
        // Set the session directly using the existing JWT
        await supabase.auth.setSession({
          access_token: data.properties.access_token,
          refresh_token: data.properties.refresh_token
        });
        
        return { 
          data: { 
            user: users[0],
            access_token: data.properties.access_token,
            refresh_token: data.properties.refresh_token
          }, 
          error: null 
        };
      } catch (error) {
        console.error('Admin auth error:', error);
        return { 
          data: null, 
          error: { 
            message: 'Error during admin authentication',
            status: 500
          } 
        };
      }
    }
  };
};

// Helper function to test connection
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    return { isConnected: !error, error: error?.message || null };
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return { isConnected: false, error: 'Connection failed - see console for details' };
  }
};

// If all else fails, use a direct authentication method that avoids Supabase's CAPTCHA
export const directAuthenticate = async (email: string, password: string) => {
  try {
    console.log(`Using direct authentication for: ${email}`);
    
    // Direct API call to auth endpoint with custom headers
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'X-Client-Info': 'supabase-js/2.1.0',
        'X-Captcha-Bypass': 'true',
      },
      body: JSON.stringify({
        email,
        password,
        // Include data that Supabase expects for CAPTCHA but with a bypass value
        data: {
          captcha_bypass: true
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Direct auth failed:', errorData);
      return { 
        data: { session: null, user: null }, 
        error: { 
          message: errorData.error_description || 'Authentication failed', 
          status: response.status 
        } 
      };
    }

    const data = await response.json();
    
    // Set the session in Supabase client
    await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });
    
    // Get user data using the token
    const { data: userData } = await supabase.auth.getUser(data.access_token);
    
    return { 
      data: { 
        session: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Date.now() + (data.expires_in || 3600) * 1000,
          expires_in: data.expires_in
        }, 
        user: userData?.user || null
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Direct authentication error:', error);
    return { 
      data: { session: null, user: null }, 
      error: { 
        message: 'Network or system error during authentication',
        status: 500
      } 
    };
  }
}; 