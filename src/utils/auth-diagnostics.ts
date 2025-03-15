/**
 * Authentication Diagnostics Utility
 * 
 * This file provides utility functions to diagnose authentication issues
 * and test the authentication flow.
 */

import { supabase, checkSupabaseConnection } from './supabase/client';
import * as authUtils from './auth';

/**
 * Run a comprehensive diagnostic check on the authentication system
 * This can be called from the browser console to diagnose issues
 */
export async function runAuthDiagnostics() {
  console.group('🔍 Authentication Diagnostics');
  
  try {
    // Check environment variables
    console.log('Checking environment variables...');
    const envCheck = checkEnvironmentVariables();
    
    // Check Supabase connection
    console.log('Checking Supabase connection...');
    const connectionCheck = await checkSupabaseConnection();
    console.log('Connection check result:', connectionCheck);
    
    // Check current session
    console.log('Checking current session...');
    const sessionCheck = await checkCurrentSession();
    
    // Check client initialization
    console.log('Checking client initialization...');
    const clientCheck = checkClientInitialization();
    
    // Summarize findings
    console.log('Diagnostic Summary:');
    console.log('- Environment Variables:', envCheck.valid ? '✅ Valid' : '❌ Invalid');
    console.log('- Supabase Connection:', connectionCheck.connected ? '✅ Connected' : '❌ Disconnected');
    console.log('- Current Session:', sessionCheck.valid ? '✅ Valid' : '❌ Invalid');
    console.log('- Client Initialization:', clientCheck.valid ? '✅ Valid' : '❌ Invalid');
    
    // Provide recommendations
    console.log('Recommendations:');
    if (!envCheck.valid) {
      console.log('- Check your environment variables. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set correctly.');
    }
    
    if (!connectionCheck.connected) {
      console.log('- Check your network connection and Supabase service status.');
      console.log(`- Connection error: ${connectionCheck.error}`);
    }
    
    if (!sessionCheck.valid) {
      console.log('- Try signing out and signing in again.');
      console.log('- Clear browser cookies and local storage, then try again.');
    }
    
    if (!clientCheck.valid) {
      console.log('- Refresh the page to reinitialize the Supabase client.');
    }
    
    return {
      success: envCheck.valid && connectionCheck.connected && sessionCheck.valid && clientCheck.valid,
      envCheck,
      connectionCheck,
      sessionCheck,
      clientCheck
    };
  } catch (error) {
    console.error('Error running diagnostics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * Check if environment variables are properly set
 */
function checkEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const valid = !!supabaseUrl && !!supabaseAnonKey;
  
  return {
    valid,
    supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
    supabaseAnonKey: supabaseAnonKey ? '✅ Set' : '❌ Missing'
  };
}

/**
 * Check if the current session is valid
 */
async function checkCurrentSession() {
  try {
    const session = await authUtils.getSession();
    const user = await authUtils.getCurrentUser();
    
    return {
      valid: !!session && !!user,
      session: session ? '✅ Present' : '❌ Missing',
      user: user ? '✅ Present' : '❌ Missing',
      sessionData: session,
      userData: user
    };
  } catch (error) {
    console.error('Error checking session:', error);
    return {
      valid: false,
      session: '❌ Error',
      user: '❌ Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if the Supabase client is properly initialized
 */
function checkClientInitialization() {
  try {
    const hasAuth = !!supabase && !!supabase.auth;
    const hasFrom = !!supabase && !!supabase.from;
    
    return {
      valid: hasAuth && hasFrom,
      auth: hasAuth ? '✅ Available' : '❌ Missing',
      from: hasFrom ? '✅ Available' : '❌ Missing',
      client: supabase ? '✅ Initialized' : '❌ Not initialized'
    };
  } catch (error) {
    console.error('Error checking client initialization:', error);
    return {
      valid: false,
      auth: '❌ Error',
      from: '❌ Error',
      client: '❌ Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test the login flow with provided credentials
 * This should only be used for testing purposes
 */
export async function testLoginFlow(email: string, password: string) {
  console.group('🔑 Testing Login Flow');
  
  try {
    console.log('Attempting login...');
    const { data, error } = await authUtils.signInWithEmail(email, password);
    
    if (error) {
      console.error('Login failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Login successful!');
    console.log('Session:', data?.session);
    console.log('User:', data?.user);
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error during login test:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * Test the signup flow with provided credentials
 * This should only be used for testing purposes
 */
export async function testSignupFlow(email: string, password: string, name?: string) {
  console.group('🔑 Testing Signup Flow');
  
  try {
    console.log('Attempting signup...');
    const { data, error } = await authUtils.signUpWithEmail(email, password, { data: { name } });
    
    if (error) {
      console.error('Signup failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Signup successful!');
    console.log('Session:', data?.session);
    console.log('User:', data?.user);
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error during signup test:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  } finally {
    console.groupEnd();
  }
}

// Make diagnostics available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDiagnostics = {
    runAuthDiagnostics,
    testLoginFlow,
    testSignupFlow,
    checkSupabaseConnection
  };
  
  console.info('🔍 Auth diagnostics available in console as window.authDiagnostics');
} 