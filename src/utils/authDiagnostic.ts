/**
 * Authentication Diagnostic Utility
 * 
 * This utility provides comprehensive diagnostics for authentication issues.
 * Note: CAPTCHA has been disabled and Turnstile files moved to src/utils/captcha.
 */

import { supabase } from './supabase/client';
import { getTurnstileEnv, forceTurnstileEnv } from './temp-constants';
import { testSignUp } from './test-auth';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Run a complete diagnostic on the authentication system
 */
export async function runAuthDiagnostic(): Promise<DiagnosticResult[]> {
  console.group('🔍 Authentication Diagnostic');
  
  const results: DiagnosticResult[] = [];
  
  try {
    // Step 1: Environment variables check
    const envCheck = await checkEnvironmentVariables();
    results.push(envCheck);
    console.log('1. Environment Variables:', envCheck);
    
    // Step 2: CAPTCHA status check
    const captchaCheck = {
      success: true,
      message: 'CAPTCHA has been disabled - all CAPTCHA checks will pass automatically',
      details: {
        captchaStatus: 'disabled',
        turnstileStatus: 'disabled',
        note: 'Turnstile files have been moved to src/utils/captcha'
      }
    };
    results.push(captchaCheck);
    console.log('2. CAPTCHA Status:', captchaCheck);
    
    // Step 3: Supabase connection check
    const connectionResult = await checkSupabaseConnection();
    results.push(connectionResult);
    console.log('3. Supabase Connection:', connectionResult);
    
    // Step 4: Test authentication (CAPTCHA automatically bypassed)
    const authResult = await testAuthWithCaptcha('DISABLED_CAPTCHA');
    results.push(authResult);
    console.log('4. Auth Test:', authResult);
    
    // Final recommendation
    const recommendation = generateRecommendation(results);
    results.push(recommendation);
    console.log('📋 Recommendation:', recommendation);
    
  } catch (error) {
    const errorResult: DiagnosticResult = {
      success: false,
      message: 'Diagnostic failed with an unexpected error',
      details: error instanceof Error ? error.message : String(error)
    };
    results.push(errorResult);
    console.error('❌ Diagnostic Error:', error);
  }
  
  console.groupEnd();
  return results;
}

/**
 * Check if all required environment variables are set
 */
export async function checkEnvironmentVariables() {
  // Force environment variables to be set (no-op for Turnstile now)
  forceTurnstileEnv();
  
  // Get Turnstile environment from our loader
  const turnstileEnv = getTurnstileEnv();
  
  // Check Node environment
  const isDev = process.env.NODE_ENV === 'development';
  
  // Required environment variables
  const requiredVars: Record<string, string> = {
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not set'
  };
  
  // Check for missing variables
  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => value === 'Not set')
    .map(([key]) => key);
  
  // Everything is set
  if (missingVars.length === 0) {
    return {
      success: true,
      message: 'All required environment variables are set',
      details: {
        ...requiredVars,
        turnstileStatus: 'Disabled'
      }
    };
  }
  
  // Some variables are missing
  return {
    success: false,
    message: `Missing required environment variables: ${missingVars.join(', ')}`,
    details: {
      ...requiredVars,
      missingVars,
      turnstileStatus: 'Disabled'
    }
  };
}

/**
 * Check Supabase connection
 */
async function checkSupabaseConnection(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        message: 'Supabase authentication error',
        details: error.message
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      details: {
        authenticated: !!data.session,
        sessionExpires: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error connecting to Supabase',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Test authentication with dummy CAPTCHA token
 */
async function testAuthWithCaptcha(token: string): Promise<DiagnosticResult> {
  try {
    // Use our test sign-up function which now handles disabled CAPTCHA
    const signUpResult = await testSignUp();
    
    if (!signUpResult.success) {
      // Check if the error is CAPTCHA-related
      const isCaptchaError = 
        signUpResult.error?.message?.includes('captcha') || 
        signUpResult.error?.message?.includes('CAPTCHA');
      
      if (isCaptchaError) {
        return {
          success: false,
          message: 'CAPTCHA verification failed in Supabase',
          details: {
            error: signUpResult.error,
            message: signUpResult.message,
            suggestion: 'Check Supabase dashboard settings under Authentication → Settings → Security and Protection → CAPTCHA'
          }
        };
      }
      
      // Return other error types
      return {
        success: false,
        message: `Authentication test failed: ${signUpResult.message}`,
        details: {
          error: signUpResult.error,
          captchaStatus: 'Bypassed (CAPTCHA is disabled)',
          validationResult: signUpResult.validationResult
        }
      };
    }
    
    // Success case
    return {
      success: true,
      message: 'Authentication test successful',
      details: {
        email: signUpResult.data?.user?.email || 'Unknown',
        captchaStatus: 'Bypassed (CAPTCHA is disabled)',
        validationResult: signUpResult.validationResult
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error testing authentication',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generate recommendation based on diagnostic results
 */
function generateRecommendation(results: DiagnosticResult[]): DiagnosticResult {
  // Count failures
  const failures = results.filter(result => !result.success).length;
  
  if (failures === 0) {
    return {
      success: true,
      message: 'All diagnostics passed! Authentication is working correctly.',
      details: {
        nextSteps: 'Your authentication system is properly configured and working.'
      }
    };
  }
  
  // Check for specific issues
  const envCheck = results.find(r => r.message.includes('environment variables'));
  const connectionCheck = results.find(r => r.message.includes('Supabase connection'));
  const authCheck = results.find(r => r.message.includes('Authentication test'));
  
  let recommendations: string[] = [];
  
  if (envCheck && !envCheck.success) {
    recommendations.push('Set up missing environment variables in .env.local file');
  }
  
  if (connectionCheck && !connectionCheck.success) {
    recommendations.push('Check your network connection and Supabase service status');
  }
  
  if (authCheck && !authCheck.success) {
    if (authCheck.message.includes('CAPTCHA')) {
      recommendations.push('Check Supabase dashboard CAPTCHA settings (Authentication → Settings → Security and Protection → CAPTCHA)');
      recommendations.push('Consider temporarily disabling CAPTCHA in Supabase for testing');
    } else {
      recommendations.push('Review Supabase authentication settings and policies');
    }
  }
  
  return {
    success: false,
    message: `Found ${failures} issue${failures > 1 ? 's' : ''} with authentication setup`,
    details: {
      recommendations,
      failedTests: results.filter(r => !r.success).map(r => r.message)
    }
  };
}

// Make diagnostic available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDiagnostic = {
    runAuthDiagnostic,
    checkEnvironmentVariables,
    checkSupabaseConnection
  };
  
  console.info('🔍 Auth diagnostics available in console as window.authDiagnostic');
}

export default runAuthDiagnostic; 