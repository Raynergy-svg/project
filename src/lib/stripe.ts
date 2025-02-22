import { loadStripe } from '@stripe/stripe-js';
import type { StripeConstructorOptions } from '@stripe/stripe-js';

// Configure Stripe with improved cookie handling
const stripeConfig: StripeConstructorOptions = {
  betas: ['partitioned_cookies_beta_1'],
  locale: 'en',
  apiVersion: '2023-10-16',
};

// Initialize Stripe with configuration
export const stripePromise = loadStripe(
  import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  stripeConfig
);

// Subscription plan IDs - replace these with your actual Stripe price IDs
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    priceId: 'price_basic',
    name: 'Basic',
    price: '$9.99/mo',
    features: [
      'Basic debt calculator',
      'Single debt strategy',
      'Monthly payment tracking',
      'Basic spending insights',
      'Limited AI Tokens (100/mo)'
    ]
  },
  PRO: {
    priceId: 'price_pro',
    name: 'Pro',
    price: '$19.99/mo',
    features: [
      'Advanced debt calculator',
      'All debt strategies',
      'Real-time payment tracking',
      'Deep financial insights',
      'Unlimited AI Tokens'
    ]
  }
};

export interface CreateSubscriptionData {
  priceId: string;
  customerId?: string;
  email: string;
  paymentMethodId: string;
  trialDays?: number;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  status: string;
  trialEnd?: number;
}

export async function createSubscription(data: CreateSubscriptionData): Promise<SubscriptionResponse> {
  const response = await fetch('/api/subscriptions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create subscription');
  }

  return response.json();
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel subscription');
  }
}

export async function updateSubscription(subscriptionId: string, newPriceId: string): Promise<void> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId: newPriceId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update subscription');
  }
}

export async function getSubscriptionStatus(subscriptionId: string): Promise<string> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/status`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get subscription status');
  }

  const data = await response.json();
  return data.status;
}

// Payment link configuration
export const PAYMENT_LINKS = {
  test: {
    basic: 'https://buy.stripe.com/test_4gwcPW1HN8597x64gi',
    pro: 'https://buy.stripe.com/test_8wM5nu72799dbNm6or'
  },
  live: {
    basic: 'https://buy.stripe.com/4gwcPW1HN8597x64gi',
    pro: 'https://buy.stripe.com/8wM5nu72799dbNm6or'
  }
};

// Helper function to get subscription details
export const getSubscriptionDetails = (planId: keyof typeof SUBSCRIPTION_PLANS) => {
  return SUBSCRIPTION_PLANS[planId];
}; 