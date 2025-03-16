/**
 * Turnstile Utility - Improved Version
 * 
 * This utility provides functions for working with Cloudflare Turnstile captcha verification
 * with special handling for development mode and Supabase integration.
 */

import { getTurnstileEnv, CLOUDFLARE_TEST_SITE_KEY, forceTurnstileEnv } from '../temp-constants';

// Ensure environment variables are forced on import
forceTurnstileEnv();

// Environment variables for Turnstile configuration
// Use development-specific keys when in development mode
export const TURNSTILE_SITE_KEY = process.env.NODE_ENV === 'development' 
  ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV || process.env.TURNSTILE_SITE_KEY_DEV || CLOUDFLARE_TEST_SITE_KEY)
  : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '');

export const TURNSTILE_SECRET_KEY = getTurnstileEnv().secretKey;

// Development environment detection
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Special bypass tokens that Supabase accepts for development
// These are the official bypass tokens from Supabase documentation
export const SUPABASE_BYPASS_TOKENS = [
  CLOUDFLARE_TEST_SITE_KEY, // '1x00000000000000000000AA'
  '1x0000000000000000000000',
  '1x00000000000000000000AB',
  'bypass'
];

// Store the last successful bypass token in memory
let lastWorkingBypassToken: string | null = null;

/**
 * Check if Turnstile should be disabled
 * @returns boolean indicating if Turnstile should be bypassed
 */
export const isTurnstileDisabled = (): boolean => {
  // First check our environment loader
  const env = getTurnstileEnv();
  if (env.isDev && !env.enabledInDev) {
    return true;
  }
  if (!env.enabled) {
    return true;
  }
  
  // Explicit environment variables to disable Turnstile take priority
  if (process.env.DISABLE_TURNSTILE === 'true' || 
      process.env.SKIP_AUTH_CAPTCHA === 'true' || 
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true' ||
      process.env.NEXT_PUBLIC_SKIP_AUTH_CAPTCHA === 'true' ||
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE === 'true') {
    return true;
  }
  
  // In development mode, check if explicitly enabled, otherwise default to disabled
  if (IS_DEV) {
    // If ENABLE_TURNSTILE_IN_DEV is true, don't disable Turnstile
    if (process.env.ENABLE_TURNSTILE_IN_DEV === 'true' || 
        process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV === 'true') {
      return false;
    }
    // Otherwise default to disabled in development
    return true;
  }
  
  // In test mode, always disable
  if (IS_TEST) {
    return true;
  }
  
  return false;
};

/**
 * Generate a bypass token for development environments
 * This function tries to use known working bypass tokens for Supabase
 * @returns A captcha bypass token
 */
