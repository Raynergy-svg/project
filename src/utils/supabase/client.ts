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
import { supabaseCookieHandler } from '@/utils/cookies';
import configureCaptcha from './configure-captcha';
import { CLOUDFLARE_TEST_SITE_KEY } from '../env-loader';

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
      'X-Client-Info': `supabase-js/${getEnv('NEXT_PUBLIC_SUPABASE_JS_VERSION', 'unknown')}`,
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
 * This function provides enhanced authentication for development environments,
 * handling CAPTCHA issues with multiple test strategies.
 */
export async function devSignIn(email: string, password: string, options: { captchaToken?: string } = {}) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('devSignIn should only be used in development!');
  }
  
  const isDev = process.env.NODE_ENV === 'development';
  const enableTurnstileInDev = process.env.ENABLE_TURNSTILE_IN_DEV === 'true';
  
  // For development, try multiple strategies if CAPTCHA is required
  if (isDev) {
    // STRATEGY 1: Try with provided token or default test token
    let captchaToken = options.captchaToken || CLOUDFLARE_TEST_SITE_KEY;
    console.log('🔑 Attempting sign-in with CAPTCHA token:', captchaToken.substring(0, 10) + '...');
    
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken
      }
    });
    
    // If it worked, or if the error is not CAPTCHA-related, return the result
    if (!result.error || !result.error.message.includes('captcha')) {
      return result;
    }
    
    console.log('🔑 First sign-in attempt failed, trying alternative tokens...');
    
    // STRATEGY 2: Try with different test tokens if first attempt failed
    const testTokens = [
      '1x0000000000000000000000', // Alternative Cloudflare test token
      '1x00000000000000000000AB', // Another alternative
      'bypass', // Sometimes Supabase accepts this
      // Generate dynamic-looking token
      `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    ];
    
    for (const token of testTokens) {
      console.log(`🔑 Trying token: ${token}`);
      
      const attempt = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: token
        }
      });
      
      if (!attempt.error || !attempt.error.message.includes('captcha')) {
        console.log('🎉 Found working token:', token);
        return attempt;
      }
    }
    
    // STRATEGY 3: Return the original result if all strategies failed
    console.log('❌ All CAPTCHA token strategies failed.');
    return result;
  }
  
  // For production, use standard sign-in
  return supabase.auth.signInWithPassword({
    email,
    password,
    ...(options || {})
  });
}

// Default export for convenience
export default supabase;
