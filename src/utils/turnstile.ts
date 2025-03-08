/**
 * Utilities for working with Cloudflare Turnstile
 */

// Get the site key from environment variables
export const TURNSTILE_SITE_KEY = 
  import.meta.env.VITE_TURNSTILE_SITE_KEY || 
  import.meta.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || 
  '0x4AAAAAAAK5LpjT0Jzv4jzl';

// Function to verify a Turnstile token with our backend
export async function verifyTurnstileToken(token: string, action?: string): Promise<{
  success: boolean;
  errors?: string[];
  message?: string;
}> {
  try {
    console.log(`Verifying Turnstile token for action: ${action || 'unknown'}`);
    
    const response = await fetch('/api/auth/verify-turnstile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        action,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Turnstile verification failed:', data);
      return {
        success: false,
        message: data.error || 'Verification failed',
        errors: data.errors || ['unknown_error']
      };
    }

    return {
      success: true,
      message: 'Verification successful'
    };
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return {
      success: false,
      message: 'Verification service error',
      errors: ['network_error']
    };
  }
}

// Function to render the Turnstile widget programmatically 
// (for use in non-React contexts)
export function renderTurnstile(
  container: string | HTMLElement, 
  callback: (token: string) => void,
  options: Record<string, any> = {}
): string | null {
  if (!window.turnstile) {
    console.error('Turnstile not loaded');
    return null;
  }

  try {
    const widgetId = window.turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      callback,
      ...options
    });
    
    return widgetId;
  } catch (error) {
    console.error('Failed to render Turnstile widget:', error);
    return null;
  }
}

// Function to check if Turnstile is disabled in development mode
export function isTurnstileDisabled(): boolean {
  const skipCaptcha = 
    import.meta.env.VITE_SKIP_AUTH_CAPTCHA === 'true' || 
    import.meta.env.NEXT_PUBLIC_SKIP_AUTH_CAPTCHA === 'true' ||
    import.meta.env.SUPABASE_AUTH_CAPTCHA_DISABLE === 'true' ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE === 'true';
  
  // Always enable in production
  if (import.meta.env.PROD) {
    return false;
  }
  
  return skipCaptcha;
}

// Function to generate a bypass token for development mode
export function generateBypassToken(): string {
  if (!isTurnstileDisabled()) {
    throw new Error('Cannot generate bypass token when Turnstile is enabled');
  }
  
  return 'BYPASS_CAPTCHA_FOR_SELF_HOSTED';
} 