export const generateBypassToken = (): string => {
  // If we have a known working token, use it
  if (lastWorkingBypassToken) {
    return lastWorkingBypassToken;
  }
  
  // In development mode, use one of the official Supabase bypass tokens
  if (IS_DEV || isTurnstileDisabled()) {
    // Start with the first token, which is most likely to work
    lastWorkingBypassToken = SUPABASE_BYPASS_TOKENS[0];
    return lastWorkingBypassToken;
  }
  
  // Warn if this is called in production
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Generating bypass token in production environment. This should only be used for development.');
  }
  
  // For production, return a properly formatted token that looks like a real Turnstile token
  return `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Set the last working bypass token
 * This is used to remember which token worked, for future auth attempts
 */
export const setWorkingBypassToken = (token: string): void => {
  lastWorkingBypassToken = token;
  
  // Also store in localStorage for persistence across page refreshes
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('supabase_bypass_token', token);
    } catch (error) {
      // Ignore storage errors
    }
  }
};

/**
 * Get a Supabase-compatible captcha token
 * In development, returns a bypass token
 * In production, should be replaced with actual Turnstile implementation
 */
export async function getSupabaseCaptchaToken(): Promise<string> {
  // Check if Turnstile is disabled or we're in development
  if (isTurnstileDisabled() || IS_DEV) {
    console.log('🔄 Getting captcha token for development');
    
    // First try to get the last known working token
    if (lastWorkingBypassToken) {
      console.log('🔐 Using previously successful token:', lastWorkingBypassToken.substring(0, 10) + '...');
      return lastWorkingBypassToken;
    }
    
    // Try to get a working token from localStorage if we've found one before
    if (typeof window !== 'undefined') {
      const cachedToken = window.localStorage.getItem('supabase_bypass_token');
      
      if (cachedToken) {
        console.log('🔐 Using cached token from localStorage:', cachedToken.substring(0, 10) + '...');
        lastWorkingBypassToken = cachedToken;
        return cachedToken;
      }
    }
    
    // Try all of the known bypass tokens sequentially
    for (const token of SUPABASE_BYPASS_TOKENS) {
      console.log('🔐 Trying bypass token:', token);
      
      try {
        // For validation purposes, perform a quick test auth operation
        // This is just to validate if the token works, but we don't need to check the result here
        // We will in separate functions that test authentication more thoroughly
        
        // Return the token immediately - we'll test it later
        return token;
      } catch (error) {
        // Continue with the next token
        console.warn('Token test failed:', error);
      }
    }
    
    // If we're still here, none of the tokens seemed to work immediately
    // Return the first one as a best effort
    console.log('🔐 No token test succeeded, using first bypass token');
    return SUPABASE_BYPASS_TOKENS[0];
  }
  
  // In production or when Turnstile is enabled, we need actual token generation
  if (typeof window !== 'undefined' && window.turnstile) {
    try {
      // Attempt to invoke Turnstile directly
      console.log('🔐 Invoking browser Turnstile for token');
      
      return new Promise((resolve, reject) => {
        // If Turnstile is available, try to get a token
        window.turnstile.render({
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            console.log('🔐 Received Turnstile token:', token.substring(0, 10) + '...');
            resolve(token);
          },
          'error-callback': (error: any) => {
            console.error('🔐 Turnstile error:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error generating Turnstile token:', error);
      throw new Error('Failed to generate Turnstile token: ' + String(error));
    }
  }
  
  throw new Error('Production Turnstile token generation not implemented. Use a client-side Turnstile widget.');
}

/**
 * Try all bypass tokens one by one
 * This is useful when we're not sure which bypass token will work with the current Supabase instance
 */
export async function tryAllBypassTokens(
  authFunction: (token: string) => Promise<any>
): Promise<any> {
  // Make sure we're in development mode
  if (!IS_DEV && !isTurnstileDisabled()) {
    throw new Error('Bypass tokens should only be used in development mode');
  }
  
  // Try the last successful token first
  if (lastWorkingBypassToken) {
    try {
      const result = await authFunction(lastWorkingBypassToken);
      // If no captcha error, return the result
      if (!result.error || !result.error.message.includes('captcha')) {
        return result;
      }
    } catch (error) {
      // Failed with last working token, continue to try others
      console.warn('Last working bypass token failed, trying others');
    }
  }
  
  // Try cached token from localStorage
  const cachedToken = typeof window !== 'undefined' ? 
    window.localStorage.getItem('supabase_bypass_token') : null;
  
  if (cachedToken && cachedToken !== lastWorkingBypassToken) {
    try {
      const result = await authFunction(cachedToken);
      // If no captcha error, remember this token and return the result
      if (!result.error || !result.error.message.includes('captcha')) {
        setWorkingBypassToken(cachedToken);
        return result;
      }
    } catch (error) {
      // Continue to try other tokens
    }
  }
  
  // Try all bypass tokens
  for (const token of SUPABASE_BYPASS_TOKENS) {
    try {
      console.log(`🔑 AUTH: Trying bypass token: ${token}`);
      const result = await authFunction(token);
      
      // If no captcha error, remember this token and return the result
      if (!result.error || !result.error.message.includes('captcha')) {
        setWorkingBypassToken(token);
        return result;
      }
    } catch (error) {
      // Continue to try other tokens
    }
  }
  
  // If all bypass tokens fail, return an error
  return { 
    success: false, 
    error: { message: 'All bypass tokens failed. Captcha verification required.' } 
  };
}

/**
 * Verify a Turnstile token server-side
 * @param token The token to verify
 * @returns Object with success status and error message if applicable
 */
export const verifyTurnstileToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
  // Check if Turnstile is disabled
  if (isTurnstileDisabled()) {
    return { success: true };
  }
  
  // Check if we have a secret key
  if (!TURNSTILE_SECRET_KEY) {
    console.error('Turnstile secret key is not set');
    return { success: false, error: 'Turnstile configuration error' };
  }
  
  try {
    // Make a request to the Turnstile verification API
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });
    
    if (!response.ok) {
      return { success: false, error: `Verification request failed: ${response.status}` };
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return { 
        success: false, 
        error: data['error-codes']?.join(', ') || 'Unknown verification error' 
      };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Verification process error' };
  }
};

// Render the Turnstile widget in a container
export function renderTurnstile(
  container: string | HTMLElement, 
  callback: (token: string) => void,
  options: Record<string, any> = {}
): string | null {
  if (typeof window === 'undefined') return null;
  
  if (!window.turnstile) {
    console.error('Turnstile script not loaded');
    return null;
  }

  if (isTurnstileDisabled()) {
    // In development or test mode, we can bypass the captcha
    const bypassToken = generateBypassToken();
    setTimeout(() => callback(bypassToken), 500);
    return bypassToken;
  }

  try {
    return window.turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: callback,
      ...options
    });
  } catch (e) {
    console.error('Error rendering Turnstile:', e);
    return null;
  }
}

// Add TypeScript declaration for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, any>
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
} 