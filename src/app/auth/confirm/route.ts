/**
 * Auth Confirmation Route Handler
 * 
 * This route handler processes Supabase auth confirmation links.
 * When a user clicks their confirmation email link, this handler
 * verifies the token and completes the sign-up process.
 */

import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * GET handler for auth/confirm route
 * Processes email confirmation links
 */
export async function GET(request: NextRequest) {
  // Extract token_hash and type from URL query parameters
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Only proceed if we have both token_hash and type
  if (token_hash && type) {
    // Create a server-side Supabase client
    const supabase = await createClient()

    // Verify the one-time password (OTP)
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    // If verification succeeded, redirect to the dashboard or specified next page
    if (!error) {
      // Log the successful email verification
      console.log('Email verification successful')
      
      // Redirect user to specified redirect URL or dashboard
      return redirect(next)
    } else {
      console.error('Email verification error:', error)
    }
  }

  // If we get here, something went wrong - redirect to error page
  return redirect('/auth/error?message=Verification+failed')
}
