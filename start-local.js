import { spawn } from "child_process";
import { createServer } from "http";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with priority - highest priority first
// .env.local overrides .env
function loadEnvFiles() {
  const envLocal = path.join(__dirname, ".env.local");
  const envDefault = path.join(__dirname, ".env");

  console.log("Loading environment variables...");

  // First load .env default
  if (fs.existsSync(envDefault)) {
    console.log(`Loading env from: ${envDefault}`);
    dotenv.config({ path: envDefault });
  } else {
    console.log(`.env file not found at: ${envDefault}`);
  }

  // Then load .env.local which will override any duplicates from .env
  if (fs.existsSync(envLocal)) {
    console.log(`Loading env from: ${envLocal}`);
    dotenv.config({ path: envLocal, override: true });
  } else {
    console.log(`.env.local file not found at: ${envLocal}`);
  }

  // Set up Next.js environment variable compatibility
  // Ensure NEXT_PUBLIC_* variables are set from corresponding VITE_* variables and vice-versa
  const envPrefixMap = {
    VITE_: "NEXT_PUBLIC_",
    NEXT_PUBLIC_: "VITE_",
  };

  // Copy variables between prefixes if needed
  Object.keys(process.env).forEach((key) => {
    // Handle VITE_ -> NEXT_PUBLIC_
    if (key.startsWith("VITE_")) {
      const nextKey = key.replace("VITE_", "NEXT_PUBLIC_");
      if (!process.env[nextKey]) {
        process.env[nextKey] = process.env[key];
        console.log(`Copied ${key} -> ${nextKey}`);
      }
    }
    // Handle NEXT_PUBLIC_ -> VITE_
    else if (key.startsWith("NEXT_PUBLIC_")) {
      const viteKey = key.replace("NEXT_PUBLIC_", "VITE_");
      if (!process.env[viteKey]) {
        process.env[viteKey] = process.env[key];
        console.log(`Copied ${key} -> ${viteKey}`);
      }
    }
  });

  // Ensure critical environment variables are set
  const criticalVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  let missingCriticalVars = criticalVars.filter(
    (varName) => !process.env[varName]
  );

  // If any critical vars are missing, try to find them in .env.local
  if (missingCriticalVars.length > 0 && fs.existsSync(envLocal)) {
    const envContent = fs.readFileSync(envLocal, "utf8");
    const lines = envContent.split("\n");

    missingCriticalVars.forEach((varName) => {
      const line = lines.find((l) => l.startsWith(`${varName}=`));
      if (line) {
        const value = line.split("=")[1]?.trim();
        if (value) {
          process.env[varName] = value;
          console.log(`Found ${varName} in .env.local and set it manually`);
        }
      }
    });
  }

  // Print loaded variables (but hide sensitive values)
  const envVars = [
    "VITE_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  console.log("Environment variables loaded:");
  envVars.forEach((name) => {
    if (process.env[name]) {
      const value = process.env[name];
      // Show first few chars of key for debugging but hide most
      const maskedValue =
        value.substring(0, 4) + "..." + value.substring(value.length - 4);
      console.log(`  ${name}: ${maskedValue}`);
    } else {
      console.log(`  ${name}: not set`);
    }
  });
}

// Load environment variables
loadEnvFiles();

// Create a simple server to manage both processes
const app = express();
const PORT = 3000;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "apikey",
      "x-client-info",
    ],
  })
);

// Parse JSON bodies
app.use(bodyParser.json());

// Add CSP headers for development
app.use((req, res, next) => {
  // Set relaxed CSP for development environment
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://js.stripe.com https://cdn.plaid.com https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://*.vercel.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: blob: https://*.supabase.co https://raw.githubusercontent.com https://*.cloudflare.com https://images.unsplash.com https://www.gstatic.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co wss://*.supabase.co https://api.supabase.com https://fonts.googleapis.com https://fonts.gstatic.com https://*.cloudflareinsights.com https://api.stripe.com https://*.stripe.com https://*.plaid.com https://api.ipify.org https://*.projectdcertan84workersdev.workers.dev https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://*.vercel.com; " +
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://cdn.plaid.com; " +
      "object-src 'none'; " +
      "base-uri 'self';"
  );

  // Log all requests for debugging
  console.log(`[Proxy] ${req.method} ${req.url}`);
  next();
});

