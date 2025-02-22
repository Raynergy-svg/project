import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { SubscriptionDetails, prepareSubscriptionPayload } from '../utils/payment';

interface PaymentResult {
  subscriptionId: string;
  oneTimePaymentIntentId?: string;
  trialEndsAt?: string;
}

interface UseStripePaymentProps {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

export const useStripePayment = ({ onSuccess, onError }: UseStripePaymentProps = {}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (details: SubscriptionDetails) => {
    if (!stripe || !elements) {
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement as StripeCardElement,
        billing_details: {
          email: details.email,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentMethod) {
        throw new Error('Payment method creation failed');
      }

      // Prepare the request payload with proper currency conversion and trial period
      const payload = {
        paymentMethodId: paymentMethod.id,
        ...prepareSubscriptionPayload(details),
        // Add trial period for Basic plan
        trialPeriodDays: details.priceId === 'BASIC' ? 7 : undefined
      };

      // Make API call to create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const { clientSecret, subscriptionId, oneTimePaymentIntentId, trialEndsAt } = await response.json();

      // Confirm the subscription payment if there's a client secret
      if (clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      onSuccess?.({ subscriptionId, oneTimePaymentIntentId, trialEndsAt });
      return { subscriptionId, oneTimePaymentIntentId, trialEndsAt };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handlePayment,
    isProcessing,
    error,
    stripe,
    elements,
  };
}; 