import { supabase } from '@/utils/supabase/client';
import type { Database } from './types';

// Re-export everything from the primary source
export { 
  supabase, 
  createBrowserClient,
  supabaseUrl,
  supabaseAnonKey 
} from '@/utils/supabase/client';

// Helper function to check if Supabase is properly configured
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return false;
  }
}