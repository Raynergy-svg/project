import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

/**
 * API endpoint for creating a new subscription
 * Handles the initial step of creating a Stripe checkout session for subscription
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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

  // Check if Stripe API key is set
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe API key not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use the latest stable API version
  });

  try {
    // Get user profile to use their email for Stripe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(400).json({ error: profileError.message });
    }

    const { priceId, successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'priceId, successUrl, and cancelUrl are required' });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return res.status(400).json({ 
        error: 'User already has an active subscription',
        subscription: existingSubscription
      });
    }

    // Create a Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: profile.email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    });

    return res.status(200).json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ 
      error: 'Failed to create subscription', 
      details: error.message
    });
  }
} 