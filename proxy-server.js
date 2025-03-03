import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import Stripe from "stripe";
import { LRUCache } from "lru-cache";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// Configure Stripe with your secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || "");

// Setup rate limiting
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 20; // 20 requests per minute per IP

// Create rate limit cache using LRU
const rateLimitCache = new LRUCache({
  max: 500, // Store max 500 IP addresses
  ttl: rateLimitWindowMs, // Time to live
});

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  // Get client IP (consider X-Forwarded-For for proxied setups)
  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Get current request count for this IP
  const requestCount = rateLimitCache.get(clientIP) || 0;

  // Check if rate limit is exceeded
  if (requestCount >= maxRequestsPerWindow) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      retryAfter: Math.ceil(rateLimitWindowMs / 1000),
    });
  }

  // Increment request count
  rateLimitCache.set(clientIP, requestCount + 1);

  // Add rate limit headers
  res.setHeader("X-RateLimit-Limit", maxRequestsPerWindow);
  res.setHeader(
    "X-RateLimit-Remaining",
    maxRequestsPerWindow - (requestCount + 1)
  );

  next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter); // Apply rate limiting to all routes

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log when response is finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// Create Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { tier, email } = req.body;
    console.log("Received request:", { tier, email });

    if (!tier || !email) {
      console.log("Missing parameters:", { tier, email });
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

    console.log("Price IDs:", prices);
    const priceId = prices[tier];

    if (!priceId) {
      console.log("Invalid tier or missing price ID:", { tier, priceId });
      return res.status(400).json({
        success: false,
        message: "Invalid subscription tier or missing price ID",
      });
    }

    console.log("Creating checkout session with:", {
      priceId,
      email,
      successUrl: `${process.env.VITE_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.VITE_APP_URL}/signup`,
    });

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

    console.log("Checkout session created:", {
      sessionId: session.id,
      url: session.url,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", {
      error: error.message,
      stack: error.stack,
      stripeError: error.raw, // Stripe errors have additional details in .raw
    });
    res.status(500).json({
      success: false,
      message: error.message || "Error creating checkout session",
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
  res.status(200).json({
    status: "up",
    timestamp: new Date(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Create server
const server = createServer(app);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
