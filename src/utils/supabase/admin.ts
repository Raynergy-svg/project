/**
 * Supabase Admin Client
 * 
 * This file provides a Supabase client with admin privileges using the service role key.
 * IMPORTANT: This should ONLY be used in trusted server contexts, never in client code!
 * 
 * The admin client can be used for operations that require privileged access, such as:
 * - User management
 * - Database seeding
 * - Administrative operations
 * - Bypassing RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import { IS_DEV } from '@/utils/environment';

// Environment variables - these should ONLY be available on the server
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('CRITICAL: Missing Supabase admin credentials. The admin client will not function properly.');
}

// Client options tailored for admin operations
const adminClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

/**
 * Admin Supabase client with service role privileges
 * 
 * WARNING: This client bypasses Row Level Security (RLS) and has full access to your database.
 * Only use this in trusted server contexts such as:
 * - Middleware
 * - API Routes (server-side)
 * - Server Components (not Client Components)
 * - Server actions (not client actions)
 * 
 * NEVER expose this client to the browser or include it in client components!
 */
export const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, adminClientOptions);

/**
 * Create a Supabase admin client with a user's JWT
 * This allows you to perform operations as a specific user with admin privileges
 * 
 * @param jwt The JWT token of the user to impersonate
 * @returns A Supabase client with admin privileges acting as the specified user
 */
export const createAdminClientWithToken = (jwt: string) => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    ...adminClientOptions,
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
};

// In development mode, provide a helper function to check admin client
export const checkAdminConnection = IS_DEV ? async () => {
  try {
    const { error } = await adminClient.from('health_check').select('*').limit(1);
    if (error) {
      console.error('Admin client connection check failed:', error.message);
      return { connected: false, error: error.message };
    }
    return { connected: true, error: null };
  } catch (err) {
    console.error('Admin client connection check error:', err);
    return { connected: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
} : undefined;

// Default export the admin client
export default adminClient; 