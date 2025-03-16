import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    // Extract token and type from request body
    const { token_hash, type } = req.body;

    if (!token_hash || !type) {
      return res.status(400).json({ 
        error: { message: 'Missing token_hash or type parameter' } 
      });
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return req.cookies[name];
          },
          set(name, value, options) {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
          },
          remove(name, options) {
            res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
          },
        },
      }
    );

    // Verify email without needing to redirect again
    // This API call is redundant since Supabase will handle the verification
    // with the right redirect URL, but having this endpoint can be useful
    // for more complex confirmation flows

    // Return success
    return res.status(200).json({ 
      data: { message: 'Email confirmation processed' } 
    });
  } catch (error) {
    console.error('Error in email confirmation:', error);
    return res.status(500).json({ 
      error: { message: 'Internal server error during confirmation' } 
    });
  }
} 