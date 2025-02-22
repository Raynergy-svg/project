import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { convertToSubcurrency } from '../../utils/currency';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      paymentMethodId, 
      priceId, 
      email,
      setupFee,
      oneTimeAmount 
    } = req.body;

    // After extracting paymentMethodId and priceId from req.body
    // If handling one-time payments where you need to set an explicit amount, you can use the convertToSubcurrency utility to convert dollars to cents.
    // Example:
    // import { convertToSubcurrency } from '../../utils/currency';
    // const amountInCents = convertToSubcurrency(19.99); // Converts $19.99 to 1999 cents, then use in creating a PaymentIntent

    // Create a customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: email,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Handle setup fee or one-time payment if present
    let setupFeeInvoiceItem;
    if (setupFee) {
      setupFeeInvoiceItem = await stripe.invoiceItems.create({
        customer: customer.id,
        amount: setupFee, // Already converted to cents by client
        currency: 'usd',
        description: 'One-time setup fee',
      });
    }

    // Handle additional one-time charge if present
    let oneTimePaymentIntent;
    if (oneTimeAmount) {
      oneTimePaymentIntent = await stripe.paymentIntents.create({
        amount: oneTimeAmount, // Already converted to cents by client
        currency: 'usd',
        customer: customer.id,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: 'One-time payment',
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
      expand: ['latest_invoice.payment_intent'],
      // If we have a setup fee, collect it now
      add_invoice_items: setupFeeInvoiceItem ? [{ invoice_item: setupFeeInvoiceItem.id }] : undefined,
    });

    // Return all relevant IDs and secrets
    return res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret,
      oneTimePaymentIntentId: oneTimePaymentIntent?.id,
      setupFeeInvoiceItemId: setupFeeInvoiceItem?.id,
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
} 