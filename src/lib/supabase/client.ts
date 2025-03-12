/**
 * DEPRECATED: This file is a re-export of the main Supabase client from @/utils/supabase/client.
 * Please update imports to use @/utils/supabase/client instead of @/utils/supabase/client
 */

// Re-export everything from the main Supabase client file
export * from '@/utils/supabase/client';

// For backward compatibility
import { supabase, checkSupabaseConnection, supabaseUrl, supabaseAnonKey } from '@/utils/supabase/client';
export { supabase, checkSupabaseConnection, supabaseUrl, supabaseAnonKey };

// Default export for backward compatibility
export default supabase;

// Log a warning about the deprecated import path
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn(
    'Warning: You are importing from the deprecated path @/utils/supabase/client. ' +
    'Please update your imports to use @/utils/supabase/client instead.'
  );
}