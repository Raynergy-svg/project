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

    // SIMPLER APPROACH: Use the signInWithPassword but intercept the specific error for unconfirmed email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // Handle login failure or success
    if (error) {
      console.error("[Server] Authentication error:", error);

      // Handle specific errors
      if (
        error.message?.includes("Email not confirmed") ||
        error.message?.includes("unconfirmed")
      ) {
        // Special handling for unconfirmed email
        console.log(
          "[Server] User has unconfirmed email, trying to get user by email"
        );

        // Try to find the user by email - this time with a more reliable approach
        // using the admin API directly
        const { data: adminUserData, error: adminUserError } =
          await supabase.auth.admin.getUserByEmail(email);

        if (adminUserError || !adminUserData || !adminUserData.user) {
          // If we can't find the user, return an error
          console.error(
            "[Server] Failed to find user by email:",
            adminUserError
          );

          // Log the failed attempt
          try {
            await supabase
              .from("security_logs")
              .insert({
                event_type: "login_failed",
                ip_address: ip,
                user_agent: userAgent,
                details: `Login failed: Email not confirmed and user lookup failed`,
                email: email,
                created_at: new Date().toISOString(),
              })
              .throwOnError(false);
          } catch (logError) {
            console.warn("[Server] Failed to log security event:", logError);
          }

          return res.status(401).json({
            error:
              "Please confirm your email before logging in, or contact support for assistance.",
          });
        }

        // Get the user ID from the admin API response
        const userId = adminUserData.user.id;

        // If we found the user, create a session directly using admin API
        const { data: sessionData, error: sessionError } =
          await supabase.auth.admin.createSession({
            userId: userId,
          });

        if (sessionError || !sessionData || !sessionData.session) {
          console.error(
            "[Server] Failed to create session for unconfirmed email user:",
            sessionError
          );

          // Log the failed attempt
          try {
            await supabase
              .from("security_logs")
              .insert({
                event_type: "login_failed",
                ip_address: ip,
                user_agent: userAgent,
                details: `Login failed: Session creation failed for unconfirmed email user`,
                email: email,
                created_at: new Date().toISOString(),
              })
              .throwOnError(false);
          } catch (logError) {
            console.warn("[Server] Failed to log security event:", logError);
          }

          return res.status(500).json({
            error:
              "Failed to authenticate. Please try again later or contact support.",
          });
        }

        // Session created successfully for unconfirmed email user
        console.log(
          "[Server] Successfully created session for unconfirmed email user"
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
              email: email,
              created_at: new Date().toISOString(),
            })
            .throwOnError(false);
        } catch (logError) {
          console.warn("[Server] Failed to log security event:", logError);
        }

        // Return the session and user data
        return res.status(200).json({
          session: sessionData.session,
          user: adminUserData.user, // Use the full user object from the admin API
        });
      } else {
        // For other errors, just return the error
        // Log the failed attempt
        try {
          await supabase
            .from("security_logs")
            .insert({
              event_type: "login_failed",
              ip_address: ip,
              user_agent: userAgent,
              details: `Login failed: ${error.message}`,
              email: email,
              created_at: new Date().toISOString(),
            })
            .throwOnError(false);
        } catch (logError) {
          console.warn("[Server] Failed to log security event:", logError);
        }

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
          email: email,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
    } catch (logError) {
      console.warn("[Server] Failed to log security event:", logError);
    }

    // Return the session data
    return res.status(200).json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("[Server] Unexpected error during authentication:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
}
