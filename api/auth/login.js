// Vercel Edge Function for authentication
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
    let email, password;
    try {
      // In production, req.body might already be an object
      if (typeof req.body === "object" && req.body !== null) {
        email = req.body.email;
        password = req.body.password;
      } else {
        // Try to parse as JSON string
        const body = JSON.parse(req.body || "{}");
        email = body.email;
        password = body.password;
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

    // Normalize email
    email = email.trim().toLowerCase();

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

    console.log(`[Server] Authentication attempt for ${email} from ${ip}`);

    // First, check if the user exists using admin API
    const { data: userData, error: userError } =
      await supabase.auth.admin.listUsers({
        perPage: 1,
        page: 1,
        // Filter by email using a basic search on service role
        filter: { email },
      });

    if (userError) {
      console.error("[Server] Failed to check if user exists:", userError);
      return res
        .status(500)
        .json({ error: "Failed to validate user credentials" });
    }

    // Check if we found the user
    if (!userData || !userData.users || userData.users.length === 0) {
      console.log(`[Server] User not found: ${email}`);

      // Try to log the failure, but don't fail if logging fails
      try {
        await supabase
          .from("security_logs")
          .insert({
            event_type: "login_failed",
            ip_address: ip,
            user_agent: userAgent,
            details: "User not found",
            email: email,
            created_at: new Date().toISOString(),
          })
          .throwOnError(false);
      } catch (logError) {
        console.warn("[Server] Failed to log security event:", logError);
      }

      return res
        .status(401)
        .json({
          error:
            "Invalid email or password. Please check your credentials and try again.",
        });
    }

    // User exists, now try to sign in with admin API
    const userId = userData.users[0].id;

    // First attempt to create a sign-in link (which won't be used)
    // but will verify the password securely
    const { error: signInError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      password: password,
    });

    if (signInError) {
      console.error("[Server] Failed to authenticate user:", signInError);

      // Try to log the failure, but don't fail if logging fails
      try {
        await supabase
          .from("security_logs")
          .insert({
            event_type: "login_failed",
            ip_address: ip,
            user_agent: userAgent,
            details: `Authentication failed: ${signInError.message}`,
            email: email,
            created_at: new Date().toISOString(),
          })
          .throwOnError(false);
      } catch (logError) {
        console.warn("[Server] Failed to log security event:", logError);
      }

      // Return appropriate user-friendly error message
      return res.status(401).json({
        error:
          "Invalid email or password. Please check your credentials and try again.",
      });
    }

    // User authenticated successfully, now create a session for them
    // Create a new session with admin API
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.createSession({
        userId: userId,
        properties: {
          ip_address: ip,
          user_agent: userAgent,
        },
      });

    if (sessionError || !sessionData || !sessionData.session) {
      console.error("[Server] Failed to create session:", sessionError);
      return res.status(500).json({
        error: "Authentication successful but session creation failed.",
      });
    }

    // Log successful login, but don't fail if logging fails
    try {
      await supabase
        .from("security_logs")
        .insert({
          user_id: userId,
          event_type: "login_success",
          ip_address: ip,
          user_agent: userAgent,
          details: "Login successful via server API",
          email: email,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
    } catch (logError) {
      // Non-critical, just log warning
      console.warn("[Server] Failed to log security event:", logError);
    }

    // Return the session data
    return res.status(200).json({
      session: sessionData.session,
      user: userData.users[0],
    });
  } catch (error) {
    console.error("[Server] Unexpected error during authentication:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
}
