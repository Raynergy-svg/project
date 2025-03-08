import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import Stripe from "stripe";
import { LRUCache } from "lru-cache";
import { createClient } from "@supabase/supabase-js";

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

// Initialize Supabase
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

// Login handler
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get client IP for logging
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

    // Get user agent for logging
    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`[Auth] Login attempt for ${normalizedEmail} from ${ip}`);

    // Try standard login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    // Handle login failure or success
    if (error) {
      console.error("[Auth] Authentication error:", error);

      // Handle specific errors
      if (
        error.message?.includes("Email not confirmed") ||
        error.message?.includes("unconfirmed")
      ) {
        console.log(
          "[Auth] User has unconfirmed email, trying to get user by email"
        );

        // Try to find the user by email
        const { data: userData, error: userError } =
          await supabase.auth.admin.getUserByEmail(normalizedEmail);

        if (userError || !userData || !userData.user) {
          console.error("[Auth] Failed to find user by email:", userError);
          return res.status(401).json({
            error:
              "Please confirm your email before logging in, or contact support for assistance.",
          });
        }

        // Get the user ID from the admin API response
        const userId = userData.user.id;

        // Create a session for the user
        const { data: sessionData, error: sessionError } =
          await supabase.auth.admin.createSession({
            userId: userId,
          });

        if (sessionError || !sessionData || !sessionData.session) {
          console.error(
            "[Auth] Failed to create session for unconfirmed email user:",
            sessionError
          );
          return res.status(500).json({
            error:
              "Failed to authenticate. Please try again later or contact support.",
          });
        }

        // Session created successfully for unconfirmed email user
        console.log(
          "[Auth] Successfully created session for unconfirmed email user"
        );

        // Log successful login
        try {
          await supabase
            .from("security_logs")
            .insert({
              user_id: userId,
              event_type: "login_success",
              ip_address: ip,
              user_agent: userAgent,
              details:
                "Login successful via server API (unconfirmed email bypass)",
              email: normalizedEmail,
              created_at: new Date().toISOString(),
            })
            .throwOnError(false);
        } catch (logError) {
          console.warn("[Auth] Failed to log security event:", logError);
        }

        // Return the session and user data
        return res.status(200).json({
          session: sessionData.session,
          user: userData.user,
        });
      } else {
        // For other errors, just return the error
        return res.status(401).json({
          error:
            "Invalid email or password. Please check your credentials and try again.",
        });
      }
    }

    // Normal successful login
    if (!data || !data.session || !data.user) {
      return res.status(500).json({
        error: "Authentication successful but session data is missing.",
      });
    }

    // Log successful login
    try {
      await supabase
        .from("security_logs")
        .insert({
          user_id: data.user.id,
          event_type: "login_success",
          ip_address: ip,
          user_agent: userAgent,
          details: "Login successful via server API",
          email: normalizedEmail,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
    } catch (logError) {
      console.warn("[Auth] Failed to log security event:", logError);
    }

    // Return the session data
    return res.status(200).json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("[Auth] Unexpected error during authentication:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
});

// Signup handler
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, metadata = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get client IP for logging
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

    // Get user agent for logging
    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`[Auth] Signup attempt for ${normalizedEmail} from ${ip}`);

    // Server-side signup (bypasses CAPTCHA requirements)
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Auto-confirm email for server-side signup
      user_metadata: metadata,
    });

    if (error) {
      console.error("[Auth] Signup error:", error);

      // Try to log the failure but don't fail if logging fails
      try {
        await supabase
          .from("security_logs")
          .insert({
            event_type: "signup_failed",
            ip_address: ip,
            user_agent: userAgent,
            details: error.message,
            email: normalizedEmail,
            created_at: new Date().toISOString(),
          })
          .throwOnError(false);
      } catch (logError) {
        console.warn("[Auth] Failed to log security event:", logError);
      }

      // Return appropriate user-friendly error message
      if (error.message?.includes("already registered")) {
        return res.status(409).json({
          error:
            "An account with this email already exists. Please sign in instead.",
        });
      } else {
        return res.status(500).json({
          error: "Unable to create your account. Please try again later.",
        });
      }
    }

    if (!data.user) {
      return res.status(500).json({
        error: "Signup successful but user data is missing.",
      });
    }

    // Try to create a profile entry
    try {
      await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: normalizedEmail,
          name: metadata.name || "",
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
    } catch (profileError) {
      console.warn("[Auth] Failed to create profile entry:", profileError);
      // Non-critical error, continue
    }

    // Log successful signup
    try {
      await supabase
        .from("security_logs")
        .insert({
          user_id: data.user.id,
          event_type: "signup_success",
          ip_address: ip,
          user_agent: userAgent,
          details: "Signup successful via server API",
          email: normalizedEmail,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
    } catch (logError) {
      console.warn("[Auth] Failed to log security event:", logError);
    }

    // Return the user data
    return res.status(200).json({
      user: data.user,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("[Auth] Unexpected error during signup:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during signup" });
  }
});

// Security log handler
app.post("/api/auth/security-log", async (req, res) => {
  try {
    const { event_type, details, email, user_id } = req.body;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get client IP
    const ip_address =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

    // Get user agent
    const user_agent = req.headers["user-agent"] || "Unknown";

    try {
      // Log the security event
      const { error } = await supabase
        .from("security_logs")
        .insert({
          user_id: user_id || null,
          event_type: event_type || "unknown",
          ip_address,
          user_agent,
          details: details || "No details provided",
          email: email || null,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);

      if (error) {
        console.warn("[Auth] Failed to log security event:", error);
        // Still return success to avoid blocking auth flow
        return res
          .status(200)
          .json({ success: true, message: "Logging failed but proceeding" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("[Auth] Error logging security event:", error);
      // Return success anyway to not break the auth flow
      return res
        .status(200)
        .json({ success: true, message: "Logging failed but proceeding" });
    }
  } catch (error) {
    console.error("[Auth] Error in security logging endpoint:", error);
    // Return success anyway to not break the auth flow
    return res
      .status(200)
      .json({ success: true, message: "Endpoint error but proceeding" });
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
