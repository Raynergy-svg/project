/**
 * Captcha utility functions and constants for SmartDebtFlow
 */

/**
 * hCaptcha site key - using production site key
 */
export const HCAPTCHA_SITE_KEY = '0x4AAAAAAA_KNHY49GyF-yvh';

/**
 * Interface for components that use captcha
 */
export interface CaptchaProps {
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  isCaptchaVerified: boolean;
  setIsCaptchaVerified: (verified: boolean) => void;
}

/**
 * Handler for captcha verification events
 */
export const handleCaptchaVerify = (
  token: string,
  setCaptchaToken: (token: string | null) => void,
  setIsCaptchaVerified: (verified: boolean) => void
) => {
  setCaptchaToken(token);
  setIsCaptchaVerified(true);
};

/**
 * Handler for captcha expiration events
 */
export const handleCaptchaExpire = (
  setCaptchaToken: (token: string | null) => void,
  setIsCaptchaVerified: (verified: boolean) => void
) => {
  setCaptchaToken(null);
  setIsCaptchaVerified(false);
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
    captchaToken: captchaToken,
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