/**
 * Server-side Auth utility functions for authentication with Supabase
 * 
 * IMPORTANT: This file contains server-only code and should ONLY be imported
 * in server components or API routes, never in client components.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Get the current user from the server side (for API routes)
 * This is used in API routes and server components to check authentication
 */
export async function getUser() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user in API route:', error);
    return null;
  }
}

/**
 * Create a Supabase server client for server-side operations
 */
export function createSupabaseServerClient(cookieStore: any) {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client for server-side operations 
 * that require admin privileges (e.g., bypassing RLS)
 * 
 * This should only be used in secure server contexts
 */
export function createSupabaseAdminClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
      }
    }
  );
} 