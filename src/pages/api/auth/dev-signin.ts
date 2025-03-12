import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase/client';
import { IS_DEV } from '@/utils/environment';

// Disable the default body parser to handle the request manually
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true, // Mark as being handled by an external resolver
  },
};

/**
 * Development-only API endpoint for authentication
 * This bypasses CSRF protection for testing purposes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers to allow requests from any origin in development
  if (IS_DEV) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow in development mode
  if (!IS_DEV) {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get email, password, and captcha token from request body
  const { email, password, captchaToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log('🔑 DEV AUTH: Attempting sign in for', email);
    
    // Prepare auth options
    const authOptions: any = {
      email,
      password,
      options: {}
    };
    
    // Add captcha token if provided
    if (captchaToken) {
      console.log('🔑 DEV AUTH: Using provided captcha token');
      authOptions.options.captchaToken = captchaToken;
    }
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword(authOptions);

    if (error) {
      console.error('🔑 DEV AUTH: Sign in error:', error.message);
      
      // If it's a captcha error, try with a different bypass token
      if (error.message.includes('captcha')) {
        console.log('🔑 DEV AUTH: Captcha error, trying with bypass token');
        
        // Try with a known bypass token
        authOptions.options.captchaToken = '1x00000000000000000000AA';
        const bypassResult = await supabase.auth.signInWithPassword(authOptions);
        
        if (bypassResult.error) {
          console.error('🔑 DEV AUTH: Bypass token failed:', bypassResult.error.message);
          return res.status(401).json({ error: bypassResult.error.message });
        }
        
        console.log('🔑 DEV AUTH: Sign in successful with bypass token');
        return res.status(200).json({ 
          success: true,
          session: bypassResult.data.session,
          user: bypassResult.data.user
        });
      }
      
      return res.status(401).json({ error: error.message });
    }

    console.log('🔑 DEV AUTH: Sign in successful');
    
    // Return the session information
    return res.status(200).json({ 
      success: true,
      session: data.session,
      user: data.user
    });
  } catch (error: any) {
    console.error('🔑 DEV AUTH: Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 