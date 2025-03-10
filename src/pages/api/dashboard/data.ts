import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

/**
 * API endpoint for retrieving dashboard data
 * This will fetch all the data needed for the dashboard view:
 * - Debt overview
 * - Bank accounts
 * - Payment history
 * - Analytics
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
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

  try {
    // Fetch data in parallel for better performance
    const [debtsResult, accountsResult, paymentsResult, analyticsSummaryResult] = await Promise.all([
      // Get all debts for the user
      supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('interest_rate', { ascending: false }),
      
      // Get all bank accounts for the user
      supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get recent payment history
      supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false })
        .limit(10),
      
      // Get analytics summary
      supabase
        .from('analytics_summary')
        .select('*')
        .eq('user_id', userId)
        .single()
    ]);

    // Check for errors
    if (debtsResult.error) {
      console.error('Error fetching debts:', debtsResult.error);
      return res.status(400).json({ error: debtsResult.error.message });
    }

    if (accountsResult.error) {
      console.error('Error fetching accounts:', accountsResult.error);
      return res.status(400).json({ error: accountsResult.error.message });
    }

    if (paymentsResult.error) {
      console.error('Error fetching payments:', paymentsResult.error);
      return res.status(400).json({ error: paymentsResult.error.message });
    }

    // Analytics summary might not exist yet for new users, so don't treat as error
    const analyticsSummary = analyticsSummaryResult.error ? null : analyticsSummaryResult.data;

    // Calculate debt totals
    const totalDebt = debtsResult.data.reduce((sum, debt) => sum + (debt.current_balance || 0), 0);
    const totalMinPayment = debtsResult.data.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
    
    // Get upcoming payment
    const today = new Date();
    const upcomingPayments = debtsResult.data
      .filter(debt => debt.next_payment_date)
      .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime());
    
    const nextPayment = upcomingPayments.length > 0 ? upcomingPayments[0] : null;

    // Compile the dashboard data
    const dashboardData = {
      debts: debtsResult.data,
      accounts: accountsResult.data,
      recentPayments: paymentsResult.data,
      analytics: analyticsSummary,
      summary: {
        totalDebt,
        totalMinPayment,
        debtCount: debtsResult.data.length,
        accountsCount: accountsResult.data.length,
        nextPayment
      }
    };

    return res.status(200).json(dashboardData);
  } catch (error: any) {
    console.error('Server error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 