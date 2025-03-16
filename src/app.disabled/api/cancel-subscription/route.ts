import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Stripe } from 'stripe';
import type { Database } from '@/types/supabase.types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST() {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to cancel a subscription' },
        { status: 401 }
      );
    }
    
    // Get the user's subscription from the database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (subscriptionError || !subscriptionData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No active subscription found' },
        { status: 404 }
      );
    }
    
    // Cancel the subscription with Stripe
    // By default this will cancel at period end (not immediately)
    await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    
    // Update the subscription status in the database
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionData.stripe_subscription_id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription canceled successfully. You will have access until the end of your billing period.' 
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 