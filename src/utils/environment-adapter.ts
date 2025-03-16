/**
 * Environment Adapter
 * 
 * This adapter provides compatibility between Vite's import.meta.env and Next.js process.env
 * It creates a unified interface for accessing environment variables regardless of the build system.
 */

// Import the lightweight constants
import { IS_DEV, IS_PROD, getEnvSafe } from './env-constants';

// Define an interface that matches both Vite and Next.js env properties
interface EnvAdapter {
  // Common environment flags
  DEV: boolean;
  PROD: boolean;
  MODE: string;
  // Environment variables (using string indexing)
  [key: string]: any;
}

/**
 * Creates a unified environment object that works in both Next.js and Vite
 */
function createEnvAdapter(): EnvAdapter {
  // Start with a base object using our lightweight constants
  const adapter: EnvAdapter = {
    DEV: IS_DEV,
    PROD: IS_PROD,
    MODE: IS_DEV ? 'development' : 'production',
  };
  
  // Just add a few essential variables that are commonly used
  const essentialVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'API_URL',
    'APP_URL'
  ];
  
  // Add essential variables
  essentialVars.forEach(key => {
    adapter[key] = getEnvSafe(key);
  });
  
  return adapter;
}

// Create a singleton instance
export const env = createEnvAdapter();

// Convenience methods
export const isDev = IS_DEV;
export const isProd = IS_PROD;

// Export default for convenience
export default env; 