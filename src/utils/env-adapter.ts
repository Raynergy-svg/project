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
  ENABLE_TURNSTILE: boolean;
  ENABLE_CAPTCHA: boolean;
  ENABLE_ANALYTICS: boolean;
  
  // Turnstile
  TURNSTILE_SITE_KEY: string;
  
  // URLs
  APP_URL: string;
  API_URL: string;
  
  // Build modes
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Optional environment-specific variables
  [key: string]: any;
}

// Access environment variables based on platform
const getEnvValue = (key: string, defaultValue?: any): any => {
  // Access env variables in different contexts

  // Server-side: Use process.env directly
  if (typeof window === 'undefined') {
    return process.env[`NEXT_PUBLIC_${key}`] || process.env[key] || defaultValue;
  }
  
  // Client-side: Try multiple sources
  
  // 1. Check process.env (for Next.js)
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
  
  // 2. Try to get from Next.js data if available
  try {
    if (window && (window as any).__NEXT_DATA__?.props?.pageProps?.env) {
      const nextKey = `NEXT_PUBLIC_${key}`;
      const envData = (window as any).__NEXT_DATA__.props.pageProps.env;
      if (envData[nextKey] !== undefined) {
        return envData[nextKey];
      }
      if (envData[key] !== undefined) {
        return envData[key];
      }
    }
  } catch (e) {
    // Silently fail and continue with other methods
  }
  
  // 3. Check for globally defined variables (sometimes set by the app)
  if ((window as any)[`NEXT_PUBLIC_${key}`]) {
    return (window as any)[`NEXT_PUBLIC_${key}`];
  }
  if ((window as any)[key]) {
    return (window as any)[key];
  }
  
  // 4. Check window.__ENV
  if ((window as any).__ENV && (window as any).__ENV[key] !== undefined) {
    return (window as any).__ENV[key];
  }
  
  // 5. Return default value if nothing found
  return defaultValue;
};

// Parse the environment variables
export const ENV: EnvVariables = {
  // Supabase
  SUPABASE_URL: getEnvValue('SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvValue('SUPABASE_ANON_KEY', ''),
  
  // URLs
  APP_URL: getEnvValue('APP_URL', 'http://localhost:3000'),
  API_URL: getEnvValue('API_URL', ''),
  
  // Feature flags
  SKIP_AUTH_CAPTCHA: getEnvValue('SKIP_AUTH_CAPTCHA', 'false') === 'true',
  ENABLE_TURNSTILE: getEnvValue('ENABLE_TURNSTILE', 'true') === 'true',
  ENABLE_CAPTCHA: getEnvValue('ENABLE_CAPTCHA', 'true') === 'true',
  ENABLE_ANALYTICS: getEnvValue('ENABLE_ANALYTICS', 'false') === 'true',
  
  // Turnstile
  TURNSTILE_SITE_KEY: getEnvValue('TURNSTILE_SITE_KEY', ''),
  
  // Build modes
  NODE_ENV: getEnvValue('NODE_ENV', 'development') as 'development' | 'production' | 'test',
};

// Export the individual getter function for cases where you need dynamic values
export { getEnvValue };

// Default export
export default ENV; 