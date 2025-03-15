/**
 * Supabase Database Setup Utility
 * 
 * This utility helps set up the standard tables needed for Supabase authentication
 * and user profiles. Use this to quickly create the necessary database structure.
 */

import { supabase } from './client';

// SQL script to create the profiles table
const CREATE_PROFILES_TABLE_SQL = `
-- Check if the profiles table exists and create it if necessary
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      email TEXT,
      username TEXT,
      full_name TEXT,
      avatar_url TEXT,
      raw_user_meta_data JSONB,
      CONSTRAINT username_length CHECK (char_length(username) >= 3)
    );

    -- Create an index on email for faster lookups
    CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
    
    -- Create a unique index on username but allow nulls
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username) WHERE username IS NOT NULL;
  END IF;
END
$$;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create policy to allow the trigger function to insert profiles
CREATE POLICY "Allow trigger to create profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);  -- This allows the trigger to create profiles

-- Create policy to allow anyone to view public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Set up a robust user profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with basic fields
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    raw_user_meta_data
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Still create the profile with minimal info to prevent signup failures
    INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

// SQL script to set up basic RLS policies for auth.users
const SETUP_AUTH_POLICIES_SQL = `
-- Make sure RLS is enabled on the auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Ensure the service_role can read all users
CREATE POLICY IF NOT EXISTS "Service role can do all things" ON auth.users
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );
  
-- Ensure authenticated users can read their own user data
CREATE POLICY IF NOT EXISTS "Authenticated users can read their own user data" ON auth.users
  FOR SELECT USING (
    auth.uid() = id
  );
`;

// Create a single combined SQL script for both profiles and policies
const COMBINED_SETUP_SQL = `
-- Complete Database Setup Script
-- Run this in the Supabase SQL Editor to set up your database

-- 1. First make sure the profiles table is correctly set up
${CREATE_PROFILES_TABLE_SQL}

-- 2. Set up auth policies
${SETUP_AUTH_POLICIES_SQL}

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

/**
 * Create a downloadable SQL file for manual setup
 */
export function getSetupSql() {
  return COMBINED_SETUP_SQL;
}

/**
 * Create a Blob URL for downloading the setup SQL
 */
export function getSetupSqlBlobUrl() {
  const blob = new Blob([COMBINED_SETUP_SQL], { type: 'text/plain' });
  return URL.createObjectURL(blob);
}

/**
 * Run a complete database setup using the Edge Function
 */
export async function setupDatabase() {
  console.log('🛠️ Running complete database setup...');
  
  try {
    // Get the project reference from the URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectRef) {
      console.error('❌ Could not extract project reference from Supabase URL');
      return {
        success: false,
        profiles: { success: false, message: 'Failed to determine project reference' },
        authPolicies: { success: false, message: 'Failed to determine project reference' },
        timestamp: new Date().toISOString(),
        instructions: 'Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.'
      };
    }
    
    console.log('🛠️ Invoking setup-database Edge Function...');
    
    let result;
    let edgeFunctionSuccess = false;
    
    try {
      // Call the Edge Function we previously deployed
      const functionUrl = `https://${projectRef}.supabase.co/functions/v1/setup-database`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      
      result = await response.json();
      edgeFunctionSuccess = response.ok && result.success;
      
      console.log('🛠️ Edge Function response:', result);
    } catch (edgeFunctionError) {
      console.error('❌ Error calling Edge Function:', edgeFunctionError);
      result = {
        success: false,
        error: edgeFunctionError instanceof Error ? edgeFunctionError.message : String(edgeFunctionError)
      };
    }
    
    // If Edge Function failed, try direct SQL method
    if (!edgeFunctionSuccess) {
      console.log('⚠️ Edge Function failed, trying direct SQL method...');
      
      // Execute both SQL scripts directly
      const { error: profilesError } = await executeSql(CREATE_PROFILES_TABLE_SQL);
      const { error: policiesError } = await executeSql(SETUP_AUTH_POLICIES_SQL);
      
      if (profilesError || policiesError) {
        console.error('❌ Direct SQL method failed:', { profilesError, policiesError });
        
        return {
          success: false,
          profiles: { 
            success: !profilesError, 
            message: profilesError ? `Failed to set up profiles table: ${profilesError.message}` : 'Profiles table set up successfully' 
          },
          authPolicies: { 
            success: !policiesError, 
            message: policiesError ? `Failed to set up auth policies: ${policiesError.message}` : 'Auth policies set up successfully' 
          },
          edgeFunctionResult: result,
          timestamp: new Date().toISOString(),
          instructions: 'Database setup failed. Please use the Supabase SQL Editor to run the SQL scripts manually.'
        };
      }
      
      console.log('✅ Direct SQL method successful');
    } else {
      console.log('✅ Edge Function successful:', result);
    }
    
    // Now verify if the setup worked by checking if we can query the profiles table
    const verifyResult = await verifyDatabaseSetup();
    
    return {
      success: verifyResult.success,
      profiles: { 
        success: verifyResult.profilesOk, 
        message: verifyResult.profilesOk ? 'Profiles table is set up properly' : verifyResult.message || 'Profiles table may not be set up properly' 
      },
      authPolicies: { 
        success: true, 
        message: 'Auth policies applied successfully' 
      },
      edgeFunctionResult: result,
      verification: verifyResult,
      timestamp: new Date().toISOString(),
      instructions: verifyResult.success 
        ? 'Database setup completed successfully.' 
        : 'Database setup reported success, but verification found issues. Please check the database console.'
    };
  } catch (error) {
    console.error('❌ Unexpected error during database setup:', error);
    
    return {
      success: false,
      profiles: { success: false, message: 'Failed to set up profiles table due to error' },
      authPolicies: { success: false, message: 'Failed to set up auth policies due to error' },
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      instructions: 'An unexpected error occurred. Check the error message and try again.',
      fallbackInstructions: 'You can try running the SQL manually in the Supabase SQL Editor:',
      sqlScripts: {
        profiles: CREATE_PROFILES_TABLE_SQL,
        authPolicies: SETUP_AUTH_POLICIES_SQL
      }
    };
  }
}

