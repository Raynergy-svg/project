/**
 * Turnstile Verification Utility
 * 
 * This utility provides functions for verifying Turnstile tokens manually
 * and diagnosing issues with Turnstile in development environments.
 */

import { TURNSTILE_SECRET_KEY, IS_DEV } from './turnstile';

/**
 * Verify a Turnstile token with the Cloudflare API
 * @param token The token to verify
 * @returns The verification result from Cloudflare
 */
export async function verifyTurnstileToken(token: string) {
  try {
    // In development mode, log additional information
    if (IS_DEV) {
      console.log('🔒 Turnstile Verification:', {
        token: token.substring(0, 10) + '...',
        secretKey: TURNSTILE_SECRET_KEY ? 'Set' : 'Missing',
        environment: process.env.NODE_ENV
      });
    }

    // Call the Cloudflare API to verify the token
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token
      })
    });

    // Parse the response
    const result = await response.json();
    
    // In development mode, log the complete result
    if (IS_DEV) {
      console.log('🔒 Turnstile Verification Result:', result);
    }

    return result;
  } catch (error) {
    console.error('🔒 Turnstile Verification Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      'error-codes': ['verification-api-error']
    };
  }
}

/**
 * Debug function to check all Turnstile environment variables
 * @returns Object with environment variable status
 */
export function debugTurnstileEnvironment() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY ? 'Set' : 'Missing',
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ? 'Set' : 'Missing',
    TURNSTILE_SITE_KEY_DEV: process.env.TURNSTILE_SITE_KEY_DEV ? 'Set' : 'Missing',
    TURNSTILE_SECRET_KEY_DEV: process.env.TURNSTILE_SECRET_KEY_DEV ? 'Set' : 'Missing',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? 'Set' : 'Missing',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV ? 'Set' : 'Missing',
    ENABLE_TURNSTILE_IN_DEV: process.env.ENABLE_TURNSTILE_IN_DEV,
    NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV: process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV,
    DISABLE_TURNSTILE: process.env.DISABLE_TURNSTILE,
    SKIP_AUTH_CAPTCHA: process.env.SKIP_AUTH_CAPTCHA,
    SUPABASE_AUTH_CAPTCHA_DISABLE: process.env.SUPABASE_AUTH_CAPTCHA_DISABLE,
  };

  console.log('🔒 Turnstile Environment Variables:', envVars);
  return envVars;
}

/**
 * Test function to quickly verify if a Turnstile token is valid
 * @param token The token to test
 */
export async function testTurnstileToken(token: string) {
  console.log('🔒 Testing Turnstile token:', token.substring(0, 10) + '...');
  
  // Log environment info
  debugTurnstileEnvironment();
  
  // Verify the token
  const result = await verifyTurnstileToken(token);
  
  // Log the result
  console.log('🔒 Verification result:', result);
  
  return result;
}

// Export a helper function to quickly test preset tokens
export async function testAllBypassTokens() {
  const tokens = [
    '1x00000000000000000000AA',
    '1x0000000000000000000000',
    '1x00000000000000000000AB',
    'bypass'
  ];
  
  console.log('🔒 Testing all bypass tokens...');
  
  const results = await Promise.all(
    tokens.map(token => testTurnstileToken(token))
  );
  
  const workingTokens = results
    .map((result, index) => ({ token: tokens[index], success: result.success }))
    .filter(item => item.success);
  
  if (workingTokens.length > 0) {
    console.log('🔒 Working bypass tokens:', workingTokens);
  } else {
    console.log('🔒 No working bypass tokens found');
  }
  
  return results;
} 