/**
 * Captcha utility functions and constants for SmartDebtFlow
 */

/**
 * hCaptcha site key - using production site key
 */
export const HCAPTCHA_SITE_KEY = '0x4AAAAAAA_KNHY49GyF-yvh';

/**
 * Fallback captcha marker prefix
 */
export const FALLBACK_PREFIX = 'fallback:';

/**
 * Interface for components that use captcha
 */
export interface CaptchaProps {
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  isCaptchaVerified: boolean;
  setIsCaptchaVerified: (verified: boolean) => void;
  isUsingFallback?: boolean;
  setIsUsingFallback?: (usingFallback: boolean) => void;
}

/**
 * Interface for captcha verification result from server
 */
export interface CaptchaVerificationResult {
  success: boolean;
  fallback: boolean;
  message: string;
}

/**
 * Handler for captcha verification events
 */
export const handleCaptchaVerify = (
  token: string,
  setCaptchaToken: (token: string | null) => void,
  setIsCaptchaVerified: (verified: boolean) => void,
  setIsUsingFallback?: (usingFallback: boolean) => void
) => {
  const isFallback = isTokenFromFallback(token);
  setCaptchaToken(token);
  setIsCaptchaVerified(true);
  
  if (setIsUsingFallback) {
    setIsUsingFallback(isFallback);
  }
};

/**
 * Handler for captcha expiration events
 */
export const handleCaptchaExpire = (
  setCaptchaToken: (token: string | null) => void,
  setIsCaptchaVerified: (verified: boolean) => void,
  setIsUsingFallback?: (usingFallback: boolean) => void
) => {
  setCaptchaToken(null);
  setIsCaptchaVerified(false);
  
  if (setIsUsingFallback) {
    setIsUsingFallback(false);
  }
};

/**
 * Add captcha token to Supabase auth options
 */
export const addCaptchaToOptions = (
  captchaToken: string | null,
  options?: Record<string, any>
): Record<string, any> => {
  return {
    ...options,
    captchaToken: captchaToken ? processCaptchaToken(captchaToken) : null,
  };
};

/**
 * Verify captcha token is present
 * @returns Error message if captcha is not verified, null if verified
 */
export const verifyCaptchaPresent = (captchaToken: string | null): string | null => {
  if (!captchaToken) {
    return 'Please complete the captcha verification before proceeding.';
  }
  return null;
};

/**
 * Check if a token is from the fallback captcha
 */
export const isTokenFromFallback = (token: string): boolean => {
  return token.startsWith(FALLBACK_PREFIX);
};

/**
 * Process captcha token before sending to server
 * This function strips the fallback prefix if present
 */
export const processCaptchaToken = (token: string): string => {
  if (isTokenFromFallback(token)) {
    // For server-side verification, we might want to keep the prefix
    // but if we need to strip it, uncomment the line below
    // return token.substring(FALLBACK_PREFIX.length);
    return token;
  }
  return token;
};

/**
 * Creates a fallback captcha token
 */
export const createFallbackToken = (value: string): string => {
  return `${FALLBACK_PREFIX}${value}`;
};

/**
 * Verify captcha token with server
 * This function calls our API endpoint to verify the token
 * 
 * @param token - The captcha token to verify (can be hCaptcha or fallback)
 * @returns Promise with verification result
 */
export const verifyTokenWithServer = async (token: string): Promise<CaptchaVerificationResult> => {
  try {
    const response = await fetch('/api/verify-captcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying captcha token:', error);
    return {
      success: false,
      fallback: isTokenFromFallback(token),
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}; 