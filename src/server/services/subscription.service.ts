import Stripe from 'stripe';
import { config } from '../config/config';
import { UserService } from '../models/User';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export const SubscriptionService = {
  async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const { customer, status } = subscription;
    
    if (typeof customer !== 'string') {
      throw new SubscriptionError('Invalid customer ID');
    }

    const customerData = await stripe.customers.retrieve(customer);
    if (!('email' in customerData)) {
      throw new SubscriptionError('Invalid customer data');
    }

    const user = await UserService.findByEmail(customerData.email);
    if (!user) {
      throw new SubscriptionError('User not found');
    }

    await UserService.updateSubscription(
      user.id,
      subscription.id,
      status === 'active' ? 'active' : 'inactive'
    );

    return { userId: user.id, subscriptionId: subscription.id, status };
  },

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { status, customer } = subscription;

    if (typeof customer !== 'string') {
      throw new SubscriptionError('Invalid customer ID');
    }

    const customerData = await stripe.customers.retrieve(customer);
    if (!('email' in customerData)) {
      throw new SubscriptionError('Invalid customer data');
    }

    const user = await UserService.findByEmail(customerData.email);
    if (!user) {
      throw new SubscriptionError('User not found');
    }

    await UserService.updateSubscription(
      user.id,
      subscription.id,
      status === 'active' ? 'active' : 'inactive'
    );

    return { userId: user.id, subscriptionId: subscription.id, status };
  },

  async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const { customer } = subscription;

    if (typeof customer !== 'string') {
      throw new SubscriptionError('Invalid customer ID');
    }

    const customerData = await stripe.customers.retrieve(customer);
    if (!('email' in customerData)) {
      throw new SubscriptionError('Invalid customer data');
    }

    const user = await UserService.findByEmail(customerData.email);
    if (!user) {
      throw new SubscriptionError('User not found');
    }

    await UserService.updateSubscription(user.id, subscription.id, 'inactive');
    return { userId: user.id, subscriptionId: subscription.id, status: 'inactive' };
  },

  async createCheckoutSession(planId: string, userId: string) {
    const user = await UserService.findByEmail(userId);
    if (!user) {
      throw new SubscriptionError('User not found');
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId === 'basic' 
            ? config.stripe.basicPlanId 
            : config.stripe.proPlanId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${config.app.url}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app.url}/signup`,
    });

    return session;
  },
}; 