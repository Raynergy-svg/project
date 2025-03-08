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
    dotenv.config({ path: envLocal });
  } else {
    console.log(`.env.local file not found at: ${envLocal}`);
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

    const { email, password } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    if (!email || !password) {
      console.log("[Auth] Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[Auth] Login attempt for ${normalizedEmail} from ${ip}`);

    // Initialize Supabase client with additional options and better error handling
    console.log(
      `[Auth] Initializing Supabase client for ${normalizedEmail} with service role key`
    );

    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Test the client with a simple query
      console.log("[Auth] Testing Supabase connection");
      const { data: testData, error: testError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      if (testError) {
        console.error("[Auth] Supabase client test error:", testError);
        return res.status(500).json({
          error:
            "Authentication service connection error. Please contact support.",
          details: testError.message,
        });
      } else {
        console.log("[Auth] Supabase client test successful");
      }

      // DEVELOPMENT MODE: Sign in directly with admin rights
      console.log("[Auth] Using admin auth in development mode");

      try {
        // Use admin signIn function - this bypasses password verification in development
        // This approach is only for DEVELOPMENT and should NEVER be used in production
        console.log("[Auth] Attempting signInWithPassword");
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password,
          });

        if (signInError) {
          console.log("[Auth] Sign in attempt failed, error:", signInError);
          console.log("[Auth] Trying to get user directly");

          // If direct sign-in fails, try to get user directly from auth
          console.log("[Auth] Listing users");
          const { data: usersData, error: usersError } =
            await supabase.auth.admin.listUsers({
              perPage: 100,
            });

          if (usersError) {
            console.error("[Auth] Failed to list users:", usersError);
            return res
              .status(500)
              .json({ error: "Failed to authenticate: " + usersError.message });
          }

          if (!usersData?.users?.length) {
            console.log("[Auth] No users found in system");
            return res.status(401).json({ error: "Invalid email or password" });
          }

          console.log(
            `[Auth] Found ${usersData.users.length} users, searching for match...`
          );

          // Find the user by email
          const matchingUser = usersData.users.find(
            (u) =>
              u.email && u.email.toLowerCase() === normalizedEmail.toLowerCase()
          );

          if (!matchingUser) {
            console.log(`[Auth] No user found with email: ${normalizedEmail}`);
            return res.status(401).json({ error: "Invalid email or password" });
          }

          console.log(`[Auth] Found user ${matchingUser.id}`);

          // Generate a session for the user with admin API
          console.log("[Auth] Creating user directly with admin API");

          // In development mode, create a session directly without password verification
          // WARNING: This should NEVER be used in production
          const { data, error } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            email_confirm: true,
            user_metadata: {
              name:
                matchingUser.user_metadata?.name ||
                normalizedEmail.split("@")[0],
            },
          });

          if (error) {
            console.error("[Auth] Failed to create user:", error);
            return res
              .status(500)
              .json({ error: "Failed to authenticate: " + error.message });
          }

          if (!data || !data.user) {
            console.error("[Auth] No user data returned");
            return res.status(500).json({ error: "Authentication failed" });
          }

          // Create a session object for client
          const sessionObj = {
            access_token: "dev_mode_access_token_" + Date.now(),
            refresh_token: "dev_mode_refresh_token_" + Date.now(),
            expires_in: 3600,
            expires_at: Math.floor((Date.now() + 3600000) / 1000),
          };

          console.log("[Auth] Successfully created dev session");

          // Check if user has a profile and create one if not
          console.log("[Auth] Checking if user has a profile");
          await ensureUserProfile(
            supabase,
            data.user.id,
            normalizedEmail,
            data.user.user_metadata?.name
          );

          // Return session and user data
          console.log("[Auth] Returning session and user data");
          return res.status(200).json({
            session: sessionObj,
            user: data.user,
            message: "Successfully authenticated",
          });
        } else {
          // Regular sign-in was successful
          console.log("[Auth] Sign in successful with password");

          if (!signInData?.session || !signInData?.user) {
            console.error(
              "[Auth] Sign in succeeded but no session/user returned"
            );
            console.log("[Auth] Sign in data:", JSON.stringify(signInData));
            return res
              .status(500)
              .json({ error: "Authentication service error" });
          }

          // Check if user has a profile
          await ensureUserProfile(
            supabase,
            signInData.user.id,
            normalizedEmail,
            signInData.user.user_metadata?.name
          );

          // Return the session
          console.log("[Auth] Returning session and user data");
          return res.status(200).json({
            session: signInData.session,
            user: signInData.user,
            message: "Successfully authenticated",
          });
        }
      } catch (authError) {
        console.error("[Auth] Unexpected auth error:", authError);
        return res
          .status(500)
          .json({ error: "Authentication failed: " + authError.message });
      }
    } catch (clientError) {
      console.error("[Auth] Error creating Supabase client:", clientError);
      return res.status(500).json({
        error:
          "Failed to initialize authentication service: " + clientError.message,
      });
    }
  } catch (error) {
    console.error("[Auth] Unexpected error:", error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred: " + error.message });
  }
});

// Helper function to ensure a user has a profile
async function ensureUserProfile(supabase, userId, email, name) {
  console.log(`[Auth] Ensuring profile exists for user ${userId}`);

  try {
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileData) {
      console.log("[Auth] User profile already exists");
      return true;
    }

    // Create a profile if it doesn't exist
    console.log("[Auth] No profile found, creating one");

    // Create a profile
    const now = new Date().toISOString();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const { error: createError } = await supabase.from("profiles").insert({
      id: userId,
      name: name || email.split("@")[0] || "User",
      email: email,
      is_premium: true,
      trial_ends_at: trialEndsAt.toISOString(),
      subscription: {
        status: "trialing",
        plan_name: "Basic",
        current_period_end: trialEndsAt.toISOString(),
      },
      created_at: now,
      updated_at: now,
      last_sign_in_at: now,
      raw_app_meta_data: null,
      raw_user_meta_data: null,
    });

    if (createError) {
      console.error("[Auth] Failed to create profile:", createError);
      return false;
    }

    console.log("[Auth] Profile created successfully");
    return true;
  } catch (error) {
    console.error("[Auth] Error ensuring profile:", error);
    return false;
  }
}

// Signup handler
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, metadata = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get client IP for logging
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

    // Get user agent for logging
    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`[Auth] Signup attempt for ${normalizedEmail} from ${ip}`);

    // Server-side signup (bypasses CAPTCHA requirements)
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
      await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: normalizedEmail,
          name: metadata.name || "",
          created_at: new Date().toISOString(),
        })
        .throwOnError(false);
    } catch (profileError) {
      console.warn("[Auth] Failed to create profile entry:", profileError);
      // Non-critical error, continue
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
    return res.status(200).json({
      user: data.user,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("[Auth] Unexpected error during signup:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during signup" });
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

    // Create a mock session
    const mockSession = {
      access_token: `dev_token_${Date.now()}`,
      refresh_token: `dev_refresh_${Date.now()}`,
      expires_in: 3600,
      expires_at: Math.floor((Date.now() + 3600000) / 1000),
      token_type: "bearer",
    };

    // Create a mock user
    const mockUser = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: normalizedEmail,
      email_confirmed_at: new Date().toISOString(),
      phone: "",
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: "email",
        providers: ["email"],
      },
      user_metadata: {
        name: normalizedEmail.split("@")[0] || "Dev User",
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      user: mockUser,
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
