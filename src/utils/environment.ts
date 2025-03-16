/**
 * Environment detection utilities
 * These functions help determine the current environment and handle environment-specific logic
 */

/**
 * Checks if the application is running in development mode
 * This function will always return false in production builds due to tree-shaking
 */
export function isDevelopmentMode(): boolean {
  try {
    // Check if import.meta.env exists and handle undefined properties
    const env = import.meta.env || {};
    
    // Next.js uses NODE_ENV instead of PROD/DEV
    // First check for Next.js environment variables
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    
    // Then fall back to Vite-style environment variables if they exist
    if (env.PROD === true) {
      return false;
    }
    
    // Additional runtime checks to ensure we're truly in development
    return (env.DEV === true || process.env.NODE_ENV === 'development') && 
           (env.MODE !== 'production' && process.env.NODE_ENV !== 'production');
  } catch (e) {
    // If anything fails, assume development mode in non-production environments
    return process.env.NODE_ENV !== 'production';
  }
}

/**
 * Checks if the application is running in production mode
 */
export function isProductionMode(): boolean {
  return !isDevelopmentMode();
}

// For convenience, provide pre-evaluated constants
export const IS_DEV = isDevelopmentMode();
export const IS_PROD = isProductionMode(); 