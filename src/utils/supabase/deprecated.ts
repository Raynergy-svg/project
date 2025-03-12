/**
 * DEPRECATED: Supabase Backward Compatibility
 * 
 * This file provides backward compatibility for older imports.
 * It re-exports from the consolidated Supabase files and shows deprecation warnings.
 * 
 * New code should import directly from:
 * - @/utils/supabase/client.ts (client-side)
 * - @/utils/supabase/server.ts (server-side)
 * - @/utils/supabase/admin.ts (admin operations)
 * - @/types/supabase.types.ts (for types)
 */

import { IS_DEV } from '@/utils/environment';

// Re-export from the primary client file
import * as clientExports from './client';
export * from './client';

// Re-export from server file
import * as serverExports from './server';
export { createClient as createServerClient } from './server';

// Re-export from admin file
import * as adminExports from './admin';
export { adminClient } from './admin';

/**
 * Show deprecation warning in development mode
 * @param oldPath The deprecated import path
 * @param newPath The recommended import path
 */
function showDeprecationWarning(oldPath: string, newPath: string) {
  if (IS_DEV) {
    console.warn(
      `[DEPRECATED] You are importing from '${oldPath}' which is deprecated. ` +
      `Please update your imports to use '${newPath}' instead.`
    );
  }
}

// Handle re-exports for specific paths
const handleImportFrom = {
  '@/utils/supabase/client': () => {
    showDeprecationWarning('@/utils/supabase/client', '@/utils/supabase/client');
    return clientExports;
  },
  '@/utils/supabase/client': () => {
    showDeprecationWarning('@/utils/supabase/client', '@/utils/supabase/client');
    return clientExports;
  },
  '@/utils/supabase/client': () => {
    showDeprecationWarning('@/utils/supabase/client', '@/utils/supabase/client');
    return clientExports;
  },
  '@/utils/supabase/admin': () => {
    showDeprecationWarning('@/utils/supabase/admin', '@/utils/supabase/admin');
    return adminExports;
  }
};

// Defaults for backward compatibility
export const supabase = clientExports.supabase;
export const { supabaseUrl, supabaseAnonKey } = clientExports;
export default supabase; 