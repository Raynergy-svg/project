// This adapter provides compatibility between Vite's import.meta.env and Next.js process.env

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Is development mode?
export const IS_DEV = process.env.NODE_ENV === 'development';

// Is production mode?
export const IS_PROD = process.env.NODE_ENV === 'production';

// Is test mode?
export const IS_TEST = process.env.NODE_ENV === 'test';

// Get environment variables with fallbacks
export function getEnv(key: string, fallback = ''): string {
  // For Vite style env vars (VITE_*)
  if (typeof process !== 'undefined' && process.env) {
    if (key.startsWith('VITE_')) {
      const nextKey = `NEXT_PUBLIC_${key.substring(5)}`;
      return process.env[nextKey] || process.env[key] || fallback;
    }
    return process.env[key] || fallback;
  }
  
  return fallback;
}

// Check if we're in development mode
export function isDevelopmentMode(): boolean {
  return IS_DEV;
}

// Check if we're in production mode
export function isProductionMode(): boolean {
  return IS_PROD;
}

// Environment check for features
export function isFeatureEnabled(featureName: string): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${featureName.toUpperCase()}`;
  return getEnv(envKey, 'false').toLowerCase() === 'true';
}

// Get base URL depending on environment
export function getBaseUrl(): string {
  if (isBrowser) {
    return window.location.origin;
  }
  return IS_PROD
    ? 'https://yourproductiondomain.com'  // Replace with your production domain
    : 'http://localhost:3001';            // Development URL
} 