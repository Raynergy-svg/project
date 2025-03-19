/**
 * Supabase Auth Middleware
 * 
 * This middleware handles Supabase Auth token refreshing and cookie management.
 * It ensures that Auth tokens are refreshed when needed and passed correctly
 * between the server and client.
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Updates the Supabase auth session by refreshing the token if needed
 * and setting the appropriate cookies.
 * 
 * @param request The Next.js request object
 * @returns A Next.js response object with updated cookies
 */
export async function updateSession(request: NextRequest) {
  // Create a response object that we'll modify and return
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client using the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // When running in middleware, we need to use request.cookies.set()
          // to ensure cookies are properly set for the request
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // We also need to set the cookie in the response
          // so it's available to the browser after the request completes
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // When running in middleware, we need to use request.cookies.delete()
          // to ensure cookies are properly removed for the request
          request.cookies.delete(name)
          
          // We also need to delete the cookie in the response
          // so it's removed from the browser after the request completes
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the user's session if needed
  // and update cookies in both the request and response
  await supabase.auth.getUser()

  return response
}
