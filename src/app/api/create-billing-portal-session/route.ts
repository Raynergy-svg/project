import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Stripe } from 'stripe';
import type { Database } from '@/types/supabase.types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access billing portal' },
        { status: 401 }
      );
    }
    
    // Get user's stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No billing information found' },
        { status: 404 }
      );
    }
    
    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`,
    });
    
    // Redirect to the billing portal
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    
    // Redirect to subscription page with error
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/subscription?error=Failed+to+access+billing+portal`, 
      { status: 303 }
    );
  }
} 