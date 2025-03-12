/**
 * Turnstile Utility - Improved Version
 * 
 * This utility provides functions for working with Cloudflare Turnstile captcha verification
 * with special handling for development mode and Supabase integration.
 */

// Environment variables for Turnstile configuration
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';

// Development environment detection
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Special bypass tokens that Supabase accepts for development
// These are the official bypass tokens from Supabase documentation
export const SUPABASE_BYPASS_TOKENS = [
  '1x00000000000000000000AA',
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
  // Explicit environment variables to disable Turnstile take priority
  if (process.env.DISABLE_TURNSTILE === 'true' || 
      process.env.SKIP_AUTH_CAPTCHA === 'true' || 
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true' ||
      process.env.NEXT_PUBLIC_SKIP_AUTH_CAPTCHA === 'true' ||
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE === 'true') {
    return true;
  }
  
  // In development mode, default to disabled unless explicitly enabled
  if (IS_DEV && process.env.ENABLE_TURNSTILE_IN_DEV !== 'true') {
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
    // First try to get the last known working token
    if (lastWorkingBypassToken) {
      return lastWorkingBypassToken;
    }
    
    // Try to get a working token from localStorage if we've found one before
    const cachedToken = typeof window !== 'undefined' ? 
      window.localStorage.getItem('supabase_bypass_token') : null;
    
    if (cachedToken) {
      lastWorkingBypassToken = cachedToken;
      return cachedToken;
    }
    
    // If no cached token, use the first bypass token
    // The auth function will try others if this fails
    return generateBypassToken();
  }
  
  // In production, we need to implement actual token generation
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