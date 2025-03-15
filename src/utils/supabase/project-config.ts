/**
 * Supabase Project Configuration Checker
 * 
 * This utility helps diagnose Supabase project configuration issues
 * by checking for common misconfigurations.
 */

import { supabase } from './client';

/**
 * Check Supabase project configuration
 */
export async function checkProjectConfig() {
  console.log('🔍 Checking Supabase project configuration...');
  
  const results = {
    authSettings: await checkAuthSettings(),
    restApi: await checkRestApi(),
    tables: await checkRequiredTables()
  };
  
  return {
    results,
    hasIssues: (
      !results.authSettings.success ||
      !results.restApi.success ||
      !results.tables.success
    ),
    timestamp: new Date().toISOString()
  };
}

/**
 * Check authentication settings
 */
async function checkAuthSettings() {
  console.log('🔍 Checking authentication settings...');
  
  try {
    // Try to get the current session to check basic auth functionality
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        success: false,
        message: 'Authentication API not functioning correctly',
        error: sessionError.message
      };
    }
    
    // Check if there are any authentication providers enabled
    const hasSession = !!sessionData.session;
    
    // Return result
    return {
      success: true,
      providers: {
        email: true, // Email is always enabled in Supabase
      },
      session: {
        present: hasSession,
        expiry: hasSession ? new Date(sessionData.session!.expires_at! * 1000).toISOString() : null
      }
    };
  } catch (error) {
    console.error('🔍 Error checking auth settings:', error);
    return {
      success: false,
      message: 'Unexpected error checking auth settings',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check REST API functionality
 */
async function checkRestApi() {
  console.log('🔍 Checking REST API functionality...');
  
  try {
    // Try to execute a simple query to check if the REST API is working
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    // If the error is about the table not existing, that's fine
    // We just want to verify the REST API is operational
    if (error && !error.message.includes('does not exist')) {
      return {
        success: false,
        message: 'REST API not functioning correctly',
        error: error.message,
        code: error.code
      };
    }
    
    return {
      success: true,
      message: 'REST API is operational'
    };
  } catch (error) {
    console.error('🔍 Error checking REST API:', error);
    return {
      success: false,
      message: 'Unexpected error checking REST API',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if required tables exist
 */
async function checkRequiredTables() {
  console.log('🔍 Checking required tables...');
  
  // Tables typically used in Supabase projects
  const tablesToCheck = [
    'profiles',
    'public.profiles',
    'auth.users'
  ];
  
  const results: Record<string, any> = {};
  
  for (const table of tablesToCheck) {
    try {
      // Attempt to check if the table exists
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        // Check if the error is about the table not existing
        if (error.message.includes('does not exist') || 
            error.message.includes('relation') || 
            error.message.includes('not found')) {
          results[table] = {
            exists: false,
            message: 'Table does not exist'
          };
        } else if (error.message.includes('permission') || 
                  error.message.includes('not authorized') ||
                  error.message.includes('access denied')) {
          results[table] = {
            exists: true,
            message: 'Table exists but permission denied',
            error: error.message
          };
        } else {
          results[table] = {
            exists: null,
            message: 'Unknown status',
            error: error.message
          };
        }
      } else {
        results[table] = {
          exists: true,
          message: 'Table exists and is accessible'
        };
      }
    } catch (error) {
      results[table] = {
        exists: null,
        message: 'Error checking table',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // Check if we have any tables that exist and are accessible
  const hasAccessibleTables = Object.values(results).some(
    (result: any) => result.exists === true && !result.error
  );
  
  return {
    success: hasAccessibleTables,
    message: hasAccessibleTables 
      ? 'Required tables exist and are accessible' 
      : 'No required tables are accessible',
    tables: results
  };
}

/**
 * Check for SQL triggers that might affect user creation
 */
export async function checkUserTriggersRpc() {
  console.log('🔍 Checking for triggers affecting user creation...');
  
  try {
    // This requires a custom RPC function to be created in your Supabase project
    // because it needs elevated permissions
    const { data, error } = await supabase.rpc('check_user_triggers');
    
    if (error) {
      return {
        success: false,
        message: 'Unable to check for triggers',
        error: error.message,
        note: 'This check requires a custom RPC function called check_user_triggers'
      };
    }
    
    return {
      success: true,
      triggers: data
    };
  } catch (error) {
    console.error('🔍 Error checking triggers:', error);
    return {
      success: false,
      message: 'Unexpected error checking triggers',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get Supabase project configuration recommendations
 */
export function getProjectRecommendations(checkResults: any) {
  const recommendations = [];
  
  // If authentication has issues
  if (!checkResults.results.authSettings.success) {
    recommendations.push({
      issue: 'Authentication API not functioning correctly',
      recommendation: 'Verify that your Supabase project is properly set up for authentication',
      details: checkResults.results.authSettings.error || 'Unknown error'
    });
  }
  
  // If REST API has issues
  if (!checkResults.results.restApi.success) {
    recommendations.push({
      issue: 'REST API not functioning correctly',
      recommendation: 'Check your Supabase project API settings and permissions',
      details: checkResults.results.restApi.error || 'Unknown error'
    });
  }
  
  // If tables have issues
  if (!checkResults.results.tables.success) {
    recommendations.push({
      issue: 'Required tables not accessible',
      recommendation: 'Create necessary tables like "profiles" and ensure proper permissions',
      details: 'Database might be missing schema setup or permissions are incorrect'
    });
  }
  
  // Generate general recommendations based on the most common issues
  if (!recommendations.length) {
    recommendations.push({
      issue: 'Database error saving new user',
      recommendation: 'Check Supabase Database Settings in project dashboard',
      details: 'This error often occurs when the Row Level Security (RLS) is too restrictive or there are triggers/functions failing during user creation',
      steps: [
        'Go to Supabase Dashboard > Authentication > Settings',
        'Make sure "Enable automatic creation of profiles on signup" is turned ON if you have a profiles table',
        'Verify any SQL triggers or functions that run when users are created',
        'Check Row Level Security (RLS) policies on auth.users and profiles tables',
        'Create a profiles table with the correct schema if it doesn\'t exist'
      ]
    });
  }
  
  return recommendations;
}

export default checkProjectConfig; 