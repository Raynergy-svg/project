// Vercel Edge Function for user signup
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apikey, x-client-info, x-supabase-auth"
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse JSON body
    const { email, password, metadata = {} } = JSON.parse(req.body);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for logging
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(",")[0]
      : "0.0.0.0";

    // Get user agent for logging
    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`[Server] Signup attempt for ${email} from ${ip}`);

    // Server-side signup (bypasses CAPTCHA requirements)
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm email for server-side signup
      user_metadata: metadata,
    });

    if (error) {
      console.error("[Server] Signup error:", error);

      // Try to log the failure
      try {
        await supabase.from("security_logs").insert({
          event_type: "signup_failed",
          ip_address: ip,
          user_agent: userAgent,
          details: error.message,
          email: email,
          created_at: new Date().toISOString(),
        });
      } catch (logError) {
        // Non-critical, just log warning
        console.warn("[Server] Failed to log security event:", logError);
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

    // Log successful signup
    try {
      await supabase.from("security_logs").insert({
        user_id: data.user.id,
        event_type: "signup_success",
        ip_address: ip,
        user_agent: userAgent,
        details: "Signup successful via server API",
        email: email,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      // Non-critical, just log warning
      console.warn("[Server] Failed to log security event:", logError);
    }

    // Return the user data
    return res.status(200).json({
      user: data.user,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("[Server] Unexpected error during signup:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during signup" });
  }
}
