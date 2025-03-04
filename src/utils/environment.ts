/**
 * Environment detection utilities
 * These functions help determine the current environment and handle environment-specific logic
 */

/**
 * Checks if the application is running in development mode
 * This function will always return false in production builds due to tree-shaking
 */
export function isDevelopmentMode(): boolean {
  // This condition will be evaluated at build time and completely removed in production builds
  if (import.meta.env.PROD) {
    return false;
  }
  
  // Additional runtime checks to ensure we're truly in development
  return import.meta.env.DEV && import.meta.env.MODE !== 'production';
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