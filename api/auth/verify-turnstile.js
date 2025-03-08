import { withRateLimit } from "../../src/utils/rate-limit";

// Server-side endpoint to verify Cloudflare Turnstile tokens
async function verifyTurnstileHandler(req, res) {
  console.log("Turnstile verification request received");

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, action } = req.body;

    // Check for required parameters
    if (!token) {
      console.error("No Turnstile token provided");
      return res.status(400).json({ error: "Missing token" });
    }

    // Get the secret key from environment variables
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error("Turnstile secret key not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Get client IP address
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    console.log(
      `Verifying Turnstile token for IP: ${ip}, action: ${action || "unknown"}`
    );

    // Make request to Cloudflare's verification API
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: ip, // Optional but recommended
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `Turnstile API error: ${response.status} ${response.statusText}`
      );
      return res.status(500).json({ error: "Failed to verify token" });
    }

    const result = await response.json();
    console.log("Turnstile verification response:", result);

    // Check if verification was successful
    if (result.success) {
      // For additional security, you can also check:
      // 1. result.action matches the expected action
      // 2. result.cdata matches any expected custom data
      // 3. result.hostname matches your domain

      // Return success response
      return res.status(200).json({
        success: true,
        hostname: result.hostname,
        challenge_ts: result.challenge_ts,
        action: result.action,
      });
    } else {
      // Verification failed
      console.error("Turnstile verification failed:", result["error-codes"]);
      return res.status(400).json({
        success: false,
        errors: result["error-codes"],
      });
    }
  } catch (error) {
    console.error("Error in Turnstile verification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(verifyTurnstileHandler, "verify-turnstile");
