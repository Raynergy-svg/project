/**
 * Supabase Utilities
 * 
 * This file centralizes exports for all Supabase-related utilities.
 * It makes imports throughout the application more consistent and 
 * reduces the need to remember specific file paths.
 */

// Client exports
export * from './client';
export { createSupabaseBrowserClient } from './client';

// Server exports
export { 
  createClient as createServerClient,
  createAdminClient,
  getUserFromRequest
} from './server';

// Error handling exports
export {
  handleSupabaseError,
  safeSupabaseOperation,
  logSupabaseError,
  type StructuredError,
  type SupabaseErrorType
} from './error-handling';

// Re-export from client as default for backward compatibility
import { supabase } from './client';
export default supabase;
