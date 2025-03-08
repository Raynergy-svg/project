// Vercel Edge Function for user signup
import { createClient } from "@supabase/supabase-js";
import { withRateLimit } from "../../src/utils/rate-limit";

// Server-side Supabase client with service role key
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create an isolated Supabase client for the API
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Original handler function
async function signupHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, metadata = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Process the signup with Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Auto-confirm email for simplicity
      user_metadata: metadata,
    });

    if (error) {
      console.error("Signup error:", error);
      // Check for duplicate user errors
      if (
        error.message.includes("already exists") ||
        error.message.includes("unique constraint")
      ) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }
      return res.status(400).json({ error: error.message });
    }

    // Log successful signup
    console.log(`Successful signup for ${normalizedEmail}`);

    return res.status(200).json({ user: data.user });
  } catch (error) {
    console.error("Unexpected signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(signupHandler, "signup");
