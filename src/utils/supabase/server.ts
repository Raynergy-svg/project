/**
 * Supabase Server Client
 * 
 * This file provides a Supabase client for use in server components and API routes.
 * It handles cookie management for server-side authentication.
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import fetchRetry from 'fetch-retry';

// Environment variables - try multiple sources to ensure we get the values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. The server client will not function properly.');
  console.error('Please ensure these are set in your .env.local file:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a custom fetch with retry logic for server-side operations
const fetchWithRetry = fetchRetry(fetch, {
  retries: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
  retryOn: [500, 502, 503, 504, 520, 521, 522, 524] // Server errors
});

/**
 * Creates a Supabase client for server-side operations with cookie handling
 * This should be used in Server Components, API Routes, or Server Actions.
 * 
 * IMPORTANT: Calling this function in a Server Component opts it out of static rendering
 * and makes the component dynamic. This is required for any component that needs
 * access to the user's session.
 * 
 * @returns A Supabase client configured for server use
 */
export const createClient = () => {
  // Get cookie store from Next.js
  // @ts-ignore - Next.js cookies() function has type issues between versions
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        fetch: fetchWithRetry
      },
      cookies: {
        get(name: string) {
          // cookieStore is synchronous in the cookies() API from next/headers
          // @ts-ignore - Next.js cookies() API has type inconsistencies
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Set the cookie in the store - cookieStore is synchronous in next/headers
            // @ts-ignore - Next.js cookies() API has type inconsistencies
            cookieStore.set({
              name,
              value,
              ...options
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be safely ignored if you have middleware refreshing
            // user sessions.
            console.warn(`Cookie set error in Server Component: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Remove the cookie from the store - cookieStore is synchronous in next/headers
            // @ts-ignore - Next.js cookies() API has type inconsistencies
            cookieStore.delete(name);
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be safely ignored if you have middleware refreshing
            // user sessions.
            console.warn(`Cookie remove error in Server Component: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      },
    }
  );
};

/**
 * Creates a Supabase admin client with service role for server-side operations
 * WARNING: This bypasses Row Level Security and should ONLY be used in secure server contexts
 * 
 * @returns A Supabase admin client with service role privileges
 */
export const createAdminClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is missing. Admin client requires this key to function.'
    );
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      global: {
        fetch: fetchWithRetry
      },
      cookies: {
        get(name: string) {
          // Admin clients typically don't need cookies
          return undefined;
        },
        set() {
          // Deliberately empty - admin operations typically don't set cookies
        },
        remove() {
          // Deliberately empty - admin operations typically don't remove cookies
        }
      },
    }
  );
};

/**
 * Helper function to get a user from a server-side request
 * This makes it convenient to check authentication in API routes
 * 
 * @returns The current user or null if not authenticated
 */
export const getUserFromRequest = async () => {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error getting user:', error.message);
      throw error;
    }
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

// Default export for convenience
export default { createClient, createAdminClient, getUserFromRequest }; 