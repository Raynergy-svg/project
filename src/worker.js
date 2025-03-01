const DEBUG = true;

// Fallback captcha prefix for verification
const FALLBACK_PREFIX = "fallback:";

// Function to check if a token is from our fallback captcha
function isTokenFromFallback(token) {
  return token && token.startsWith(FALLBACK_PREFIX);
}

// Function to verify the captcha token
async function verifyCaptchaToken(token, env) {
  try {
    // If it's a fallback token, do a simple verification
    if (isTokenFromFallback(token)) {
      // For fallback tokens, we simply check that they have the correct format
      // In a production environment, you may want to add additional checks
      return {
        success: true,
        fallback: true,
        message: "Fallback captcha verification successful",
      };
    }

    // For hCaptcha tokens, we need to verify with the hCaptcha API
    const hcaptchaSecret =
      env.HCAPTCHA_SECRET_KEY || env.SUPABASE_AUTH_CAPTCHA_SECRET;
    if (!hcaptchaSecret) {
      console.error("Missing hCaptcha secret key");
      return {
        success: false,
        fallback: false,
        message: "Server configuration error",
      };
    }

    // Call hCaptcha verification API
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: hcaptchaSecret,
        response: token,
      }),
    });

    const data = await response.json();
    return {
      success: data.success,
      fallback: false,
      message: data.success
        ? "hCaptcha verification successful"
        : "hCaptcha verification failed",
    };
  } catch (error) {
    console.error("Captcha verification error:", error);
    return {
      success: false,
      fallback: false,
      message: "Error verifying captcha",
    };
  }
}

// Helper function to ensure CSP includes hCaptcha domains
function ensureHCaptchaInCSP(cspValue) {
  if (!cspValue) return null;

  // Parse the CSP into directives
  const directives = {};
  cspValue.split(";").forEach((directive) => {
    const trimmed = directive.trim();
    if (!trimmed) return;

    const [name, ...values] = trimmed.split(/\s+/);
    if (name) {
      directives[name] = values || [];
    }
  });

  // List of hCaptcha domains we need to allow
  const hcaptchaDomains = [
    "https://*.hcaptcha.com",
    "https://hcaptcha.com",
    "https://js.hcaptcha.com",
    "https://assets.hcaptcha.com",
    "https://newassets.hcaptcha.com",
    "https://sentry.hcaptcha.com",
  ];

  // Ensure script-src includes hCaptcha domains
  if (directives["script-src"]) {
    hcaptchaDomains.forEach((domain) => {
      if (!directives["script-src"].includes(domain)) {
        directives["script-src"].push(domain);
      }
    });
  } else {
    // If script-src doesn't exist, create it with safe defaults and hCaptcha domains
    directives["script-src"] = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      ...hcaptchaDomains,
    ];
  }

  // Ensure connect-src includes hCaptcha domains
  if (directives["connect-src"]) {
    hcaptchaDomains.forEach((domain) => {
      if (!directives["connect-src"].includes(domain)) {
        directives["connect-src"].push(domain);
      }
    });
  } else {
    // If connect-src doesn't exist, create it with safe defaults and hCaptcha domains
    directives["connect-src"] = ["'self'", ...hcaptchaDomains];
  }

  // Ensure style-src includes hCaptcha domains
  if (directives["style-src"]) {
    hcaptchaDomains.forEach((domain) => {
      if (!directives["style-src"].includes(domain)) {
        directives["style-src"].push(domain);
      }
    });
  } else {
    // If style-src doesn't exist, create it with safe defaults and hCaptcha domains
    directives["style-src"] = ["'self'", "'unsafe-inline'", ...hcaptchaDomains];
  }

  // Ensure style-src-elem includes hCaptcha domains if present
  if (directives["style-src-elem"]) {
    hcaptchaDomains.forEach((domain) => {
      if (!directives["style-src-elem"].includes(domain)) {
        directives["style-src-elem"].push(domain);
      }
    });
  }

  // Ensure frame-src includes hCaptcha domains
  if (directives["frame-src"]) {
    hcaptchaDomains.forEach((domain) => {
      if (!directives["frame-src"].includes(domain)) {
        directives["frame-src"].push(domain);
      }
    });
  } else {
    // If frame-src doesn't exist, create it with safe defaults and hCaptcha domains
    directives["frame-src"] = ["'self'", ...hcaptchaDomains];
  }

  // Ensure img-src includes hCaptcha domains
  if (directives["img-src"]) {
    hcaptchaDomains.forEach((domain) => {
      if (!directives["img-src"].includes(domain)) {
        directives["img-src"].push(domain);
      }
    });
  } else {
    // If img-src doesn't exist, create it with safe defaults and hCaptcha domains
    directives["img-src"] = ["'self'", "data:", "blob:", ...hcaptchaDomains];
  }

  // Convert back to string
  let newCSP = "";
  for (const [directive, values] of Object.entries(directives)) {
    newCSP += `${directive} ${values.join(" ")}; `;
  }

  return newCSP.trim();
}

