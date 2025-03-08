// Vercel Edge Function for user signup
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    // Check if we have the required environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Parse request body - handle different body formats
    let email, password, metadata;
    try {
      // In production, req.body might already be an object
      if (typeof req.body === "object" && req.body !== null) {
        email = req.body.email;
        password = req.body.password;
        metadata = req.body.metadata || {};
      } else {
        // Try to parse as JSON string
        const body = JSON.parse(req.body || "{}");
        email = body.email;
        password = body.password;
        metadata = body.metadata || {};
      }
    } catch (parseError) {
      console.error(
        "Failed to parse request body:",
        parseError,
        "body is:",
        typeof req.body
      );
      return res.status(400).json({
        error: "Invalid request body format",
        details: `Body type: ${typeof req.body}`,
      });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

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

      // Try to log the failure but don't fail if logging fails
      try {
        await supabase
          .from("security_logs")
          .insert({
            event_type: "signup_failed",
            ip_address: ip,
            user_agent: userAgent,
            details: error.message,
            email: email,
            created_at: new Date().toISOString(),
          })
          .throwOnError(false);
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

    // Try to create a profile entry
    try {
      // Set current time for timestamps
      const now = new Date().toISOString();

      // Set trial end date to 7 days from now
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      const trialEndsAtISO = trialEndsAt.toISOString();

      console.log("[Server] Creating profile for new user", data.user.id);

      // Create a profile with all required fields
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email.trim().toLowerCase(),
        name: metadata.name || email.split("@")[0] || "User",
        is_premium: true,
        trial_ends_at: trialEndsAtISO,
        subscription: {
          status: "trialing",
          plan_name: "Basic",
          current_period_end: trialEndsAtISO,
        },
        created_at: now,
        updated_at: now,
        last_sign_in_at: null,
        raw_app_meta_data: null,
        raw_user_meta_data: null,
      });

      if (profileError) {
        console.warn("[Server] Failed to create profile entry:", profileError);
        // Non-critical error, continue
      } else {
        console.log("[Server] Successfully created profile for new user");
      }
    } catch (profileError) {
      console.warn("[Server] Failed to create profile entry:", profileError);
      // Non-critical error, continue
    }

    // Log successful signup but don't fail if logging fails
    try {
      await supabase
        .from("security_logs")
        .insert({
          user_id: data.user.id,
          event_type: "signup_success",
          ip_address: ip,
          user_agent: userAgent,
          details: "Signup successful via server API",
          email: email,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
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
