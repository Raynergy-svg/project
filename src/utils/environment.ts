/**
 * Environment Utility
 * 
 * Provides constants and utilities for working with different environments.
 */

// Check if we're in development mode
export const IS_DEV = 
  process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

// Check if we're in production mode
export const IS_PROD = 
  process.env.NODE_ENV === 'production' && 
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

// Check if we're in test mode
export const IS_TEST = process.env.NODE_ENV === 'test';

// Check if we're running on the server
export const IS_SERVER = typeof window === 'undefined';

// Check if we're running in the browser
export const IS_BROWSER = typeof window !== 'undefined';

// Get the current environment name
export const ENV_NAME = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development';

// Log environment information in development
if (IS_DEV && IS_BROWSER) {
  console.log('🌎 Environment:', {
    IS_DEV,
    IS_PROD,
    IS_TEST,
    IS_SERVER,
    IS_BROWSER,
    ENV_NAME,
  });
}

// Check if captcha should be disabled
export const DISABLE_CAPTCHA = IS_DEV || IS_TEST;

// Development login credentials that bypass normal auth
export const DEV_EMAIL = 'dev@example.com';
export const DEV_PASSWORD = 'development';

// App configuration
export const APP_NAME = 'FinWise';
export const APP_VERSION = '0.1.0';

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: !IS_DEV, // Disable analytics in development
  ENABLE_ERROR_TRACKING: !IS_DEV, // Disable error tracking in development
  ENABLE_CAPTCHA: false, // CAPTCHA is permanently disabled per project requirements, we use a bypass token directly
  ENABLE_AI_INSIGHTS: false,
  ENABLE_SAVINGS_PLANNER: false,
  ENABLE_ONBOARDING_TOUR: true,
  ENABLE_SECURITY_LOGGING: true,
};

/**
 * Helper function to log development-only messages
 */
export function logDev(message: string, data?: any) {
  if (IS_DEV) {
    if (data) {
      console.log(`[DEV] ${message}`, data);
    } else {
      console.log(`[DEV] ${message}`);
    }
  }
}

/**
 * Helper to conditionally return different values based on environment
 */
export function envValue<T>(devValue: T, prodValue: T): T {
  return IS_DEV ? devValue : prodValue;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureKey: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[featureKey];
}

/**
 * Environment detection utilities
 * These functions help determine the current environment and handle environment-specific logic
 */

// Add a check to detect which environment system we're using
const isNextJs = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RUNTIME === 'next';

/**
 * Checks if the application is running in development mode
 * This function will always return false in production builds due to tree-shaking
 */
export function isDevelopmentMode(): boolean {
  // Use the already defined IS_DEV constant for consistency
  return IS_DEV;
}

/**
 * Checks if the application is running in production mode
 */
export function isProductionMode(): boolean {
  return !IS_DEV;
}

// Export convenience functions
export const isTestMode = () => IS_TEST;
export const isBrowserEnvironment = () => IS_BROWSER;
export const isServerEnvironment = () => IS_SERVER; 