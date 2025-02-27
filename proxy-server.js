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
      session_id.toString()
    );

    // Check if session exists and payment is successful
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed or session invalid",
      });
    }

    // In a real app, you would update user information in your database here
    // This is a simplified example

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      plan: "Premium", // You would get this from your database or Stripe product info
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
