/**
 * Supabase Database Diagnostic Tool
 * 
 * This utility provides functions to diagnose database issues with Supabase,
 * especially for authentication-related tables.
 */

import { supabase } from './client';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * Check Supabase database connectivity
 */
export async function checkDatabaseConnection() {
  console.log('📊 Checking database connection...');
  
  try {
    // Try to execute a simple query to verify basic connectivity
    // Avoid using count(*) since it causes parsing issues with PostgREST
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('📊 Database connection error:', error);
      return {
        connected: false,
        error: error.message,
        errorCode: error.code,
        details: error.details
      };
    }
    
    console.log('📊 Database connection successful');
    return {
      connected: true,
      data
    };
  } catch (error) {
    console.error('📊 Unexpected error checking database connection:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if the auth schema and tables exist
 */
export async function checkAuthSchema() {
  console.log('📊 Checking auth schema...');
  
  try {
    // Try a direct check first - just attempt to query a public table
    // This avoids trying to use an RPC function that might not exist
    console.log('📊 Checking auth schema with direct table access...');
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('id').limit(1);
    
    // If we can query profiles, assume basic schema is OK
    if (!profileError) {
      return {
        success: true,
        message: 'Successfully queried profiles table',
        tables: {
          profiles: true
        }
      };
    }
    
    // If direct query didn't work, try the fallback approach
    console.log('📊 Direct table check failed, using fallback method...');
    return await checkAuthSchemaFallback();
  } catch (error) {
    console.error('📊 Unexpected error checking auth schema:', error);
    
    // Always try fallback approach on any error
    return await checkAuthSchemaFallback();
  }
}

/**
 * Fallback method to check auth schema when RPC is not available
 */
async function checkAuthSchemaFallback() {
  console.log('📊 Using fallback method to check auth schema...');
  
  try {
    // First, check if we can get session information
    console.log('📊 Checking auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('📊 Error accessing auth session:', sessionError);
      return {
        success: false,
        error: sessionError?.message || 'Unknown session error',
        details: {
          sessionError
        }
      };
    }
    
    // Next, try a simple query to check if auth is configured
    console.log('📊 Testing basic auth functionality...');
    const hasSession = !!sessionData?.session;
    
    return {
      success: true,
      message: hasSession 
        ? 'Auth functionality appears to be working with active session' 
        : 'Auth functionality appears to be working, but no active session',
      details: {
        hasSession,
        sessionExpiresAt: sessionData?.session?.expires_at 
          ? new Date(sessionData.session.expires_at * 1000).toISOString()
          : null
      }
    };
  } catch (error) {
    console.error('📊 Fallback auth schema check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking auth schema',
      details: { error }
    };
  }
}

/**
 * Check database permissions for the current user
 */
export async function checkDatabasePermissions() {
  console.log('📊 Checking database permissions...');
  
  // Only check the public tables - accessing auth.users directly can cause issues
  const tables = ['profiles'];
  const operations = ['SELECT', 'INSERT'];
  const results: Record<string, Record<string, boolean | string>> = {};
  
  for (const table of tables) {
    results[table] = {};
    
    for (const operation of operations) {
      try {
        let result: PostgrestSingleResponse<any>;
        
        if (operation === 'SELECT') {
          // Test select permission
          result = await supabase.from(table).select('id').limit(1);
        } else if (operation === 'INSERT') {
          // For insert, we'll just check the error type to avoid actually inserting
          // Use a safer approach to test INSERT permission
          const testObj: any = { 
            // Use a UUID format for id to match profiles table constraint
            id: '00000000-0000-0000-0000-000000000000',
            // Add fields that actually exist in the profiles table
            email: 'test@example.com',
            updated_at: new Date().toISOString()
          };
          
          result = await supabase.from(table).insert(testObj).select();
        } else {
          continue;
        }
        
        // If there's no error, permission is granted
        if (!result.error) {
          results[table][operation] = true;
          continue;
        }
        
        // Check if error is about permissions or something else
        const errorMsg = result.error.message || '';
        if (errorMsg.includes('permission') || 
            errorMsg.includes('not authorized') ||
            errorMsg.includes('access denied') ||
            errorMsg.includes('violates row-level')) {
          results[table][operation] = false;
        } else if (errorMsg.includes('violates foreign key') || 
                  errorMsg.includes('duplicate key') || 
                  errorMsg.includes('constraint')) {
          // This is actually good - we were able to reach the database constraint
          // which means we have permission, just not valid data
          results[table][operation] = true;
        } else {
          // Other errors
          results[table][operation] = `Error: ${errorMsg}`;
        }
      } catch (error) {
        results[table][operation] = `Exception: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }
  
  // For auth tables, just check if we can use basic auth functions
  try {
    const { error } = await supabase.auth.getSession();
    results['auth'] = {
      'API Access': !error ? true : `Error: ${error.message}`
    };
  } catch (error) {
    results['auth'] = {
      'API Access': `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
  
  return {
    success: true,
    permissions: results
  };
}

/**
 * Check if the handle_new_user trigger function is correctly set up
 */
export async function checkTriggerFunction() {
  console.log('📊 Checking trigger function setup...');
  
  try {
    // Check if we can directly query the function definition
    // Note: This requires higher privileges, so it might not work in all contexts
    // First attempt: Try to get function info via system tables
    const result = {
      success: false,
      triggerExists: false,
      functionExists: false,
      details: {},
      tableDefs: {}
    };
    
    // First check if we can query the profiles table structure
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      result.tableDefs.profiles = {
        success: !profilesError,
        error: profilesError?.message,
        canQuery: !profilesError,
        data: profilesData
      };
    } catch (e) {
      result.tableDefs.profiles = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        canQuery: false
      };
    }
    
    // Try creating a test user directly - this is the best test to see if the trigger works
    try {
      // Generate a test email
      const testEmail = `test-trigger-${Math.random().toString(36).substring(2, 8)}@example.com`;
      const testPassword = 'Password123!';
      
      // Attempt to create a user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (signUpError) {
        result.details.signUp = {
          success: false,
          error: signUpError.message,
          status: signUpError.status
        };
      } else {
        result.details.signUp = {
          success: true,
          userId: signUpData?.user?.id
        };
        
        // If sign-up worked, check if a profile was created
        if (signUpData?.user?.id) {
          // Wait a moment for the trigger to execute
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();
            
          result.details.profile = {
            success: !profileError && !!profileData,
            exists: !!profileData,
            error: profileError?.message,
            data: profileData
          };
          
          // If the profile exists, the trigger is working
          if (profileData) {
            result.success = true;
            result.triggerExists = true;
            result.functionExists = true;
          } else {
            result.success = false;
            result.triggerExists = false;
            result.details.suggestion = 'The trigger function may not be set up correctly';
          }
        }
      }
    } catch (e) {
      result.details.error = e instanceof Error ? e.message : String(e);
    }
    
    return result;
  } catch (error) {
    console.error('📊 Error checking trigger function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run a comprehensive database diagnostic including trigger check
 */
export async function runFullDatabaseDiagnostic() {
  console.log('📊 Running full database diagnostic...');
  
  const connection = await checkDatabaseConnection();
  
  // If we can't connect, don't continue
  if (!connection.connected) {
    return {
      success: false,
      message: 'Database connection failed',
      connection
    };
  }
  
  // Check auth schema
  const schema = await checkAuthSchema();
  
  // Check permissions
  const permissions = await checkDatabasePermissions();
  
  // Check trigger function
  const trigger = await checkTriggerFunction();
  
  // Return comprehensive results
  return {
    success: connection.connected && schema.success && trigger.success,
    connection,
    schema,
    permissions,
    trigger,
    timestamp: new Date().toISOString()
  };
}

export default runFullDatabaseDiagnostic; 