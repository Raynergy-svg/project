/**
 * Environment configuration adapter for Next.js and Vite compatibility
 * This file centralizes all environment variable access to ensure consistent behavior
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Check if we're in a Next.js environment
const isNextJs = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RUNTIME === 'next';

/**
 * Get environment variable value with fallback
 */
export function getEnv(key: string, fallback = ''): string {
  // For Vite style env vars (VITE_*)
  if (typeof process !== 'undefined' && process.env) {
    // If it's a VITE_ prefixed var, try to get the NEXT_PUBLIC_ version first
    if (key.startsWith('VITE_')) {
      const nextKey = `NEXT_PUBLIC_${key.substring(5)}`;
      return process.env[nextKey] || process.env[key] || fallback;
    }
    
    // For regular vars, try as is
    return process.env[key] || fallback;
  }
  
  // For Vite runtime environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  
  return fallback;
}

// Environment mode detection
export const IS_DEV = 
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') || 
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true);

export const IS_PROD = 
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.PROD === true);

export const IS_TEST = 
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test');

// Specific environment variables needed throughout the app
export const ENV = {
  // Supabase
  SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL', getEnv('VITE_SUPABASE_URL', '')),
  SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', getEnv('VITE_SUPABASE_ANON_KEY', '')),
  SUPABASE_SERVICE_ROLE_KEY: getEnv('SUPABASE_SERVICE_ROLE_KEY', getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY', '')),
  
  // Cloudflare Turnstile
  TURNSTILE_SITE_KEY: getEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', getEnv('VITE_TURNSTILE_SITE_KEY', '0x4AAAAAAAK5LpjT0Jzv4jzl')),
  TURNSTILE_SECRET_KEY: getEnv('TURNSTILE_SECRET_KEY', ''),
  
  // Auth settings
  SKIP_AUTH_CAPTCHA: getEnv('NEXT_PUBLIC_SKIP_AUTH_CAPTCHA', getEnv('VITE_SKIP_AUTH_CAPTCHA', 'false')) === 'true',
  SUPABASE_AUTH_CAPTCHA_DISABLE: getEnv('SUPABASE_AUTH_CAPTCHA_DISABLE', getEnv('VITE_SUPABASE_AUTH_CAPTCHA_DISABLE', 'false')) === 'true',
  
  // API and app URLs
  API_URL: getEnv('NEXT_PUBLIC_API_URL', getEnv('VITE_API_URL', '')),
  APP_URL: getEnv('NEXT_PUBLIC_APP_URL', getEnv('VITE_APP_URL', isBrowser ? window.location.origin : '')),
  APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', getEnv('VITE_APP_NAME', 'Smart Debt Flow')),
  APP_ENVIRONMENT: getEnv('NEXT_PUBLIC_APP_ENVIRONMENT', getEnv('VITE_APP_ENVIRONMENT', IS_PROD ? 'production' : 'development')),
  
  // Feature flags
  ENABLE_ANALYTICS: getEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', getEnv('VITE_ENABLE_ANALYTICS', 'false')) === 'true',
  ENABLE_PWA: getEnv('NEXT_PUBLIC_ENABLE_PWA', getEnv('VITE_ENABLE_PWA', 'false')) === 'true',
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureName: string): boolean {
  const upperFeatureName = featureName.toUpperCase();
  // First check ENV object
  const envKey = `ENABLE_${upperFeatureName}` as keyof typeof ENV;
  if (envKey in ENV) {
    return Boolean(ENV[envKey as keyof typeof ENV]);
  }
  
  // Fall back to environment variables
  const nextKey = `NEXT_PUBLIC_ENABLE_${upperFeatureName}`;
  const viteKey = `VITE_ENABLE_${upperFeatureName}`;
  
  return getEnv(nextKey, getEnv(viteKey, 'false')) === 'true';
}

/**
 * Get the base URL based on environment
 */
export function getBaseUrl(): string {
  if (isBrowser) {
    return window.location.origin;
  }
  return ENV.APP_URL || (IS_PROD ? 'https://yourproductiondomain.com' : 'http://localhost:3001');
}

// Export convenience functions for mode detection
export const isDevelopmentMode = () => IS_DEV;
export const isProductionMode = () => IS_PROD;
export const isTestMode = () => IS_TEST; 