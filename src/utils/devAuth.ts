/**
 * Development Authentication Utilities
 * 
 * This file contains utilities for development environment authentication.
 * These functions are only used in development mode and are not included in production builds.
 */

import ENV from '@/utils/env';

/**
 * Sets development environment variables for authentication
 * This is useful for bypassing certain authentication requirements in development
 */
export function setDevEnvironmentVariables() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔧 Setting development environment variables for authentication');
    
    // Set global variables that might be used by authentication libraries
    (window as any).SUPABASE_AUTH_CAPTCHA_DISABLE = true;
    (window as any).SKIP_AUTH_CAPTCHA = true;
    (window as any).NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE = true;
    
    // Critical Supabase environment variables that need to be available globally
    if (ENV.SUPABASE_URL) {
      (window as any).NEXT_PUBLIC_SUPABASE_URL = ENV.SUPABASE_URL;
      console.log('✅ NEXT_PUBLIC_SUPABASE_URL set from ENV');
    } else {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    
    if (ENV.SUPABASE_ANON_KEY) {
      (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;
      console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY set from ENV');
    } else {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
  }
}

/**
 * Checks the development authentication environment
 * This function runs diagnostics to ensure the development environment is properly configured
 */
export function checkDevAuthEnvironment() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔍 Checking development authentication environment');
    
    // Check if we have the required environment variables set properly
    const requiredVars = [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', value: window.NEXT_PUBLIC_SUPABASE_URL || ENV.SUPABASE_URL },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: window.NEXT_PUBLIC_SUPABASE_ANON_KEY || ENV.SUPABASE_ANON_KEY }
    ];
    
    const missingVars = requiredVars.filter(v => !v.value);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missingVars.map(v => v.name).join(', ')}`);
      console.warn('Authentication may not work correctly in development mode');
      console.warn('Please ensure these variables are set in your .env.local file and restart the server');
      
      // As a last resort, set hardcoded values for known Supabase configuration
      if (missingVars.some(v => v.name === 'NEXT_PUBLIC_SUPABASE_URL')) {
        (window as any).NEXT_PUBLIC_SUPABASE_URL = 'https://gnwdahoiauduyncppbdb.supabase.co';
        console.warn('⚠️ Using hardcoded NEXT_PUBLIC_SUPABASE_URL as fallback');
      }
      
      if (missingVars.some(v => v.name === 'NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
        (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = 
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U';
        console.warn('⚠️ Using hardcoded NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback');
      }
    } else {
      console.log('✅ All required environment variables are set');
    }
    
    // Check if we're running in a secure context
    if (window.isSecureContext) {
      console.log('✅ Running in a secure context');
    } else {
      console.warn('⚠️ Not running in a secure context, some authentication features may not work');
    }
  }
}

/**
 * Gets development account information
 * This function returns mock account information for development testing
 */
export function getDevAccountInfo(role: 'admin' | 'user' = 'user') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('getDevAccountInfo should only be called in development mode');
  }
  
  const accounts = {
    admin: {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User'
    },
    user: {
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      name: 'Test User'
    }
  };
  
  return accounts[role];
}

/**
 * Performs a development sign-in
 * This function simulates a sign-in process for development testing
 */
export async function devSignIn(role: 'admin' | 'user' = 'user') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('devSignIn should only be called in development mode');
  }
  
  console.log(`🔑 Development sign-in as ${role}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const accountInfo = getDevAccountInfo(role);
  
  // Return a mock session object
  return {
    user: {
      id: `dev-${role}-id`,
      email: accountInfo.email,
      role: accountInfo.role,
      name: accountInfo.name
    },
    session: {
      access_token: 'dev-access-token',
      refresh_token: 'dev-refresh-token',
      expires_at: Date.now() + 3600 * 1000 // 1 hour from now
    }
  };
}

// Export a default object with all functions
export default {
  setDevEnvironmentVariables,
  checkDevAuthEnvironment,
  getDevAccountInfo,
  devSignIn
}; 