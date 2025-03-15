/**
 * Supabase Authentication Helpers
 * 
 * Provides simplified authentication functions for use throughout the application.
 * This abstraction layer makes it easier to work with Supabase Auth in both 
 * development and production environments.
 */

import { supabase } from '@/utils/supabase/client';
import { getSupabaseCaptchaToken, IS_DEV } from '@/utils/turnstile';

/**
 * Sign in a user with email and password
 */
export async function signInWithEmail(
  email: string, 
  password: string,
  options?: { 
    captchaToken?: string;
    redirectTo?: string;
  }
) {
  try {
    // In development, we may need to handle captcha explicitly
    if (IS_DEV && process.env.ENABLE_TURNSTILE_IN_DEV === 'true' && !options?.captchaToken) {
      // Get a captcha token automatically if one wasn't provided
      const captchaToken = await getSupabaseCaptchaToken();
      
      console.log('🔒 Auth: Using auto-generated captcha token for signin');
      
      return supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
          redirectTo: options?.redirectTo
        }
      });
    }
    
    // Standard sign-in with optional captcha token if provided
    return supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: options?.captchaToken,
        redirectTo: options?.redirectTo
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string, 
  password: string,
  options?: {
    captchaToken?: string;
    redirectTo?: string;
    data?: Record<string, any>;
  }
) {
  try {
    // In development, we may need to handle captcha explicitly
    if (IS_DEV && process.env.ENABLE_TURNSTILE_IN_DEV === 'true' && !options?.captchaToken) {
      // Get a captcha token automatically if one wasn't provided
      const captchaToken = await getSupabaseCaptchaToken();
      
      console.log('🔒 Auth: Using auto-generated captcha token for signup');
      
      return supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          redirectTo: options?.redirectTo,
          data: options?.data
        }
      });
    }
    
    // Standard sign-up with optional captcha token if provided
    return supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: options?.captchaToken,
        redirectTo: options?.redirectTo,
        data: options?.data
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Reset a user's password
 */
export async function resetPassword(
  email: string,
  options?: {
    captchaToken?: string;
    redirectTo?: string;
  }
) {
  try {
    // In development, we may need to handle captcha explicitly
    if (IS_DEV && process.env.ENABLE_TURNSTILE_IN_DEV === 'true' && !options?.captchaToken) {
      // Get a captcha token automatically if one wasn't provided
      const captchaToken = await getSupabaseCaptchaToken();
      
      console.log('🔒 Auth: Using auto-generated captcha token for password reset');
      
      return supabase.auth.resetPasswordForEmail(email, {
        captchaToken,
        redirectTo: options?.redirectTo
      });
    }
    
    // Standard password reset with optional captcha token if provided
    return supabase.auth.resetPasswordForEmail(email, {
      captchaToken: options?.captchaToken,
      redirectTo: options?.redirectTo
    });
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  return supabase.auth.getSession();
}

/**
 * Get the current user
 */
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Update the current user's data
 */
export async function updateUserData(data: Record<string, any>) {
  return supabase.auth.updateUser({ data });
} 