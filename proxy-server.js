const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const Stripe = require("stripe");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Configure Stripe with your secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || "");

// Middleware
app.use(cors());
app.use(express.json());

// Create Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { tier, email } = req.body;

    if (!tier || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Define price IDs for each tier
    const prices = {
      basic: process.env.VITE_STRIPE_BASIC_PRICE_ID,
      pro: process.env.VITE_STRIPE_PRO_PRICE_ID,
    };

    const priceId = prices[tier];
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription tier",
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.VITE_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/signup`,
      customer_email: email,
      metadata: {
        tier,
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      message: "Error creating checkout session",
    });
  }
});

// Verify Stripe session endpoint
app.get("/api/subscription/verify-session", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "No session ID provided",
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(
      session_id.toString(),
      {
        expand: ["subscription", "customer"],
      }
    );

    // Check if session exists and payment is successful
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed or session invalid",
      });
    }

    // Get subscription details
    const subscription = session.subscription;
    const customer = session.customer;

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscriptionId: subscription.id,
      customerId: customer.id,
      plan: session.metadata.tier,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "up", timestamp: new Date() });
});

// Create server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
