import express from 'express';
import { stripe } from '../services/stripe.service.js';

const router = express.Router();

// Add this new route for verifying the Stripe session
router.get('/verify-session', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ 
        success: false,
        message: 'No session ID provided'
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    
    // Check if session exists and payment is successful
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed or session invalid'
      });
    }
    
    // Get user from the session metadata
    const userId = session.metadata?.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found in session metadata'
      });
    }
    
    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Get the plan name from the product
    const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);
    
    // Update user's subscription in database
    await db.collection('users').doc(userId).update({
      subscriptionId: session.subscription,
      subscriptionStatus: 'active',
      planId: product.id,
      planName: product.name,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date()
    });
    
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      plan: product.name
    });
    
  } catch (error) {
    console.error('Error verifying session:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
});

export default router; 