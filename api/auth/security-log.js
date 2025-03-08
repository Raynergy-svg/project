// Vercel Edge Function for security logging
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
    let event_type, details, email, user_id;
    try {
      // In production, req.body might already be an object
      if (typeof req.body === "object" && req.body !== null) {
        event_type = req.body.event_type;
        details = req.body.details;
        email = req.body.email;
        user_id = req.body.user_id;
      } else {
        // Try to parse as JSON string
        const body = JSON.parse(req.body || "{}");
        event_type = body.event_type;
        details = body.details;
        email = body.email;
        user_id = body.user_id;
      }
    } catch (parseError) {
      console.error(
        "Failed to parse request body:",
        parseError,
        "body is:",
        typeof req.body
      );
      // For security log, we'll still return 200 but log the error
      return res.status(200).json({
        success: true,
        message: "Error parsing request but proceeding",
        details: `Body type: ${typeof req.body}`,
      });
    }

    // For security logging, we'll proceed even if not all fields are present
    // but we'll check if we have the minimum required
    if (!event_type) {
      return res
        .status(200)
        .json({
          success: true,
          message: "Skipped logging - missing event type",
        });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get client IP
    const forwarded = req.headers["x-forwarded-for"];
    const ip_address = forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(",")[0]
      : "0.0.0.0";

    // Get user agent
    const user_agent = req.headers["user-agent"] || "Unknown";

    try {
      // First check if the table exists
      const { error: tableCheckError } = await supabase
        .from("security_logs")
        .select("count(*)", { count: "exact", head: true })
        .limit(1);

      // If table doesn't exist or other error, log but don't fail
      if (tableCheckError) {
        console.log(
          "[Server] Security logs table not available:",
          tableCheckError.message
        );
        return res
          .status(200)
          .json({
            success: true,
            message: "Logging skipped - table not available",
          });
      }

      // Log the security event
      const { error } = await supabase
        .from("security_logs")
        .insert({
          user_id: user_id || null,
          event_type,
          ip_address,
          user_agent,
          details: details || "No details provided",
          email: email || null,
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);

      if (error) {
        // Check if it's just a missing table (404) which is non-critical
        if (error.code === "404" || error.code === "PGRST116") {
          console.log("[Server] Security logs table not available - ignoring");
          return res
            .status(200)
            .json({
              success: true,
              message: "Logging skipped - table not available",
            });
        } else {
          console.warn("[Server] Failed to log security event:", error);
          // Still return success to avoid blocking auth flow
          return res
            .status(200)
            .json({ success: true, message: "Logging failed but proceeding" });
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("[Server] Error logging security event:", error);
      // Do not fail the auth flow, return success anyway
      return res
        .status(200)
        .json({ success: true, message: "Logging failed but proceeding" });
    }
  } catch (error) {
    console.error("[Server] Error in security logging endpoint:", error);
    // Return success anyway to not break the auth flow
    return res
      .status(200)
      .json({ success: true, message: "Endpoint error but proceeding" });
  }
}