// Function to create a development-friendly CSP
function createDevCSP(env) {
  // In development, we want a more permissive CSP
  const isDevEnvironment =
    env.ENVIRONMENT === "development" || !env.ENVIRONMENT;

  if (isDevEnvironment) {
    return `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.plaid.com https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://static.cloudflareinsights.com https://localhost:* http://localhost:*;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.hcaptcha.com https://hcaptcha.com;
      style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.hcaptcha.com https://hcaptcha.com;
      img-src 'self' data: blob: https://*.supabase.co https://raw.githubusercontent.com https://*.cloudflare.com https://images.unsplash.com https://*.hcaptcha.com https://hcaptcha.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' 
        https://*.supabase.co
        wss://*.supabase.co
        https://api.supabase.com
        https://fonts.googleapis.com
        https://fonts.gstatic.com
        https://*.cloudflareinsights.com
        https://*.plaid.com
        https://*.hcaptcha.com 
        https://hcaptcha.com
        https://sentry.hcaptcha.com
        https://localhost:*
        http://localhost:*;
      frame-src 'self' https://cdn.plaid.com https://js.stripe.com https://*.hcaptcha.com https://hcaptcha.com;
      media-src 'self';
      object-src 'none';
      base-uri 'self';
    `
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    try {
      // Log available environment variables for debugging
      if (DEBUG) {
        console.log("Worker environment variables:");
        console.log("SUPABASE_URL available:", !!env.SUPABASE_URL);
        console.log("SUPABASE_ANON_KEY available:", !!env.SUPABASE_ANON_KEY);
        console.log("Environment:", env.ENVIRONMENT);
        console.log(
          "HCAPTCHA_SECRET_KEY available:",
          !!env.HCAPTCHA_SECRET_KEY
        );
        console.log(
          "SUPABASE_AUTH_CAPTCHA_SECRET available:",
          !!env.SUPABASE_AUTH_CAPTCHA_SECRET
        );

        // Add the values to the response headers for debugging
        const debugHeaders = {
          "X-Debug-Supabase-URL": env.SUPABASE_URL || "not-set",
          "X-Debug-Environment": env.ENVIRONMENT || "not-set",
        };
      }

      const url = new URL(request.url);

      // Check for a special query parameter to bypass CSP for hCaptcha
      const bypassCspForCaptcha = url.searchParams.has("hcaptcha-csp-bypass");

      // Handle hCaptcha callback
      if (url.pathname === "/_hcaptcha_callback") {
        // This path is used when hCaptcha loads its API with a callback
        const callback = url.searchParams.get("callback") || "hcaptchaCallback";
        const response = new Response(
          `${callback}({success: true, timestamp: ${Date.now()}});`,
          {
            headers: {
              "Content-Type": "application/javascript",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        return response;
      }

      // API routes
      if (url.pathname === "/api/verify-captcha") {
        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const body = await request.json();
          const { token } = body;

          if (!token) {
            return new Response(
              JSON.stringify({ error: "Token is required" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const verificationResult = await verifyCaptchaToken(token, env);

          return new Response(JSON.stringify(verificationResult), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      // Special handler for hCaptcha resources
      if (
        url.pathname.includes("/api.js") &&
        url.hostname.includes("hcaptcha.com")
      ) {
        // Allow direct passthrough without CSP modification
        console.log(
          "Detected hCaptcha API request, passing through without CSP modification"
        );
        try {
          const response = await fetch(request);
          return response;
        } catch (error) {
          console.error("Error fetching hCaptcha resource:", error);
          return new Response("Error fetching hCaptcha resource", {
            status: 500,
          });
        }
      }

      // Static assets handling
      let response;

      // Try to get the asset from the assets binding
      try {
        response = await env.ASSETS.fetch(request);
      } catch (e) {
        if (DEBUG) {
          console.error("Asset fetch error:", e);
        }
        // If the asset is not found, serve index.html for client-side routing
        response = await env.ASSETS.fetch(`${url.origin}/index.html`);
      }

      // Add security headers
      response = new Response(response.body, response);
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );

      // Process CSP
      const cspValue = response.headers.get("Content-Security-Policy");

      // Check if we should bypass CSP
      if (bypassCspForCaptcha) {
        // If we're bypassing CSP for captcha, remove the CSP header completely
        response.headers.delete("Content-Security-Policy");
        if (DEBUG) {
          response.headers.set("X-CSP-Bypass", "Enabled for hCaptcha");
        }
      } else {
        // Not bypassing, so ensure proper CSP
        // First, try to use existing CSP with hCaptcha domains added
        let updatedCsp = null;
        if (cspValue) {
          updatedCsp = ensureHCaptchaInCSP(cspValue);
        }

        // If no CSP exists or we're in development, use our dev-friendly CSP
        if (!updatedCsp) {
          updatedCsp = createDevCSP(env);
        }

        if (updatedCsp) {
          response.headers.set("Content-Security-Policy", updatedCsp);

          // Add debug headers
          if (DEBUG) {
            response.headers.set("X-Original-CSP", cspValue || "none");
            response.headers.set("X-Updated-CSP", updatedCsp);
            response.headers.set("X-CSP-Modified-By", "Worker");
          }
        }
      }

      // Add environment variables to the response for client-side use
      if (DEBUG) {
        // Create a script tag to inject environment variables into the client
        const envScript = `
          <script>
            window.ENV = {
              SUPABASE_URL: "${env.SUPABASE_URL || ""}",
              SUPABASE_ANON_KEY: "${env.SUPABASE_ANON_KEY || ""}",
              ENVIRONMENT: "${env.ENVIRONMENT || "development"}"
            };
            console.log("Environment variables injected by worker:", window.ENV);
          </script>
        `;

        // Only modify HTML responses
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          // Get the response text
          const text = await response.text();

          // Insert the script tag after the <head> tag
          const newText = text.replace(/<head>/, `<head>${envScript}`);

          // Create a new response with the modified HTML
          response = new Response(newText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }
      }

      return response;
    } catch (error) {
      // Global error handler
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
