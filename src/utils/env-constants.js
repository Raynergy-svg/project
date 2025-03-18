/**
 * Simple environment constants that avoid circular dependencies
 * and don't rely on import.meta.env
 */

export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";

// Base URLs
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Feature flags
export const ENABLE_ANALYTICS = IS_PROD;
export const ENABLE_ENCRYPTION = true;
export const MOCK_SUPABASE = false;

// Debug modes
export const DEBUG_AUTH = false;
export const DEBUG_ROUTER = false;

// Safe access to environment variables with fallbacks
export function getEnvSafe(key, fallback = "") {
  // For browser environments
  if (typeof window !== "undefined") {
    // Check for Next.js prefixed variables first
    if (typeof window[`NEXT_PUBLIC_${key}`] !== "undefined") {
      return window[`NEXT_PUBLIC_${key}`];
    }

    // Then check for direct variables
    if (typeof window[key] !== "undefined") {
      return window[key];
    }

    // Check window.__ENV if available
    if (window.__ENV && typeof window.__ENV[key] !== "undefined") {
      return window.__ENV[key];
    }
  }

  // For Node.js/server environments
  if (typeof process !== "undefined" && process.env) {
    // Check for Next.js public variables
    if (typeof process.env[`NEXT_PUBLIC_${key}`] !== "undefined") {
      return process.env[`NEXT_PUBLIC_${key}`];
    }

    // Check for direct environment variables
    if (typeof process.env[key] !== "undefined") {
      return process.env[key];
    }
  }

  // Return fallback if not found
  return fallback;
}

// Hard-coded critical values for development
export const SUPABASE_URL = IS_DEV
  ? getEnvSafe("SUPABASE_URL", "https://awxsrdtfystzsndjmygz.supabase.co")
  : getEnvSafe("SUPABASE_URL", "");

export const SUPABASE_ANON_KEY = IS_DEV
  ? getEnvSafe(
      "SUPABASE_ANON_KEY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eHNyZHRmeXN0enNuZGpteWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzU3MzMsImV4cCI6MjA1NzY1MTczM30.AXMSq7TQjuuBOc_LvoDkhTRzLfNG5IEbeb_hGtIGe5w"
    )
  : getEnvSafe("SUPABASE_ANON_KEY", "");
