/**
 * Environment variable adapter to handle differences between Vite and Next.js
 * This helps provide a consistent interface regardless of the build system
 */

// Define the shape of our environment variables
interface EnvVariables {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Feature flags
  SKIP_AUTH_CAPTCHA: boolean;
  
  // Build modes
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Optional environment-specific variables
  [key: string]: any;
}

// Access environment variables based on platform
const getEnvValue = (key: string, defaultValue?: any): any => {
  // Next.js
  if (typeof process !== 'undefined' && process.env) {
    // NEXT_PUBLIC_ prefix required for client-side access
    const nextKey = `NEXT_PUBLIC_${key}`;
    if (process.env[nextKey] !== undefined) {
      return process.env[nextKey];
    }
    if (process.env[key] !== undefined) {
      return process.env[key];
    }
  }

  // Vite (fallback for compatibility)
  // @ts-ignore - Vite specific global
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore - Vite specific environment variables
    const viteKey = `VITE_${key}`;
    // @ts-ignore - Vite specific environment variables
    if (import.meta.env[viteKey] !== undefined) {
      // @ts-ignore - Vite specific environment variables
      return import.meta.env[viteKey];
    }
    // @ts-ignore - Vite specific environment variables
    if (import.meta.env[key] !== undefined) {
      // @ts-ignore - Vite specific environment variables
      return import.meta.env[key];
    }
  }

  // Default value as fallback
  return defaultValue;
};

// Create an object with all environment variables
export const ENV: EnvVariables = {
  // Supabase configuration
  SUPABASE_URL: getEnvValue('SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvValue('SUPABASE_ANON_KEY', ''),
  
  // Feature flags
  SKIP_AUTH_CAPTCHA: getEnvValue('SKIP_AUTH_CAPTCHA', 'true') === 'true',
  
  // Build mode
  NODE_ENV: (getEnvValue('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
}; 