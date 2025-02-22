import { convertToSubcurrency } from './currency';

export interface PaymentDetails {
  amount: number;
  currency?: string;
  description?: string;
}

export interface SubscriptionDetails {
  priceId: string;
  setupFee?: number;
  oneTimeAmount?: number;
  email: string;
}

export function preparePaymentAmount(amount: number): number {
  return convertToSubcurrency(amount);
}

export function prepareSubscriptionPayload(details: SubscriptionDetails): any {
  const payload: any = {
    priceId: details.priceId,
    email: details.email,
  };

  if (details.setupFee) {
    payload.setupFee = convertToSubcurrency(details.setupFee);
  }

  if (details.oneTimeAmount) {
    payload.oneTimeAmount = convertToSubcurrency(details.oneTimeAmount);
  }

  return payload;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
}

export function calculateTotalAmount(details: SubscriptionDetails): number {
  let total = 0;
  if (details.setupFee) {
    total += convertToSubcurrency(details.setupFee);
  }
  if (details.oneTimeAmount) {
    total += convertToSubcurrency(details.oneTimeAmount);
  }
  return total;
} 