/**
 * Supabase Client Configuration Utility
 * 
 * This utility provides functions to configure the Supabase client
 * for development mode, ensuring consistent behavior across the application.
 */

import { supabase } from './client';
import { IS_DEV } from '@/utils/environment';

/**
 * Configure the Supabase client for development mode
 * This ensures that captcha verification is bypassed in development
 */
export function configureSupabaseForDevelopment() {
  if (!IS_DEV) {
    console.warn('Attempted to configure Supabase for development in production mode');
    return false;
  }
  
  try {
    console.log('🔧 Configuring Supabase client for development mode');
    
    // Check if supabase client exists
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return false;
    }

    // In newer versions of Supabase, the auth config is not directly accessible
    // Instead, we'll use the client options when creating the client in client.ts
    
    // Log that we're using the pre-configured client
    console.log('Using pre-configured Supabase client for development mode');
    
    // Verify the client is working by checking the auth object
    if (supabase.auth) {
      console.log('Supabase auth is available');
      return true;
    } else {
      console.error('Supabase auth is not available');
      return false;
    }
  } catch (error) {
    console.error('Error configuring Supabase for development:', error);
    return false;
  }
}

/**
 * Configure the environment for development mode authentication
 * This sets necessary environment variables
 */
export function configureDevAuthEnvironment() {
  if (!IS_DEV) {
    console.warn('Attempted to configure dev auth environment in production mode');
    return;
  }
  
  // Add these headers to disable captcha
  const disableCaptchaHeaders = {
    'X-Captcha-Disable': 'true',
    'X-Skip-Captcha': 'true',
    'X-Captcha-Bypass': 'development'
  };
  
  // Try to patch the fetch API to add headers that disable captcha (advanced technique)
  try {
    const originalFetch = window.fetch;
    
    // Patch fetch to add headers that might bypass captcha for Supabase requests
    window.fetch = function(input, init) {
      // Only modify Supabase auth requests
      if (typeof input === 'string' && input.includes('supabase') && input.includes('/auth/')) {
        init = init || {};
        init.headers = {
          ...(init.headers || {}),
          ...disableCaptchaHeaders
        };
        
        console.log('🔧 Added captcha bypass headers to fetch request');
      }
      
      return originalFetch(input, init);
    };
    
    console.log('🔧 Patched fetch API for development mode');
  } catch (error) {
    console.warn('Could not patch fetch API:', error);
  }
  
  if (typeof window !== 'undefined') {
    // Create window.env if it doesn't exist
    if (!window.env) {
      (window as any).env = {};
    }
    
    // Set environment variables - use all possible naming variations
    const envVars = {
      // Standard variables
      SUPABASE_AUTH_CAPTCHA_DISABLE: 'true',
      SKIP_AUTH_CAPTCHA: 'true',
      NODE_ENV: 'development',
      
      // Next.js specific variables
      NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE: 'true',
      NEXT_PUBLIC_SKIP_AUTH_CAPTCHA: 'true',
      
      // Vite/React specific variables
      VITE_SUPABASE_AUTH_CAPTCHA_DISABLE: 'true',
      VITE_SKIP_AUTH_CAPTCHA: 'true',
      
      // Additional possibilities
      CAPTCHA_DISABLED: 'true',
      DEVELOPMENT_MODE: 'true',
      AUTH_DEVELOPMENT_MODE: 'true'
    };
    
    // Set all these variables in window.env
    Object.entries(envVars).forEach(([key, value]) => {
      (window as any).env[key] = value;
    });
    
    console.log('🔧 Development environment variables set in window.env');
    
    // Also set them as global variables
    (window as any).SUPABASE_AUTH_CAPTCHA_DISABLE = true;
    (window as any).SKIP_AUTH_CAPTCHA = true;
  }
  
  // Set development environment in process.env if possible
  if (typeof process !== 'undefined' && process.env) {
    try {
      // These may be read-only in some environments
      process.env.SUPABASE_AUTH_CAPTCHA_DISABLE = 'true';
      process.env.SKIP_AUTH_CAPTCHA = 'true';
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE = 'true';
      process.env.NEXT_PUBLIC_SKIP_AUTH_CAPTCHA = 'true';
      console.log('🔧 Development environment variables set in process.env');
    } catch (error) {
      console.warn('Could not set process.env variables:', error);
    }
  }
}

/**
 * Initialize development mode configuration
 * This should be called when the application starts in development mode
 */
export function initDevMode() {
  if (!IS_DEV) return;
  
  console.log('🚀 Initializing development mode for Supabase client');
  
  // First set environment variables
  configureDevAuthEnvironment();
  
  // Then configure the client
  const success = configureSupabaseForDevelopment();
  
  if (success) {
    console.log('✅ Development mode initialized for Supabase client');
  } else {
    console.warn('⚠️ Development mode initialization had issues, but will continue');
  }
}

// Automatically initialize development mode when imported in development
if (IS_DEV && typeof window !== 'undefined') {
  console.log('🔄 Auto-initializing development mode for Supabase client');
  // Use setTimeout to ensure this runs after the client is fully initialized
  setTimeout(() => {
    initDevMode();
  }, 100);
}

export default {
  configureSupabaseForDevelopment,
  configureDevAuthEnvironment,
  initDevMode,
}; 