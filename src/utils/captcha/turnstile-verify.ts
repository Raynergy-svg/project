/**
 * Turnstile Server-Side Verification Utility
 * 
 * This file provides functions for verifying Turnstile tokens on the server-side
 * to prevent bypass attacks and ensure proper captcha validation.
 */

// The Turnstile secret key from environment variables
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';

// The Turnstile verification API endpoint
const VERIFICATION_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Special bypass tokens for development mode
const BYPASS_TOKENS = [
  '1x00000000000000000000AA',
  '1x0000000000000000000000', 
  '1x00000000000000000000AB',
  'bypass'
];

/**
 * Interface for Turnstile verification response
 */
interface TurnstileVerificationResponse {
  success: boolean;
  challenge_ts?: string; // ISO timestamp of the challenge
  hostname?: string;    // Hostname where the challenge was solved
  error_codes?: string[];
  action?: string;      // Action specified when rendering the widget
  cdata?: string;       // Customer data passed when rendering the widget
}

/**
 * Verify a Turnstile token server-side
 * 
 * @param token The token to verify
 * @param ip Optional IP address of the user (recommended)
 * @returns Response with success status and any error codes
 */
export async function verifyTurnstileToken(
  token: string, 
  ip?: string
): Promise<TurnstileVerificationResponse> {
  // Check for bypass tokens in development mode
  if (process.env.NODE_ENV === 'development' && 
      (process.env.DISABLE_TURNSTILE === 'true' || 
       process.env.SKIP_AUTH_CAPTCHA === 'true' || 
       BYPASS_TOKENS.includes(token))) {
    console.log('🔒 Turnstile: Using bypass token in development mode');
    return { success: true };
  }

  if (!TURNSTILE_SECRET_KEY) {
    console.error('🔒 Turnstile: Missing TURNSTILE_SECRET_KEY environment variable');
    return { 
      success: false, 
      error_codes: ['missing-secret-key'] 
    };
  }

  try {
    // Build the form data for verification
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    // Include IP address if provided (recommended by Cloudflare)
    if (ip) {
      formData.append('remoteip', ip);
    }

    // Make the verification request
    const response = await fetch(VERIFICATION_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const data = await response.json() as TurnstileVerificationResponse;
    
    if (!data.success) {
      console.error('🔒 Turnstile: Verification failed', data.error_codes);
    }
    
    return data;
  } catch (error) {
    console.error('🔒 Turnstile: Error during verification', error);
    return {
      success: false,
      error_codes: ['verification-error']
    };
  }
}

/**
 * Express/Next.js middleware for Turnstile verification
 * 
 * @param options Configuration options
 */
export function createTurnstileMiddleware(options: {
  tokenField?: string;      // Request field containing the token (default: 'captchaToken')
  requireToken?: boolean;   // Whether to require a token (default: true)
  errorStatus?: number;     // HTTP status to return on error (default: 403)
}) {
  const {
    tokenField = 'captchaToken',
    requireToken = true,
    errorStatus = 403
  } = options;
  
  return async (req: any, res: any, next?: Function) => {
    // Skip in development if disabled
    if (process.env.NODE_ENV === 'development' && 
        (process.env.DISABLE_TURNSTILE === 'true' || 
         process.env.SKIP_AUTH_CAPTCHA === 'true')) {
      if (next) next();
      return true;
    }
    
    // Get the token from the request
    const token = req.body?.[tokenField] || req.query?.[tokenField];
    
    // If token is required but not provided, return error
    if (requireToken && !token) {
      const error = { 
        success: false, 
        error: 'Missing Turnstile token',
        code: 'missing-token'
      };
      
      if (res.status) {
        return res.status(errorStatus).json(error);
      }
      
      return error;
    }
    
    // If token not required and not provided, skip verification
    if (!requireToken && !token) {
      if (next) next();
      return true;
    }
    
    // Verify the token
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const result = await verifyTurnstileToken(token, ip as string);
    
    if (result.success) {
      if (next) next();
      return true;
    } else {
      const error = {
        success: false,
        error: 'Turnstile verification failed',
        code: result.error_codes?.[0] || 'unknown'
      };
      
      if (res.status) {
        return res.status(errorStatus).json(error);
      }
      
      return error;
    }
  };
}

/**
 * Helper function to extract a Turnstile token from a request
 */
export function extractTurnstileToken(req: any): string | null {
  return (
    req.body?.captchaToken ||
    req.body?.turnstileToken ||
    req.query?.captchaToken ||
    req.query?.turnstileToken ||
    null
  );
} 