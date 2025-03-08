import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/types/supabase-types';

// Server-side Supabase client (uses server-side environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get client IP for logging
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) 
      : req.socket.remoteAddress || '0.0.0.0';
    
    // Get user agent for logging
    const userAgent = req.headers['user-agent'] || 'Unknown';

    console.log(`[Server] Authentication attempt for ${email} from ${ip}`);

    // Server-side authentication (bypasses CAPTCHA requirements)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('[Server] Authentication error:', error);
      
      // Try to log the failure
      try {
        await supabase.from('security_logs').insert({
          event_type: 'login_failed',
          ip_address: ip,
          user_agent: userAgent,
          details: error.message,
          email: email,
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        // Non-critical, just log warning
        console.warn('[Server] Failed to log security event:', logError);
      }

      // Return appropriate user-friendly error message
      if (error.status === 400 || error.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid email or password. Please check your credentials and try again.'
        });
      } else if (error.status === 429) {
        return res.status(429).json({ 
          error: 'Too many login attempts. Please try again later.'
        });
      } else {
        return res.status(500).json({ 
          error: 'Our sign-in system is temporarily unavailable. Please try again in a few minutes.'
        });
      }
    }

    if (!data.session || !data.user) {
      return res.status(500).json({ 
        error: 'Authentication successful but session data is missing.'
      });
    }

    // Log successful login
    try {
      await supabase.from('security_logs').insert({
        user_id: data.user.id,
        event_type: 'login_success',
        ip_address: ip,
        user_agent: userAgent,
        details: 'Login successful via server API',
        email: email,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      // Non-critical, just log warning
      console.warn('[Server] Failed to log security event:', logError);
    }

    // Return the session data
    return res.status(200).json({
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.error('[Server] Unexpected error during authentication:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
} 