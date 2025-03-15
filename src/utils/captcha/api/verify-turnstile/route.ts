/**
 * API Route for validating Turnstile tokens
 * 
 * This API route allows testing Turnstile token validation directly,
 * without going through Supabase, which can help diagnose issues.
 */

import { NextRequest, NextResponse } from 'next/server';
import validateToken from '@/utils/turnstileValidator';
import '@/app/api/_lib/env-init'; // Import to ensure environment variables are set
import { getDebugInfo } from '@/app/api/_lib/env-init';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request
    const data = await request.json();
    const { token } = data;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    // Get the IP address from the request if available
    const ip = request.ip || request.headers.get('x-forwarded-for') || '';
    
    // Log the validation attempt
    console.log(`🔄 API: Validating token: ${token.substring(0, 10)}... from IP: ${ip}`);
    
    // Validate the token
    const validationResult = await validateToken(token);
    
    // Return the validation result with debug info
    if (validationResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Token validated successfully',
        details: validationResult.details,
        debug: getDebugInfo()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: validationResult.error,
        details: validationResult.details,
        debug: getDebugInfo()
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Token validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: getDebugInfo()
    }, { status: 500 });
  }
}

// Also handle GET requests for testing from the browser
export async function GET(request: NextRequest) {
  // Get the token from query parameters
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json(
      { 
        success: false,
        error: 'No token provided. Add ?token=YOUR_TOKEN to the URL',
        debug: getDebugInfo()
      },
      { status: 400 }
    );
  }
  
  // Validate the token
  const validationResult = await validateToken(token);
  
  // Return the validation result
  return NextResponse.json({
    success: validationResult.success,
    error: validationResult.error,
    details: validationResult.details,
    debug: getDebugInfo()
  });
} 