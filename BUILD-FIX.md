# Build Fixes for Production

## "Export 'supabase' is not defined in module" Error

### Issue
In production builds, the following error was occurring:
```
index-CdwHeaeY.js:26 Uncaught SyntaxError: Export 'supabase' is not defined in module
```

This error was caused by having multiple independent instances of Supabase clients exported with the same name across different files:
- `src/utils/supabase/client.ts` 
- `src/lib/supabase.ts`
- `src/lib/supabase/client.ts`

Different components were importing from different files, which worked in development but caused conflicts in production when the bundler tried to optimize and deduplicate exports.

### Fix
The fix involved consolidating all Supabase client instances to a single source of truth:

1. Made `src/utils/supabase/client.ts` the primary source of the Supabase client
2. Updated it to properly use Database types for better type safety
3. Modified the other files to re-export from this primary source instead of creating new instances:
   - `src/lib/supabase.ts` now re-exports from `@/utils/supabase/client`
   - `src/lib/supabase/client.ts` now re-exports from `@/utils/supabase/client`

This ensures that there's only one Supabase client instance throughout the application, eliminating the export conflicts in production builds.

### Key Changes
- Added `import type { Database } from '@/lib/supabase/types'` to the main client
- Used proper typing with `createClient<Database>()`
- Added consistent global headers
- Made auxiliary files re-export the main instance instead of creating new ones

### Prevention
When working with singleton instances like database clients, always:
1. Create a single source of truth
2. Re-export from that source rather than creating new instances
3. Use proper typing for better development experience
4. Test production builds before deployment 