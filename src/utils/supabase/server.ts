/**
 * Supabase Server Client
 * 
 * This file provides a Supabase client for use in server components and API routes.
 * It handles cookie management for server-side authentication.
 * 
 * @see https://supabase.com/docs/guides/auth/server-side-rendering
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. The server client will not function properly.');
}

/**
 * Creates a Supabase client for server-side operations with cookie handling
 * This should be used in Server Components, API Routes, or Server Actions.
 * 
 * @param cookieStore The cookie store from next/headers
 * @returns A Supabase client configured for server use
 */
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Handle server component cookie setting
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // Handle server component cookie removal
          }
        },
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
      cookies: {
        // Use server-only cookies for admin operations
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set() {
          // Deliberately empty - admin operations typically don't set cookies
        },
        remove() {
          // Deliberately empty - admin operations typically don't remove cookies
        },
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
};

// Default export for convenience
export default { createClient, createAdminClient, getUserFromRequest }; 