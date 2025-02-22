import { Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../../config/config';
import { SubscriptionService } from '../../services/subscription.service';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export const WebhookController = {
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'No signature provided' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );

      switch (event.type) {
        case 'customer.subscription.created':
          await SubscriptionService.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await SubscriptionService.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await SubscriptionService.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(400).json({ error: 'Webhook error' });
    }
  },
}; 