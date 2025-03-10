import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

/**
 * API endpoint for retrieving and creating bank accounts
 * Handles GET (retrieve accounts) and POST (create account) requests
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
      // Get all bank accounts for the user
      try {
        const { data: accounts, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bank accounts:', error);
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(accounts);
      } catch (error: any) {
        console.error('Server error fetching bank accounts:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'POST':
      // Create a new bank account
      try {
        const accountData = req.body;
        
        // Validate required fields
        if (!accountData.account_name || !accountData.account_type) {
          return res.status(400).json({ error: 'account_name and account_type are required' });
        }

        // Set user_id from the authenticated user
        accountData.user_id = userId;
        
        const { data: newAccount, error } = await supabase
          .from('bank_accounts')
          .insert([accountData])
          .select()
          .single();

        if (error) {
          console.error('Error creating bank account:', error);
          return res.status(400).json({ error: error.message });
        }

        return res.status(201).json(newAccount);
      } catch (error: any) {
        console.error('Server error creating bank account:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 