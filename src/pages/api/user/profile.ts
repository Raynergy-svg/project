import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

/**
 * API endpoint for retrieving and updating user profiles
 * This handles both GET (retrieve profile) and PATCH (update profile) requests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create Supabase server client
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

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Get user profile
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(profile);
      } catch (error: any) {
        console.error('Server error fetching profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'PATCH':
      // Update user profile
      try {
        const updateData = req.body;
        
        // Remove any fields that shouldn't be updated
        delete updateData.id;
        delete updateData.email;
        delete updateData.created_at;
        
        // Prevent updating role/permissions directly through this endpoint
        delete updateData.role;
        delete updateData.permissions;

        const { data: updatedProfile, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating profile:', error);
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(updatedProfile);
      } catch (error: any) {
        console.error('Server error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 