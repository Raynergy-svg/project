/**
 * Type definitions for environment variables
 * 
 * This file provides TypeScript type definitions for environment variables 
 * to ensure consistent usage across the application.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Node environment
    NODE_ENV: 'development' | 'production' | 'test';
    
    // Supabase settings
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    
    // Authentication options
    NEXT_PUBLIC_SKIP_AUTH_CAPTCHA?: string;
    NEXT_PUBLIC_ENABLE_CAPTCHA?: string;
    
    // Turnstile/Captcha configuration
    NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
    TURNSTILE_SECRET_KEY?: string;
    NEXT_PUBLIC_ENABLE_TURNSTILE?: string;
    
    // Analytics
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
    
    // URLs
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_API_URL?: string;
    
    // Other
    NEXT_PUBLIC_SUPABASE_JS_VERSION?: string;
  }
}

// Additional type for accessing environment variables in client code
interface EnvVariables {
  // Node environment
  NODE_ENV: string;
  
  // Supabase settings
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Feature flags
  SKIP_AUTH_CAPTCHA: boolean;
  ENABLE_CAPTCHA: boolean;
  ENABLE_TURNSTILE: boolean;
  ENABLE_ANALYTICS: boolean;
  
  // URLs
  APP_URL: string;
  API_URL: string;
  
  // Turnstile/Captcha
  TURNSTILE_SITE_KEY: string;
}

// Global declaration for window.__ENV
interface Window {
  __ENV?: EnvVariables;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
} 