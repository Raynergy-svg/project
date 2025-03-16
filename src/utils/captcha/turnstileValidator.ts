/**
 * Turnstile Validator - Implements server-side verification according to Cloudflare guidelines
 * 
 * This utility validates Turnstile tokens by making a direct call to Cloudflare's verification
 * endpoint, rather than relying on Supabase's built-in validation.
 * 
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { getTurnstileEnv, CLOUDFLARE_TEST_SITE_KEY, CLOUDFLARE_TEST_SECRET_KEY } from '../temp-constants';

// Helper function to safely get environment variables with fallbacks
function getEnvVar(name: string, fallback: string = ''): string {
  const value = process.env[name] || fallback;
  return value;
}

// Get the appropriate secret key based on the environment
function getSecretKey(): string {
  // First try using our environment loader
  const env = getTurnstileEnv();
  if (env.secretKey) {
    return env.secretKey;
  }
  
  const isDev = process.env.NODE_ENV === 'development';
  
  // First try the specific key for the current environment
  let key = isDev 
    ? getEnvVar('TURNSTILE_SECRET_KEY_DEV') 
    : getEnvVar('TURNSTILE_SECRET_KEY');
  
  // If not found, try the alternative key
  if (!key) {
    key = isDev 
      ? getEnvVar('TURNSTILE_SECRET_KEY') 
      : getEnvVar('TURNSTILE_SECRET_KEY_DEV');
    
    // Log a warning if we're using a fallback key
    if (key) {
      console.warn(`⚠️ Using fallback Turnstile secret key (${isDev ? 'production' : 'development'} instead of ${isDev ? 'development' : 'production'} key)`);
    }
  }
  
  // Final fallback to the special Cloudflare test secret key for development
  if (!key && isDev) {
    key = CLOUDFLARE_TEST_SECRET_KEY; // Cloudflare "Always Pass" secret key
    console.warn('⚠️ Using Cloudflare Always Pass secret key as fallback');
  }
  
  return key;
}

// Get the secret key with robust fallback handling
const SECRET_KEY = getSecretKey();

// Verification endpoint as specified in Cloudflare docs
const VERIFICATION_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Validate a Turnstile token using Cloudflare's verification API
 * @param token The token to validate
 * @param remoteip Optional IP address of the user
 * @returns An object with the validation result and details
 */
export async function validateTurnstileToken(
  token: string,
  remoteip?: string
): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  const secretKeyPreview = SECRET_KEY ? `${SECRET_KEY.substring(0, 5)}...${SECRET_KEY.substring(SECRET_KEY.length - 3)}` : 'Not set';
  console.log(`🔎 Validating Turnstile token: ${token.substring(0, 10)}...`);
  console.log(`🔑 Using secret key: ${secretKeyPreview}`);
  
  // Special case: If this is the Cloudflare test token and we're in development mode,
  // automatically validate it without making a request
  if (process.env.NODE_ENV === 'development' && token === CLOUDFLARE_TEST_SITE_KEY) {
    console.log('✅ Auto-validating Cloudflare test token in development mode');
    return {
      success: true,
      details: {
        auto_validated: true,
        success: true,
        token: token,
        challenge_ts: new Date().toISOString(),
        hostname: 'localhost',
        action: 'dev_auto_validate'
      }
    };
  }
  
  // Check if secret key is missing
  if (!SECRET_KEY) {
    console.error('❌ Turnstile secret key is not set');
    return {
      success: false,
      error: 'Turnstile secret key is not set',
      details: { 
        env: {
          NODE_ENV: process.env.NODE_ENV,
          TURNSTILE_SECRET_KEY_SET: !!process.env.TURNSTILE_SECRET_KEY,
          TURNSTILE_SECRET_KEY_DEV_SET: !!process.env.TURNSTILE_SECRET_KEY_DEV,
        }
      }
    };
  }
  
  try {
    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }
    
    // Make the request to Cloudflare's verification endpoint
    const response = await fetch(VERIFICATION_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `Verification API returned status ${response.status}`,
        details: { status: response.status, statusText: response.statusText }
      };
    }
    
    // Parse the response
    const data = await response.json();
    console.log('📊 Turnstile verification response:', data);
    
    // Return the verification result
    if (data.success) {
      return {
        success: true,
        details: data
      };
    } else {
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'Unknown verification failure',
        details: data
      };
    }
  } catch (error) {
    console.error('❌ Turnstile verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during verification',
      details: { error }
    };
  }
}

/**
 * Validate a token in development mode, with special handling for test tokens
 * @param token The token to validate
 * @returns A validation result
 */
export async function validateDevelopmentToken(token: string): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  // These are the official "Always Pass" tokens from Cloudflare
  const bypassTokens = [
    CLOUDFLARE_TEST_SITE_KEY,
    '1x0000000000000000000000',
    '1x00000000000000000000AB'
  ];
  
  // Automatically validate known testing tokens
  if (bypassTokens.includes(token)) {
    console.log('✅ Using Cloudflare testing token - automatically valid');
    return {
      success: true,
      details: { 
        method: 'bypass',
        token: token
      }
    };
  }
  
  // For other tokens, attempt the regular validation
  return validateTurnstileToken(token);
}

/**
 * Validate a Turnstile token with environment-aware logic
 * @param token The token to validate
 * @returns A validation result
 */
export async function validateToken(token: string): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  // In development, use special logic
  if (process.env.NODE_ENV === 'development') {
    return validateDevelopmentToken(token);
  }
  
  // In production, use standard validation
  return validateTurnstileToken(token);
}

export default validateToken; 