// Initialize Supabase in this file
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug the actual service key value (first and last 8 chars)
if (supabaseServiceKey) {
  const maskedKey =
    supabaseServiceKey.substring(0, 8) +
    "..." +
    supabaseServiceKey.substring(supabaseServiceKey.length - 8);
  console.log(`Service Key Diagnostic: ${maskedKey}`);
}

console.log("Supabase initialization:");
console.log(`  URL: ${supabaseUrl ? "✓ Set" : "✗ Missing"}`);
console.log(`  Service Key: ${supabaseServiceKey ? "✓ Set" : "✗ Missing"}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "ERROR: Supabase credentials are missing. Authentication will fail!"
  );
}

// Login handler
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("[Auth] Login request received");

    const { email, password, captchaToken } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    if (!email || !password) {
      console.log("[Auth] Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[Auth] Login attempt for ${normalizedEmail} from ${ip}`);

    // Verify turnstile token if needed
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
    const skipCaptcha =
      process.env.VITE_SKIP_AUTH_CAPTCHA === "true" ||
      process.env.NEXT_PUBLIC_SKIP_AUTH_CAPTCHA === "true";

    if (!skipCaptcha && captchaToken) {
      try {
        // Verify the token with Cloudflare
        const formData = new URLSearchParams();
        formData.append("secret", turnstileSecretKey);
        formData.append("response", captchaToken);
        formData.append("remoteip", ip);

        const verificationResponse = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const verificationResult = await verificationResponse.json();

        if (!verificationResult.success) {
          console.error(
            "[Auth] Turnstile verification failed:",
            verificationResult
          );
          return res.status(400).json({
            error: "Captcha verification failed",
            details: verificationResult["error-codes"] || [],
          });
        }
      } catch (captchaError) {
        console.error("[Auth] Turnstile verification error:", captchaError);
        return res.status(500).json({
          error: "Error verifying captcha",
          details: captchaError.message,
        });
      }
    } else if (!skipCaptcha && !captchaToken) {
      if (process.env.NODE_ENV !== "development") {
        return res.status(400).json({ error: "Captcha verification required" });
      } else {
        console.log("[Auth] Continuing without captcha in development mode");
      }
    } else {
      console.log("[Auth] Skipping captcha verification (development mode)");
    }

    // Initialize Supabase client
    console.log("[Auth] Initializing Supabase client with service role key");

    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      console.log("[Auth] Attempting signInWithPassword");
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

      if (signInError) {
        console.log("[Auth] Sign in attempt failed, error:", signInError);

        // Try to log the failure but don't fail if logging fails
        try {
          await supabase
            .from("security_logs")
            .insert({
              event_type: "login_failed",
              ip_address: ip,
              user_agent: userAgent,
              details: signInError.message,
              email: normalizedEmail,
              created_at: new Date().toISOString(),
            })
            .throwOnError(false);
        } catch (logError) {
          console.warn("[Auth] Failed to log security event:", logError);
        }

        // Return appropriate user-friendly error messages
        if (
          signInError.message?.includes("Invalid login credentials") ||
          signInError.message?.includes("Invalid email or password")
        ) {
          return res.status(401).json({
            error: "Invalid email or password",
          });
        } else if (signInError.message?.includes("Email not confirmed")) {
          return res.status(401).json({
            error: "Please verify your email address before signing in",
          });
        } else {
          return res.status(500).json({
            error: "Unable to sign in. Please try again later.",
            details: signInError.message,
          });
        }
      }

      // Try to log successful login
      try {
        await supabase
          .from("security_logs")
          .insert({
            user_id: signInData.user.id,
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

      // Return the user data and session
      return res.status(200).json({
        user: signInData.user,
        session: signInData.session,
      });
    } catch (error) {
      console.error("[Auth] Unexpected error during login:", error);
      return res.status(500).json({
        error: "Internal server error during login",
        details: error.message,
      });
    }
  } catch (error) {
    console.error("[Auth] Unexpected error in login handler:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Signup handler
app.post("/api/auth/signup", async (req, res) => {
  try {
    console.log("[Auth] Signup request received", req.body);
    const { email, password, metadata = {}, turnstileToken } = req.body;

    if (!email || !password) {
      console.log("[Auth] Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Get client IP for logging
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

    // Get user agent for logging
    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`[Auth] Signup attempt for ${normalizedEmail} from ${ip}`);

    // Verify Turnstile token if provided and if we're not in dev mode that skips this
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
    const skipCaptcha =
      process.env.VITE_SKIP_AUTH_CAPTCHA === "true" ||
      process.env.NEXT_PUBLIC_SKIP_AUTH_CAPTCHA === "true";

    if (!skipCaptcha && turnstileToken) {
      console.log("[Auth] Verifying Turnstile token");

      if (!turnstileSecretKey) {
        console.error("[Auth] Missing Turnstile secret key");
        return res.status(500).json({
          error: "Server configuration error: Missing Turnstile secret key",
        });
      }

      try {
        // Verify the token with Cloudflare
        const formData = new URLSearchParams();
        formData.append("secret", turnstileSecretKey);
        formData.append("response", turnstileToken);
        formData.append("remoteip", ip);

        const verificationResponse = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const verificationResult = await verificationResponse.json();
        console.log(
          "[Auth] Turnstile verification result:",
          verificationResult
        );

        if (!verificationResult.success) {
          return res.status(400).json({
            error: "Captcha verification failed",
            details: verificationResult["error-codes"] || [],
          });
        }
      } catch (captchaError) {
        console.error("[Auth] Turnstile verification error:", captchaError);
        return res.status(500).json({
          error: "Error verifying captcha",
          details: captchaError.message,
        });
      }
    } else if (!skipCaptcha && !turnstileToken) {
      console.log("[Auth] No Turnstile token provided and CAPTCHA not skipped");
      // If we're not in dev mode and no token is provided, reject
      if (process.env.NODE_ENV !== "development") {
        return res.status(400).json({ error: "Captcha verification required" });
      } else {
        console.log("[Auth] Continuing without captcha in development mode");
      }
    } else {
      console.log("[Auth] Skipping captcha verification (development mode)");
    }

    // Initialize Supabase client
    console.log("[Auth] Initializing Supabase client", {
      url: supabaseUrl ? "✓ Set" : "✗ Missing",
      serviceKey: supabaseServiceKey ? "✓ Set" : "✗ Missing",
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[Auth] Missing Supabase credentials");
      return res.status(500).json({
        error: "Server configuration error: Missing Supabase credentials",
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Two-step signup process: 1) Create user, 2) Create profile if needed
    console.log("[Auth] Creating user with admin API");

    try {
      // Step 1: Create the user in auth.users
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
            details: error.message,
          });
        }
      }

      if (!data.user) {
        return res.status(500).json({
          error: "Signup successful but user data is missing.",
        });
      }

      // Step 2: Check if a profile exists, create it if not
      console.log(
        "[Auth] Checking if profile exists for new user:",
        data.user.id
      );
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.warn(
          "[Auth] Error checking if profile exists:",
          profileCheckError
        );
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        console.log("[Auth] Creating profile for new user:", data.user.id);
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: normalizedEmail,
              name: metadata.name || "",
              created_at: new Date().toISOString(),
            });

          if (profileError) {
            console.warn("[Auth] Error creating profile:", profileError);
            // Continue anyway - the user was created successfully
          } else {
            console.log("[Auth] Profile created successfully");
          }
        } catch (profileInsertError) {
          console.warn(
            "[Auth] Exception creating profile:",
            profileInsertError
          );
          // Continue anyway - the user was created successfully
        }
      } else {
        console.log("[Auth] Profile already exists for user");
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
      console.log("[Auth] Signup successful for", normalizedEmail);
      return res.status(200).json({
        user: data.user,
        message: "Account created successfully",
      });
    } catch (dbError) {
      console.error("[Auth] Database exception during signup:", dbError);
      return res.status(500).json({
        error: "Database error during account creation",
        details: dbError.message || "Unknown database error",
      });
    }
  } catch (error) {
    console.error("[Auth] Unexpected error during signup:", error);
    return res.status(500).json({
      error: "Internal server error during signup",
      details: error.message,
    });
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

// Simple development mode login handler that bypasses all authentication
// WARNING: This is for DEVELOPMENT ONLY and should NEVER be used in production
app.post("/api/auth/dev-login", async (req, res) => {
  try {
    console.log("[DevAuth] Development login request received");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[DevAuth] Creating mock session for ${normalizedEmail}`);

    // Create a fake user ID based on email (deterministic)
    const userId = "dev-" + Buffer.from(normalizedEmail).toString("hex");

    // Current timestamp
    const now = new Date().toISOString();
    const expiresAt = Math.floor((Date.now() + 3600000) / 1000);

    // Create a mock user
    const mockUser = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: normalizedEmail,
      email_confirmed_at: now,
      phone: "",
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: {
        provider: "email",
        providers: ["email"],
      },
      user_metadata: {
        name: normalizedEmail.split("@")[0] || "Dev User",
      },
      identities: [],
      created_at: now,
      updated_at: now,
    };

    // Create a mock session
    const mockSession = {
      access_token: `dev_token_${Date.now()}`,
      refresh_token: `dev_refresh_${Date.now()}`,
      expires_in: 3600,
      expires_at: expiresAt,
      token_type: "bearer",
      user: mockUser, // Include user in session for standard Supabase structure
    };

    // Initialize a Supabase client for profile creation
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create or ensure profile for this dev user
    try {
      await ensureUserProfile(
        supabase,
        userId,
        normalizedEmail,
        mockUser.user_metadata.name
      );
      console.log(`[DevAuth] Profile ensured for ${normalizedEmail}`);
    } catch (profileError) {
      console.error("[DevAuth] Error ensuring profile:", profileError);
      // Continue anyway - it's just development
    }

    console.log(`[DevAuth] Returning mock session for ${normalizedEmail}`);

    return res.status(200).json({
      session: mockSession,
      user: mockUser, // Include user separately for our custom structure
      message: "Development mode authentication successful",
      dev: true,
    });
  } catch (error) {
    console.error("[DevAuth] Error:", error);
    return res
      .status(500)
      .json({ error: "Development authentication error: " + error.message });
  }
});

// Turnstile verification endpoint
app.post("/api/auth/verify-turnstile", async (req, res) => {
  try {
    console.log("[Turnstile] Verification request received");

    const { token } = req.body;

    if (!token) {
      console.log("[Turnstile] Missing token");
      return res.status(400).json({ error: "Token is required" });
    }

    // The secret key from your Cloudflare Turnstile settings
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileSecretKey) {
      console.error("[Turnstile] Missing secret key in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Verify the token with Cloudflare
    console.log("[Turnstile] Sending verification request to Cloudflare");
    const formData = new URLSearchParams();
    formData.append("secret", turnstileSecretKey);
    formData.append("response", token);
    formData.append(
      "remoteip",
      req.ip || req.headers["x-forwarded-for"] || "unknown"
    );

    const verificationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const verificationResult = await verificationResponse.json();

    console.log("[Turnstile] Verification result:", verificationResult);

    if (verificationResult.success) {
      return res.status(200).json({
        success: true,
        message: "Token verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid token",
        details: verificationResult["error-codes"] || [],
      });
    }
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return res
      .status(500)
      .json({ error: "Verification failed: " + error.message });
  }
});

// Proxy all other requests to the Vite dev server
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:5173",
    changeOrigin: true,
    ws: true, // Support WebSockets for HMR
  })
);

// Start Vite dev server
console.log("Starting Vite dev server...");
const viteServer = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
});

// Create a server that proxies requests
const server = createServer(app);

// Start listening
server.listen(PORT, () => {
  console.log(
    `Local development environment running at http://localhost:${PORT}`
  );
  console.log("All API requests will be handled directly by this server.");
  console.log(
    "All other requests will be proxied to the Vite dev server at port 5173."
  );
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down all servers...");

  // Kill child processes
  viteServer.kill();

  // Close server
  server.close(() => {
    console.log("All servers shut down.");
    process.exit(0);
  });
});
