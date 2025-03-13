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
import ENV, { getEnv } from '@/utils/env';

// Environment variables - use our centralized env utility
export const supabaseUrl = getEnv('SUPABASE_URL', '');
export const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', '');

// Validate environment variables in development
if (IS_DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase environment variables. Check your .env.local file.');
  
  // Log environment variable sources
  if (typeof window !== 'undefined') {
    console.log('Environment variable sources:');
    console.log('- ENV.SUPABASE_URL:', ENV.SUPABASE_URL ? 'Set' : 'Not set');
    console.log('- ENV.SUPABASE_ANON_KEY:', ENV.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    console.log('- window.NEXT_PUBLIC_SUPABASE_URL:', window.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('- window.NEXT_PUBLIC_SUPABASE_ANON_KEY:', window.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    // Last resort fallbacks (only in development)
    if (!supabaseUrl) {
      console.warn('Using hardcoded fallback for supabaseUrl');
      (window as any).NEXT_PUBLIC_SUPABASE_URL = 'https://gnwdahoiauduyncppbdb.supabase.co';
    }
    
    if (!supabaseAnonKey) {
      console.warn('Using hardcoded fallback for supabaseAnonKey');
      (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';
    }
  }
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
      'X-Client-Info': `supabase-js/${getEnv('NEXT_PUBLIC_SUPABASE_JS_VERSION', 'unknown')}`,
    },
  },
};

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Track whether we've warned about Turnstile errors 
let hasTurnstileDiagnostics = false;

// Helper function to diagnose Turnstile issues
const diagnoseTurnstileSetup = () => {
  if (hasTurnstileDiagnostics) return;
  hasTurnstileDiagnostics = true;
  
  console.info('🔍 Turnstile Diagnostics:');
  console.info('- Environment:', process.env.NODE_ENV);
  console.info('- Turnstile Site Key:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? 'Set' : 'Missing');
  console.info('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.info('- Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  
  if (typeof window !== 'undefined') {
    console.info('- Window Turnstile Object:', window.turnstile ? 'Available' : 'Not Available');
    console.info('- Window Location:', window.location.hostname);
    
    // Check for containers
    const containers = document.querySelectorAll('[id*="turnstile"], [class*="turnstile"]');
    console.info('- Turnstile Containers:', containers.length);
    
    // List containers for debugging
    containers.forEach((container, i) => {
      console.info(`  Container ${i+1}:`, container.id || container.className);
    });
  }
};

/**
 * Get or create the Supabase client instance
 * This ensures only one instance is created in the browser
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create a fresh instance
    return createClient(supabaseUrl, supabaseAnonKey, clientOptions);
  }
  
  // Client-side: use the singleton pattern
  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
  }
  
  return supabaseInstance;
}

/**
 * Main Supabase client instance for client-side use
 * This should be the primary way to interact with Supabase from client components
 */
export const supabase = getSupabaseClient();

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
    // Try to get the session first to check authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      return { connected: false, error: `Authentication error: ${authError.message}` };
    }
    
    // Then check if we can query the profiles table (which should exist in most Supabase setups)
    const { error } = await supabase.from('profiles').select('id').limit(1);
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
export const devAuth = IS_DEV ? async (email: string, bypass: boolean = false): Promise<{ success: boolean; data: any; error: any }> => {
  try {
    // Only allow this in development
    if (!IS_DEV) {
      throw new Error('Development authentication can only be used in development mode');
    }
    
    // Get a captcha token first - even in development, Supabase may require this
    // Import the turnstile utilities dynamically to avoid circular dependencies
    const { TURNSTILE_SITE_KEY } = await import('@/utils/turnstile');
    
    console.log('🔒 Dev Auth: Using Turnstile site key:', TURNSTILE_SITE_KEY);
    
    // Check if window.turnstile is available
    if (typeof window !== 'undefined' && window.turnstile) {
      console.log('🔒 Dev Auth: Getting Turnstile token...');
      
      // Get a token from Turnstile
      const token = await new Promise<string>((resolve, reject) => {
        try {
          // Create a temporary container for the widget
          const tempContainer = document.createElement('div');
          tempContainer.style.position = 'absolute';
          tempContainer.style.visibility = 'hidden';
          document.body.appendChild(tempContainer);
          
          // Render the widget
          const widgetId = window.turnstile.render(tempContainer, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              resolve(token);
              window.turnstile.remove(widgetId);
              document.body.removeChild(tempContainer);
            },
            'error-callback': (error: any) => {
              console.error('🔒 Dev Auth: Turnstile error', error);
              reject(error);
              window.turnstile.remove(widgetId);
              document.body.removeChild(tempContainer);
            }
          });
        } catch (err) {
          reject(err);
        }
      });
      
      console.log('🔒 Dev Auth: Got Turnstile token:', token ? 'YES' : 'NO');
      
      // Sign in with the token
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: process.env.NEXT_PUBLIC_DEV_PASSWORD || 'dev_password_123',
        options: {
          captchaToken: token
        }
      });
      
      // Handle Turnstile-specific errors
      if (error) {
        if (error.message && (
          error.message.includes("captcha") || 
          error.message.includes("turnstile") ||
          error.message.includes("110200") ||
          error.message.includes("token")
        )) {
          console.error('🔒 Dev Auth: Turnstile error', error.message);
          // Run diagnostics to help debug the issue
          diagnoseTurnstileSetup();
          
          // Try to get more information about error 110200
          if (error.message.includes("110200")) {
            console.warn('🔒 Dev Auth: Error 110200 - This typically occurs when Turnstile has network issues or an invalid configuration');
            console.warn('- Check that your Turnstile site key is correct');
            console.warn('- Verify you are not blocking any Cloudflare domains');
            console.warn('- Try using a different browser or disabling extensions');
          }
        }
      }
      
      return { success: !error, data, error };
    } else {
      console.error('🔒 Dev Auth: Turnstile not loaded, cannot get token');
      diagnoseTurnstileSetup();
      throw new Error('Turnstile not loaded, cannot verify CAPTCHA');
    }
  } catch (err) {
    console.error('Dev auth error:', err);
    // Run diagnostics on error
    diagnoseTurnstileSetup();
    return { success: false, data: null, error: err };
  }
} : undefined;

// Default export for convenience
export default supabase;
