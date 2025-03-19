import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno&no-check'

// Initialize environment variables
const REQUIRED_ENV_VARS = {
  STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET')?.trim(),
  STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY')?.trim(),
  SUPABASE_URL: Deno.env.get('SUPABASE_URL')?.trim(),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
} as const;

// Log which variables are loaded (without exposing values)
console.log('Environment variables status:', Object.fromEntries(
  Object.entries(REQUIRED_ENV_VARS).map(([key, value]) => [key, !!value])
));

// Check for missing variables
const missingVars = Object.entries(REQUIRED_ENV_VARS)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Initialize with validated variables
const webhookSecret = REQUIRED_ENV_VARS.STRIPE_WEBHOOK_SECRET;
const stripeKey = REQUIRED_ENV_VARS.STRIPE_SECRET_KEY;
const supabaseUrl = REQUIRED_ENV_VARS.SUPABASE_URL;
const serviceRoleKey = REQUIRED_ENV_VARS.SUPABASE_SERVICE_ROLE_KEY;

// Log detailed environment status
console.log('Environment configuration:', {
  webhookSecretLength: webhookSecret.length,
  stripeKeyPrefix: stripeKey.substring(0, 8),
  supabaseUrl,
  serviceRoleKeyLength: serviceRoleKey.length
});

// Initialize Stripe with error handling
let stripe: Stripe;
try {
  stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });
  console.log('Stripe client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Stripe client:', error);
  throw error;
}

// Initialize Supabase with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw error;
}

// List of events we want to handle
const HANDLED_EVENTS = [
  'customer.created',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];

serve(async (req: Request) => {
  try {
    console.log('Received webhook request:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No signature found in headers');
      return new Response('No signature found', { status: 400 });
    }

    // Log all request headers for debugging
    console.log('All request headers:', Object.fromEntries(req.headers.entries()));

    // Get the raw body
    const body = await req.text();
    console.log('Webhook verification attempt:', {
      timestamp: new Date().toISOString(),
      signatureHeader: signature,
      signatureLength: signature.length,
      webhookSecretFirstChars: webhookSecret.substring(0, 10) + '...',
      webhookSecretLength: webhookSecret.length,
      bodyPreview: body.substring(0, 100) + '...',
      bodyLength: body.length,
      contentType: req.headers.get('content-type'),
      rawSignatureHeader: req.headers.get('stripe-signature')
    });
    
    let event;
    try {
      // Construct and verify the event
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Event constructed successfully:', {
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString()
      });
    } catch (err) {
      console.error('Webhook verification failed:', {
        error: err.message,
        errorName: err.name,
        errorStack: err.stack,
        signatureHeader: signature,
        signatureLength: signature.length,
        webhookSecretFirstChars: webhookSecret.substring(0, 10) + '...',
        webhookSecretLength: webhookSecret.length,
        bodyLength: body.length,
        timestamp: new Date().toISOString(),
        contentType: req.headers.get('content-type')
      });
      return new Response(`Webhook verification failed: ${err.message}`, { status: 400 });
    }

    // Check if we handle this event type
    if (!HANDLED_EVENTS.includes(event.type)) {
      console.log(`Ignoring unhandled event type: ${event.type}`);
      return new Response(JSON.stringify({ received: true, handled: false }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Processing event:`, {
      type: event.type,
      id: event.id,
      object: event.data.object.id,
      created: new Date(event.created * 1000).toISOString()
    });

    // Handle the event based on its type
    try {
      switch (event.type) {
        case 'customer.created':
          await handleCustomerCreated(event.data.object);
          break;
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
      }

      console.log(`Successfully handled event:`, {
        type: event.type,
        id: event.id
      });

      return new Response(JSON.stringify({ received: true, handled: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err) {
      console.error(`Error handling event:`, {
        type: event.type,
        id: event.id,
        error: err.message,
        stack: err.stack
      });
      return new Response(
        JSON.stringify({ 
          error: `Error handling event ${event.type}`, 
          details: err.message,
          stack: err.stack 
        }), 
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (err) {
    console.error('Error processing webhook:', {
      error: err.message,
      stack: err.stack
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: err.message,
        stack: err.stack 
      }), 
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Handling customer.created event:', {
    customerId: customer.id,
    email: customer.email
  });
  
  try {
    if (!customer.email) {
      console.log('Customer has no email, skipping');
      return;
    }

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('email', customer.email)
      .single();

    console.log('Existing user query result:', { existingUser, error: userError });

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking for existing user:', userError);
      throw new Error(`Error checking for existing user: ${userError.message}`);
    }

    if (!existingUser) {
      console.log('Creating new user for email:', customer.email);
      // Create new user if doesn't exist
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          email: customer.email,
          stripe_customer_id: customer.id
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        throw new Error(`Error creating user: ${insertError.message}`);
      }

      console.log('Created new user:', newUser);
    } else {
      console.log('Updating existing user:', existingUser.id);
      // Update existing user with Stripe customer ID
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw new Error(`Error updating user: ${updateError.message}`);
      }

      console.log('Updated user:', updatedUser);
    }
  } catch (error) {
    console.error('Error in handleCustomerCreated:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Handling subscription.created event:', subscription);
  
  try {
    const customerId = subscription.customer as string;
    
    // Get customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      throw new Error('Customer was deleted');
    }

    // Find user by Stripe customer ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (userError) {
      console.error('Error finding user:', userError);
      throw new Error(`User not found: ${userError.message}`);
    }

    if (!user) {
      console.error('No user found for customer ID:', customerId);
      throw new Error(`No user found for customer ID: ${customerId}`);
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
      console.error('Error inserting subscription:', subscriptionError);
      throw new Error(`Error inserting subscription: ${subscriptionError.message}`);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
    throw error;
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