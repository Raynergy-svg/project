/**
 * Environment Variables Utility (Consolidated)
 * 
 * This file provides a centralized way to access environment variables across the application.
 * It ensures variables are properly loaded from .env.local and accessible in all environments.
 */

/**
 * Gets an environment variable with fallbacks
 * For client-side code, this tries multiple sources to ensure we get the value
 * 
 * @param key The environment variable key (without NEXT_PUBLIC_ prefix)
 * @param fallback A fallback value if the environment variable is not set
 * @returns The environment variable value or fallback
 */
export function getEnv(key: string, fallback = ''): string {
  // Always try with NEXT_PUBLIC_ prefix first
  const nextKey = `NEXT_PUBLIC_${key}`;
  
  // Server-side: Access process.env directly
  if (typeof window === 'undefined') {
    return process.env[nextKey] || process.env[key] || fallback;
  }
  
  // Client-side: Try multiple sources
  
  // 1. Check process.env (for Next.js)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[nextKey]) {
      return process.env[nextKey] as string;
    }
    if (process.env[key]) {
      return process.env[key] as string;
    }
  }
  
  // 2. Try to get from Next.js data
  try {
    if (window && (window as any).__NEXT_DATA__?.props?.pageProps?.env) {
      const envData = (window as any).__NEXT_DATA__.props.pageProps.env;
      if (envData[nextKey]) {
        return envData[nextKey];
      }
      if (envData[key]) {
        return envData[key];
      }
    }
  } catch (e) {
    // Silently fail and continue with other methods
  }
  
  // 3. Check for globally defined variables on window
  if ((window as any)[nextKey]) {
    return (window as any)[nextKey];
  }
  
  if ((window as any)[key]) {
    return (window as any)[key];
  }
  
  // 4. Check window.__ENV
  if ((window as any).__ENV && (window as any).__ENV[key]) {
    return (window as any).__ENV[key];
  }
  
  // 5. If all else fails, hardcode critical values for development
  if (process.env.NODE_ENV === 'development') {
    // Provide fallbacks for critical variables in development mode
    if (key === 'SUPABASE_URL' && !fallback) {
      return 'https://gnwdahoiauduyncppbdb.supabase.co';
    }
    if (key === 'SUPABASE_ANON_KEY' && !fallback) {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';
    }
  }
  
  // 6. Return fallback if nothing found
  return fallback;
}

/**
 * Common environment variables used throughout the application
 */
export const ENV = {
  // Node environment
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  
  // Supabase settings (critical)
  SUPABASE_URL: getEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
  
  // Feature flags
  SKIP_AUTH_CAPTCHA: getEnv('SKIP_AUTH_CAPTCHA', 'false') === 'true',
  ENABLE_CAPTCHA: getEnv('ENABLE_CAPTCHA', 'true') === 'true',
  ENABLE_TURNSTILE: getEnv('ENABLE_TURNSTILE', 'true') === 'true',
  ENABLE_ANALYTICS: getEnv('ENABLE_ANALYTICS', 'false') === 'true',
  
  // Turnstile
  TURNSTILE_SITE_KEY: getEnv('TURNSTILE_SITE_KEY'),
  
  // URLs
  APP_URL: getEnv('APP_URL', 'http://localhost:3000'),
  API_URL: getEnv('API_URL'),
};

/**
 * Injects environment variables into window object for development
 * This ensures that environment variables are accessible even in client-side code
 */
export function injectEnvToWindow(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('🔧 Injecting environment variables to window for development');
  
  // Inject all environment variables to window for access
  Object.entries(ENV).forEach(([key, value]) => {
    (window as any)[`NEXT_PUBLIC_${key}`] = value;
  });
  
  // Explicitly set these as they're often needed directly
  (window as any).NEXT_PUBLIC_SUPABASE_URL = ENV.SUPABASE_URL;
  (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;
  
  // Add captcha bypass vars
  (window as any).SUPABASE_AUTH_CAPTCHA_DISABLE = true;
  (window as any).SKIP_AUTH_CAPTCHA = true;
  (window as any).NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE = true;
  
  // Add the environment object for easy access
  (window as any).__ENV = ENV;
  
  // Log critical variables status
  console.log('🔑 Environment variables loaded:');
  console.log(`- SUPABASE_URL: ${ENV.SUPABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`- SUPABASE_ANON_KEY: ${ENV.SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`);
}

// Export default object for convenience
export default ENV; 