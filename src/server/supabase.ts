import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Export a function to create a new client with user's JWT
export const createSupabaseClientWithToken = (jwt: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
  });
}; 