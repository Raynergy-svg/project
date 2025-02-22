import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno&no-check'

// Initialize environment variables
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')?.trim() ?? '';
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')?.trim() ?? '';
const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';

// Validate environment variables
if (!webhookSecret || !stripeKey || !supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment variables');
}

// Initialize Stripe
const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // Get the raw body
    const body = await req.text();
    
    let event;
    try {
      // Construct and verify the event
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response(`Webhook verification failed: ${err.message}`, { status: 400 });
    }

    console.log(`Processing event type: ${event.type}`);

    // Handle the event based on its type
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err) {
      console.error(`Error handling event ${event.type}:`, err);
      return new Response(
        JSON.stringify({ error: `Error handling event ${event.type}`, details: err.message }), 
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }), 
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer details
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    throw new Error('Customer was deleted');
  }

  // Find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', (customer as any).email)
    .single();

  if (userError) {
    throw new Error(`User not found: ${userError.message}`);
  }

  // Insert subscription data
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert([{
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      plan_id: subscription.items.data[0].price.id,
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    }]);

  if (subscriptionError) {
    throw new Error(`Error inserting subscription: ${subscriptionError.message}`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw new Error(`Error updating subscription: ${error.message}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw new Error(`Error deleting subscription: ${error.message}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return; // Not subscription related
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'active',
      last_payment_date: new Date().toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    throw new Error(`Error updating subscription after payment: ${error.message}`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return; // Not subscription related
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'past_due',
      last_payment_error: invoice.last_payment_error?.message
    })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    throw new Error(`Error updating subscription after failed payment: ${error.message}`);
  }
} 