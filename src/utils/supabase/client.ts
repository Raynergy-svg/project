/**
 * Supabase Client - Client Side
 * 
 * This file provides the Supabase client implementation for use in client components.
 * It handles browser-specific authentication flows and provides a consistent interface
 * for database operations.
 * 
 * @see https://supabase.com/docs/guides/auth/auth-helpers/nextjs
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { IS_DEV } from '@/utils/environment';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

// Environment variables
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables in development
if (IS_DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase environment variables. Check your .env.local file.');
}

// Client options with browser-specific settings
const clientOptions: SupabaseClientOptions<'public'> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use standard PKCE flow which is more secure
    flowType: 'pkce' as const,
    // Only enable debug in development
    debug: IS_DEV
  },
  global: {
    headers: {
      'X-Client-Info': `supabase-js/${process.env.NEXT_PUBLIC_SUPABASE_JS_VERSION || 'unknown'}`,
    },
  },
};

/**
 * Main Supabase client instance for client-side use
 * This should be the primary way to interact with Supabase from client components
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

/**
 * Alternative client creation using the SSR package's browser client
 * This is useful in specific cases where the SSR API is needed
 */
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${name}=`))
          ?.split('=')[1];
      },
      set(name, value, options) {
        let cookie = `${name}=${value}`;
        if (options?.expires) {
          cookie += `; expires=${options.expires.toUTCString()}`;
        }
        if (options?.path) {
          cookie += `; path=${options.path}`;
        }
        if (options?.domain) {
          cookie += `; domain=${options.domain}`;
        }
        if (options?.sameSite) {
          cookie += `; samesite=${options.sameSite}`;
        }
        if (options?.secure) {
          cookie += '; secure';
        }
        document.cookie = cookie;
      },
      remove(name, options) {
        const opts = { ...options, maxAge: -1 };
        this.set(name, '', opts);
      },
    },
  });
};

/**
 * Check if the Supabase connection is working properly
 * This is useful for debugging connection issues
 */
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('health_check').select('*').limit(1);
    return { connected: !error, error: error ? error.message : null };
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return { connected: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Development-only authentication helper
 * This function should only be used during local development to bypass normal auth flows
 */
export const devAuth = IS_DEV ? async (email: string) => {
  try {
    // Only allow this in development
    if (!IS_DEV) {
      throw new Error('Development authentication can only be used in development mode');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: process.env.NEXT_PUBLIC_DEV_PASSWORD || 'dev_password_123',
    });
    
    return { success: !error, data, error };
  } catch (err) {
    console.error('Dev auth error:', err);
    return { success: false, data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
} : undefined;

// Default export for convenience
export default supabase;
