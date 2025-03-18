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
// Use the lightweight environment constants
import { IS_DEV, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env-constants';
import type { SupabaseClientOptions } from '@supabase/supabase-js';
import { supabaseCookieHandler } from '@/utils/cookies';
import configureCaptcha from './configure-captcha';
// Use emergency fix temporary constants
import { CLOUDFLARE_TEST_SITE_KEY } from '../temp-constants';

// Environment variables from our lightweight constants
export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_ANON_KEY;

// Validate environment variables in development
if (IS_DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase credentials. Check your .env.local file.');
  
  // Reduced logging in development mode
  if (typeof window !== 'undefined') {
    console.log('Environment variable sources:', { 
      supabaseUrl: !!supabaseUrl, 
      supabaseAnonKey: !!supabaseAnonKey 
    });
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
    debug: IS_DEV,
    // Configure captcha based on environment variables
    captcha: IS_DEV ? 
      { 
        provider: 'turnstile',
        // Only disable it when explicitly told to
        ...(process.env.ENABLE_TURNSTILE_IN_DEV !== 'true' ? { disable: true } : {})
      } : {
        provider: 'turnstile' 
      },
    // Set cookie options to comply with privacy standards
    cookieOptions: {
      // Use Lax for normal auth cookies (better privacy, still works for most cases)
      sameSite: 'Lax',
      secure: true,
      path: '/'
    }
  },
  global: {
    headers: {
      'X-Client-Info': `supabase-js/unknown`,
      // These headers are critical for content negotiation with PostgREST
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Profile': 'public',
      'Content-Profile': 'public',
      'Prefer': 'return=representation',
      // Add headers to disable captcha in development only if not using "Always Pass" mode
      ...(IS_DEV && process.env.ENABLE_TURNSTILE_IN_DEV !== 'true' ? {
        'X-Captcha-Disable': 'true',
        'X-Skip-Captcha': 'true',
        'X-Captcha-Debug': 'true'
      } : {})
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
  try {
    // Ensure we have valid URL and key
    const url = supabaseUrl || '';
    const key = supabaseAnonKey || '';
    
    if (!url || !key) {
      console.error('Missing Supabase credentials. Authentication will not work properly.');
    }
    
    if (typeof window === 'undefined') {
      // Server-side: always create a fresh instance
      return createClient(url, key, clientOptions);
    }
    
    // Client-side: use the singleton pattern
    if (!supabaseInstance) {
      console.log('Creating new Supabase client instance');
      try {
        supabaseInstance = createClient(url, key, clientOptions);
      } catch (error) {
        console.error('Error creating Supabase client:', error);
        // Return a minimal client that won't throw errors when methods are called
        return createClient(url, key, {
          ...clientOptions,
          auth: {
            ...clientOptions.auth,
            autoRefreshToken: false,
            persistSession: false,
          }
        });
      }
    }
    
    return supabaseInstance;
  } catch (error) {
    console.error('Unexpected error getting Supabase client:', error);
    // Return a minimal client that won't throw errors when methods are called
    return createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });
  }
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
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase credentials. Authentication will not work properly.');
    }
    
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: supabaseCookieHandler,
      // Additional auth config
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Use standard PKCE flow which is more secure
        flowType: 'pkce' as const,
        // Set cookie options to comply with privacy standards
        cookieOptions: {
          // Use Lax for normal auth cookies (better privacy, still works for most cases)
          sameSite: 'Lax',
          secure: true,
          path: '/' 
        }
      },
    });
  } catch (error) {
    console.error('Error creating browser client:', error);
    // Return null to indicate failure
    return null;
  }
};

/**
 * Check if the Supabase connection is working properly
 * This is useful for debugging connection issues
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try to check if we can connect to the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Content-Profile': 'public',
        'Prefer': 'return=representation'
      });

    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error during Supabase connection check:', error);
    return false;
  }
}

/**
 * Development-only authentication helper
 * This function should only be used during local development to bypass normal auth flows
 */
export const devAuth = async (
  email: string,
  role: 'admin' | 'user',
  options?: { captchaToken?: string }
): Promise<{ success: boolean; error?: string | Error }> => {
  console.log('🔑 DEV AUTH: Starting development authentication', { email, role });
  
  // In development mode, we'll use simplified authentication without captcha
  try {
    // Set password based on role
    const password = role === 'admin' ? 'admin-password' : 'user-password';
    
    console.log('🔑 DEV AUTH: Attempting to sign in with password');
    
    // Sign in directly without captcha token in development
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('🔑 DEV AUTH: Authentication error:', error);
      return { success: false, error };
    }
    
    if (data?.user) {
      console.log('🔑 DEV AUTH: Authentication successful');
      return { success: true };
    }
    
    return { success: false, error: 'No user data returned from authentication' };
  } catch (error) {
    console.error('🔑 DEV AUTH: Unexpected error during authentication:', error);
    return { success: false, error: error instanceof Error ? error : String(error) };
  }
};

/**
 * Development Sign-In Helper
 * 
 * This function provides enhanced authentication for development environments.
 */
export async function devSignIn(email: string, password: string) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('devSignIn should only be used in development!');
  }
  
  console.log('🔑 Attempting development sign-in with:', email);
  
  try {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('🔑 Sign-in error:', error.message);
      return { error };
    }

    console.log('🔑 Sign-in successful');
    return { data, error: null };
  } catch (error) {
    console.error('🔑 Unexpected error during sign-in:', error);
    return { error };
  }
}

// Export a default object with all functions
export default {
  devSignIn
};
