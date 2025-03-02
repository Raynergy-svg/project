import { supabase, createBrowserClient } from '@/utils/supabase/client';

// Re-export the singleton instance from utils
export { supabase, createBrowserClient };

// If you need to access the URL and key for some reason:
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;