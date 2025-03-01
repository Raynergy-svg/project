import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});
