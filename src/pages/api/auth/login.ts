import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase/client';

/**
 * API endpoint for handling login
 * This demonstrates using Supabase auth in a Next.js API route
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get email and password from request body
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Return the session information
    return res.status(200).json({ 
      session: data.session,
      user: data.user
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 