/**
 * Environment Variable Loader and Constants
 * 
 * This module provides constants and utilities for working with environment variables,
 * particularly focused on CAPTCHA/Turnstile configuration.
 */

/**
 * Cloudflare Turnstile Test Keys
 * 
 * - These are the official Cloudflare test keys that should work in development
 * - Source: https://developers.cloudflare.com/turnstile/reference/testing/
 */
export const CLOUDFLARE_TEST_SITE_KEY = '1x00000000000000000000AA';
export const CLOUDFLARE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';
export const CLOUDFLARE_TEST_SITE_KEY_BLOCK = '2x00000000000000000000BB';
export const CLOUDFLARE_TEST_SECRET_KEY_BLOCK = '2x0000000000000000000000000000000BB';

// Alternative test values that sometimes work with different integrations
export const ALTERNATIVE_TEST_TOKENS = [
  CLOUDFLARE_TEST_SITE_KEY,
  '1x0000000000000000000000',
  '1x00000000000000000000AB',
  'bypass'
];

/**
 * Turnstile environment information
 */
export interface TurnstileEnv {
  siteKey: string;
  secretKey: string;
  enabled: boolean;
  enabledInDev: boolean;
  isDev: boolean;
}

/**
 * Get Turnstile environment information
 */
export function getTurnstileEnv(): TurnstileEnv {
  const isDev = process.env.NODE_ENV === 'development';
  const enabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true';
  const enabledInDev = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV === 'true';
  
  // Get site key based on environment
  const siteKey = isDev
    ? process.env.TURNSTILE_SITE_KEY_DEV || CLOUDFLARE_TEST_SITE_KEY
    : process.env.TURNSTILE_SITE_KEY || '';
    
  // Get secret key based on environment 
  const secretKey = isDev
    ? process.env.TURNSTILE_SECRET_KEY_DEV || CLOUDFLARE_TEST_SECRET_KEY
    : process.env.TURNSTILE_SECRET_KEY || '';
    
  return {
    siteKey,
    secretKey,
    enabled,
    enabledInDev,
    isDev
  };
}

/**
 * Force Turnstile environment variables to be loaded
 * This is a no-op now that Turnstile has been disabled and moved to src/utils/captcha
 */
export function forceTurnstileEnv() {
  // This function is now a no-op since Turnstile has been disabled
  // It's kept for backward compatibility with existing code
  console.log('[ENV] Turnstile is disabled, environment variables not loaded');
  return false;
}

/**
 * Get runtime appropriate Turnstile site key based on environment
 */
export function getTurnstileSiteKey() {
  // For development, use the dev key
  if (process.env.NODE_ENV === 'development') {
    return process.env.TURNSTILE_SITE_KEY_DEV || CLOUDFLARE_TEST_SITE_KEY;
  }
  
  // For production, use the production key
  return process.env.TURNSTILE_SITE_KEY || '';
}

/**
 * Get runtime appropriate Turnstile secret key based on environment
 */
export function getTurnstileSecretKey() {
  // For development, use the dev key
  if (process.env.NODE_ENV === 'development') {
    return process.env.TURNSTILE_SECRET_KEY_DEV || CLOUDFLARE_TEST_SECRET_KEY;
  }
  
  // For production, use the production key
  return process.env.TURNSTILE_SECRET_KEY || '';
}

// Initialize environment variables when this module is loaded
forceTurnstileEnv();

// Export a default object with all the utilities
export default {
  forceTurnstileEnv,
  getTurnstileSiteKey,
  getTurnstileSecretKey,
  getTurnstileEnv,
  CLOUDFLARE_TEST_SITE_KEY,
  CLOUDFLARE_TEST_SECRET_KEY
}; 