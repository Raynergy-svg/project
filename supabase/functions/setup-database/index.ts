// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Setting up database tables and triggers...")

// Edge Function to run our database setup
// Follow the security guidelines: https://supabase.com/docs/guides/functions/auth

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Add extra logging function to visualize steps
const log = (...args) => {
  console.log("SETUP-DB:", ...args);
  return args[args.length - 1]; // Return the last argument for chaining
};

export const setupDatabaseSQL = `
-- Complete database setup script
${log("Preparing database setup SQL script...")}

-- 1. Check if the profiles table exists and create it if necessary
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ${log("Creating new profiles table...")}
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      email TEXT,
      username TEXT UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      name TEXT,
      raw_user_meta_data JSONB
    );
  ELSE
    ${log("Profiles table already exists, skipping creation...")}
  END IF;
END
$$;

-- 2. Make sure RLS is enabled
${log("Enabling Row Level Security...")}
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create or replace the policies
${log("Setting up RLS policies...")}
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- 4. Create a simplified trigger function that's more robust
${log("Creating simplified trigger function...")}
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a minimal profile with just the essential fields
  INSERT INTO public.profiles (id, email, raw_user_meta_data)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %, still returning NEW to avoid auth failure', SQLERRM;
    RETURN NEW; -- Still return NEW to avoid auth failures even if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the trigger
${log("Setting up database trigger...")}
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
${log("Granting permissions...")}
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    log("Edge Function called - preparing to set up database...");
    
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    )
    
    log("Supabase client created, executing SQL script...");

    // Run our setup script - requires service_role key for some of these operations
    const { error } = await supabaseClient.rpc('security_execute_sql', {
      sql: setupDatabaseSQL
    })

    if (error) {
      log("Error executing database setup:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Verify the setup worked by checking if the trigger exists
    log("SQL executed successfully, verifying trigger function...");
    
    const { data: triggerData, error: triggerError } = await supabaseClient.rpc('security_execute_sql', {
      sql: `
        SELECT trigger_name, event_manipulation, action_statement 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
          AND event_object_schema = 'auth'
          AND trigger_name = 'on_auth_user_created'
      `
    });
    
    if (triggerError) {
      log("Error verifying trigger:", triggerError);
    } else {
      log("Trigger verification result:", triggerData);
    }

    // Successfully applied the database setup
    log("Database setup completed successfully!");
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Database setup applied successfully',
        verification: triggerData || 'Trigger verification skipped' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    log("Fatal error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/setup-database' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
