import { supabase } from '@/utils/supabase/client';

export interface ConnectionTestResult {
  success: boolean;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: {
    url?: string;
    anonKey?: string;
    authEnabled?: boolean;
    serviceRoleEnabled?: boolean;
    database?: boolean;
    tablesExist?: boolean;
    endpointAccessible?: boolean;
  };
}

/**
 * Check if the Supabase endpoint is accessible via a simple HEAD request
 */
async function checkEndpointAccessibility(url: string): Promise<boolean> {
  try {
    // Attempt a fetch with no-cors to just check if the endpoint is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.error('Error checking endpoint accessibility:', error);
    return false;
  }
}

/**
 * Tests the connection to Supabase and verifies authentication is working correctly
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    // First check if we have the basic credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gnwdahoiauduyncppbdb.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        status: 'error',
        message: 'Missing Supabase credentials. Check your environment variables.',
        details: {
          url: !!supabaseUrl,
          anonKey: !!supabaseKey
        }
      };
    }
    
    // Check if the endpoint is accessible
    const isEndpointAccessible = await checkEndpointAccessibility(supabaseUrl);
    
    if (!isEndpointAccessible) {
      return {
        success: false,
        status: 'error',
        message: `Cannot reach Supabase endpoint. Check your network connection or if the Supabase project is available.`,
        details: {
          url: true,
          anonKey: true,
          endpointAccessible: false
        }
      };
    }

    // Test basic connection by getting session (doesn't require auth)
    const { error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        success: false,
        status: 'error',
        message: `Supabase connection error: ${sessionError.message}`,
        details: {
          url: true,
          anonKey: true,
          authEnabled: false,
          endpointAccessible: true
        }
      };
    }

    // Check if we can access the auth service
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'User not found') {
      return {
        success: false,
        status: 'error',
        message: `Supabase auth error: ${authError.message}`,
        details: {
          url: true,
          anonKey: true,
          authEnabled: false,
          endpointAccessible: true
        }
      };
    }

    // Check if we can access the database
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    // Check for potential RLS issues
    if (dbError && dbError.code === 'PGRST301') {
      return {
        success: false,
        status: 'warning',
        message: 'Row Level Security might be preventing access to the database. This is expected if not authenticated.',
        details: {
          url: true,
          anonKey: true,
          authEnabled: true,
          database: true,
          endpointAccessible: true
        }
      };
    } else if (dbError) {
      // Check if the table doesn't exist
      if (dbError.message.includes('relation "profiles" does not exist')) {
        return {
          success: false,
          status: 'error',
          message: 'Required database tables are missing. Make sure to run migrations.',
          details: {
            url: true,
            anonKey: true,
            authEnabled: true,
            database: true,
            tablesExist: false,
            endpointAccessible: true
          }
        };
      }

      return {
        success: false,
        status: 'error',
        message: `Database connection error: ${dbError.message}`,
        details: {
          url: true,
          anonKey: true,
          authEnabled: true,
          database: false,
          endpointAccessible: true
        }
      };
    }

    // Success case
    return {
      success: true,
      status: 'success',
      message: 'Supabase connection successful. Authentication is properly configured.',
      details: {
        url: true,
        anonKey: true,
        authEnabled: true,
        database: true,
        tablesExist: true,
        endpointAccessible: true
      }
    };
  } catch (error) {
    return {
      success: false,
      status: 'error',
      message: `Unexpected error testing Supabase connection: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 