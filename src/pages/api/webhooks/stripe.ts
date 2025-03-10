import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API endpoint for handling Stripe webhook events
 * This processes subscription-related events from Stripe to update the database
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Check if Stripe API key is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe configuration');
    return res.status(500).json({ error: 'Stripe not properly configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  // Get the raw body
  const rawBody = await buffer(req);
  
  // Get the Stripe signature from headers
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Create a Supabase client directly (not using cookies since this is a webhook)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // Use service key for admin privileges
  );

  // Handle specific Stripe events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode !== 'subscription' || !session.subscription) {
          break;
        }

        // Get the user ID from the session metadata
        const userId = session.metadata?.userId || session.client_reference_id;
        
        if (!userId) {
          console.error('Missing userId in session metadata');
          break;
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Create a subscription record in the database
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              plan_name: (subscription.items.data[0].price.nickname || 'Premium'),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase error creating subscription:', error);
          break;
        }

        // Update the user's profile with subscription info
        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        
        console.log('Subscription created successfully:', data);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get the subscription from database using Stripe subscription ID
        const { data: subscriptionData, error: fetchError } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (fetchError || !subscriptionData) {
          console.error('Error finding subscription:', fetchError || 'Subscription not found');
          break;
        }

        // Update the subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionData.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          break;
        }

        // Update user profile if subscription status changes to inactive
        if (subscription.status !== 'active') {
          await supabase
            .from('profiles')
            .update({
              is_premium: false,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('id', subscriptionData.user_id);
        }

        console.log('Subscription updated successfully:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get the subscription from database using Stripe subscription ID
        const { data: subscriptionData, error: fetchError } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (fetchError || !subscriptionData) {
          console.error('Error finding subscription:', fetchError || 'Subscription not found');
          break;
        }

        // Update the subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionData.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          break;
        }

        // Update user profile
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionData.user_id);

        console.log('Subscription deleted successfully:', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed: ' + error.message });
  }
} 