import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase/client';

/**
 * API route to get the current session
 * This demonstrates how to use Supabase auth in a Next.js API route
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(200).json({ session: data.session });
  } catch (error: any) {
    console.error('Error getting session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 