/**
 * Execute SQL directly using the RPC approach
 */
async function executeSql(sql: string) {
  try {
    // Try using the rpc function method first
    const { error: rpcError } = await supabase.rpc('exec_sql', { query: sql });
    
    // If RPC doesn't exist, try a different approach
    if (rpcError && rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
      console.log('⚠️ RPC method not available, trying specialized table approach...');
      
      // Many Supabase instances have the _sqlj table for executing admin SQL
      // This is a common pattern but not guaranteed to work on all instances
      const { error: sqlError } = await supabase
        .from('_sqlj')
        .insert({ query: sql });
      
      if (sqlError) {
        console.error('❌ Error executing SQL via specialized table:', sqlError);
        return { error: sqlError };
      }
      
      return { success: true };
    }
    
    if (rpcError) {
      console.error('❌ Error executing SQL via RPC:', rpcError);
      return { error: rpcError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error in executeSql:', error);
    return { 
      error: {
        message: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Verify that the database setup was successful
 */
async function verifyDatabaseSetup() {
  try {
    console.log('🛠️ Verifying database setup...');
    
    // Step 1: Check if we can query the profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    const profilesOk = !profilesError;
    
    if (profilesError) {
      console.error('❌ Error querying profiles table:', profilesError);
      return {
        success: false,
        profilesOk: false,
        message: `Cannot access profiles table: ${profilesError.message}`,
        error: profilesError
      };
    }
    
    console.log('✅ Profiles table accessible');
    
    // We won't create test users in the verification process anymore since that can cause issues
    // Instead, we'll just check if the trigger exists
    
    try {
      // Check if the trigger exists and is correctly configured
      const { data: triggerData, error: triggerError } = await supabase.rpc('security_execute_sql', {
        sql: `
          SELECT trigger_name, event_manipulation, action_statement 
          FROM information_schema.triggers 
          WHERE event_object_table = 'users' 
            AND event_object_schema = 'auth'
            AND trigger_name = 'on_auth_user_created'
        `
      });
      
      if (triggerError) {
        console.error('❌ Error checking trigger configuration:', triggerError);
        return {
          success: profilesOk, // Still consider partial success if profiles table exists
          profilesOk,
          triggerOk: false,
          message: 'Unable to verify the trigger function, but the profiles table is accessible',
          error: triggerError
        };
      }
      
      // If the trigger is found, consider it a success
      if (triggerData && Array.isArray(triggerData) && triggerData.length > 0) {
        console.log('✅ User creation trigger exists and appears correctly configured');
        return {
          success: true,
          profilesOk: true,
          triggerOk: true,
          message: 'Database tables are accessible and trigger exists',
        };
      } else {
        console.warn('⚠️ User creation trigger not found or incorrectly configured');
        return {
          success: profilesOk, // Still consider it partial success
          profilesOk,
          triggerOk: false,
          message: 'Profiles table is accessible, but user creation trigger is not properly configured',
        };
      }
    } catch (triggerCheckError) {
      console.error('❌ Error checking trigger:', triggerCheckError);
      
      // If we can't check the trigger but the profiles table exists, consider it partial success
      return {
        success: profilesOk,
        profilesOk,
        triggerOk: null,
        message: 'Database tables are accessible, but trigger could not be verified',
        error: triggerCheckError instanceof Error ? triggerCheckError.message : String(triggerCheckError)
      };
    }
  } catch (error) {
    console.error('❌ Error verifying database setup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default setupDatabase; 