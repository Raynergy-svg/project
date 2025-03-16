/**
 * Supabase CAPTCHA Configuration Utility
 * 
 * This utility handles configuring Supabase CAPTCHA settings properly,
 * especially for development environments where we want to ensure authentication works.
 */

import { supabase } from './client';
import { CLOUDFLARE_TEST_SITE_KEY } from '../temp-constants';

// The site URL that should be configured in Supabase for CAPTCHA
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

/**
 * Check if Supabase is configured for CAPTCHA
 * This is a diagnostic function for development environments
 */
export async function checkSupabaseCaptchaConfig() {
  try {
    // This is just a diagnostic check - we don't actually configure Supabase here
    // In a real implementation, you would use the Supabase Management API to manage settings
    
    // For now, we just return the expected configuration
    return {
      success: true,
      message: 'Checking expected Supabase CAPTCHA configuration',
      details: {
        isDev: process.env.NODE_ENV === 'development',
        expectedSettings: {
          captchaProvider: 'turnstile',
          siteKey: process.env.NODE_ENV === 'development'
            ? CLOUDFLARE_TEST_SITE_KEY
            : process.env.TURNSTILE_SITE_KEY,
          secretKey: '***masked***',
          siteVerify: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          siteUrl: SITE_URL,
        },
        systemInfo: {
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          captchaEnabled: process.env.ENABLE_CAPTCHA === 'true',
          turnstileEnabled: process.env.ENABLE_TURNSTILE === 'true',
          turnstileInDevEnabled: process.env.ENABLE_TURNSTILE_IN_DEV === 'true',
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to check Supabase CAPTCHA configuration: ${error instanceof Error ? error.message : String(error)}`,
      details: { error }
    };
  }
}

/**
 * Get development authentication options with best-effort CAPTCHA handling
 * Use this for development sign-up and sign-in operations
 */
export function getDevAuthOptions() {
  // For development mode, we use a special approach to handle CAPTCHA
  if (process.env.NODE_ENV === 'development') {
    return {
      // Include a CAPTCHA token that might work - we'll be using a more robust approach in the actual auth functions
      captchaToken: CLOUDFLARE_TEST_SITE_KEY,
      
      // Include helpful metadata
      data: {
        isDev: true,
        timestamp: new Date().toISOString(),
        captchaProvider: 'turnstile',
      }
    };
  }
  
  // In production, we don't add anything special
  return {};
}

/**
 * Initialize Supabase CAPTCHA configuration
 * This is called during application initialization
 */
export function initSupabaseCaptcha() {
  // Log the current configuration
  console.log('🔑 Initializing Supabase CAPTCHA configuration:');
  console.log('- Environment:', process.env.NODE_ENV);
  console.log('- CAPTCHA Enabled:', process.env.ENABLE_CAPTCHA === 'true');
  console.log('- Turnstile Enabled:', process.env.ENABLE_TURNSTILE === 'true');
  console.log('- Turnstile in Dev:', process.env.ENABLE_TURNSTILE_IN_DEV === 'true');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📝 Development mode: Using automatic CAPTCHA bypass where possible');
    
    // Log the test token we'll be using
    console.log('🔑 Test CAPTCHA Token:', CLOUDFLARE_TEST_SITE_KEY);
  }
  
  return {
    initialized: true,
    environment: process.env.NODE_ENV,
    captchaEnabled: process.env.ENABLE_CAPTCHA === 'true',
    turnstileEnabled: process.env.ENABLE_TURNSTILE === 'true'
  };
}

// Initialize when this module is imported
const captchaConfig = initSupabaseCaptcha();

export default captchaConfig; 