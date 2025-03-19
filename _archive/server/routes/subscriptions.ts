import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../lib/supabase';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create a subscription
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { priceId, email, paymentMethodId, trialDays } = req.body;
    const userId = req.user!.id;

    // Create or get customer
    let customer;
    const { data: existingCustomer } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      trial_period_days: trialDays,
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription in Supabase
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        status: subscription.status,
        plan_id: priceId,
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      });

    if (subscriptionError) {
      throw new Error(`Error storing subscription: ${subscriptionError.message}`);
    }

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status,
      trialEnd: subscription.trial_end,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    });
  }
});

// Cancel a subscription
router.post('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify subscription belongs to user
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('stripe_subscription_id', id)
      .single();

    if (subscriptionError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel the subscription
    await stripe.subscriptions.cancel(id);

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date(),
      })
      .eq('stripe_subscription_id', id);

    if (updateError) {
      throw new Error(`Error updating subscription: ${updateError.message}`);
    }

    res.json({ status: 'canceled' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    });
  }
});

// Update a subscription
router.post('/:id/update', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { priceId } = req.body;
    const userId = req.user!.id;

    // Verify subscription belongs to user
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('stripe_subscription_id', id)
      .single();

    if (subscriptionError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.retrieve(id);
    await stripe.subscriptions.update(id, {
      items: [{
        id: updatedSubscription.items.data[0].id,
        price: priceId,
      }],
    });

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_id: priceId,
      })
      .eq('stripe_subscription_id', id);

    if (updateError) {
      throw new Error(`Error updating subscription: ${updateError.message}`);
    }

    res.json({ status: 'updated' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to update subscription',
    });
  }
});

// Get subscription status
router.get('/:id/status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, trial_end')
      .eq('user_id', userId)
      .eq('stripe_subscription_id', id)
      .single();

    if (error || !subscription) {
      throw new Error('Subscription not found');
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get subscription status',
    });
  }
});

export default router; 