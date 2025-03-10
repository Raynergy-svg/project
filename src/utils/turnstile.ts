/**
 * Utilities for working with Cloudflare Turnstile
 */

// Import our centralized environment configuration
import { ENV, getEnv } from './env-config';

// Get the site key from environment variables
export const TURNSTILE_SITE_KEY = ENV.TURNSTILE_SITE_KEY;

// Function to verify a Turnstile token with our backend
export async function verifyTurnstileToken(token: string, action?: string): Promise<{
  success: boolean;
  errors?: string[];
  message?: string;
}> {
  try {
    // If captcha is disabled in development, return success
    if (isTurnstileDisabled()) {
      return { success: true };
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('secret', ENV.TURNSTILE_SECRET_KEY);
    
    if (action) {
      formData.append('action', action);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!data.success) {
      console.error('Turnstile verification failed:', data);
      return {
        success: false,
        errors: data['error-codes'] || ['unknown_error'],
        message: 'Security verification failed. Please try again.'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error verifying turnstile token:', error);
    return {
      success: false,
      errors: ['verification_error'],
      message: 'Security verification failed. Please try again.'
    };
  }
}

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

// Check if Turnstile should be disabled (for development)
export function isTurnstileDisabled(): boolean {
  return ENV.SKIP_AUTH_CAPTCHA || ENV.SUPABASE_AUTH_CAPTCHA_DISABLE;
}

// Generate a bypass token for development
export function generateBypassToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 40; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
} 