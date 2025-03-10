import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

/**
 * API endpoint for operations on a specific bank account
 * Handles GET (retrieve account), PATCH (update account), and DELETE (remove account) requests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the account ID from the URL
  const { accountId } = req.query;
  
  if (!accountId || Array.isArray(accountId)) {
    return res.status(400).json({ error: 'Invalid account ID' });
  }

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

  // Verify that the account belongs to the authenticated user
  try {
    const { data: account, error } = await supabase
      .from('bank_accounts')
      .select('id, user_id')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Error fetching account:', error);
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden - Account does not belong to authenticated user' });
    }
  } catch (error: any) {
    console.error('Server error verifying account ownership:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Get a specific bank account
      try {
        const { data: account, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('id', accountId)
          .single();

        if (error) {
          console.error('Error fetching bank account:', error);
          return res.status(404).json({ error: 'Account not found' });
        }

        return res.status(200).json(account);
      } catch (error: any) {
        console.error('Server error fetching bank account:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'PATCH':
      // Update a bank account
      try {
        const updateData = req.body;
        
        // Don't allow changing of user_id
        delete updateData.user_id;
        delete updateData.id;
        
        const { data: updatedAccount, error } = await supabase
          .from('bank_accounts')
          .update(updateData)
          .eq('id', accountId)
          .select()
          .single();

        if (error) {
          console.error('Error updating bank account:', error);
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(updatedAccount);
      } catch (error: any) {
        console.error('Server error updating bank account:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'DELETE':
      // Delete a bank account
      try {
        const { error } = await supabase
          .from('bank_accounts')
          .delete()
          .eq('id', accountId);

        if (error) {
          console.error('Error deleting bank account:', error);
          return res.status(400).json({ error: error.message });
        }

        return res.status(204).end();
      } catch (error: any) {
        console.error('Server error deleting bank account:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 