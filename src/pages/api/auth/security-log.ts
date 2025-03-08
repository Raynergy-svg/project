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
    const { event_type, details, email, user_id } = req.body;

    if (!event_type || !details) {
      return res.status(400).json({ error: 'Event type and details are required' });
    }

    // Get client IP
    const forwarded = req.headers['x-forwarded-for'];
    const ip_address = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) 
      : req.socket.remoteAddress || '0.0.0.0';
    
    // Get user agent
    const user_agent = req.headers['user-agent'] || 'Unknown';

    // Log the security event
    const { error } = await supabase.from('security_logs').insert({
      user_id: user_id || null,
      event_type,
      ip_address,
      user_agent,
      details,
      email: email || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      // Check if it's just a missing table (404) which is non-critical
      if (error.code === '404' || error.code === 'PGRST116') {
        console.log('[Server] Security logs table not available - ignoring');
        return res.status(200).json({ success: true, message: 'Logging skipped - table not available' });
      } else {
        console.warn('[Server] Failed to log security event:', error);
        return res.status(500).json({ error: 'Failed to log security event' });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Server] Error logging security event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 