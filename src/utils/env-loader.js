/**
 * Environment Variable Loader for Turnstile - Simplified Version
 */

// Cloudflare Turnstile official test keys for "Always Pass" mode
const CLOUDFLARE_TEST_SITE_KEY = "1x00000000000000000000AA";
const CLOUDFLARE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

// Force-set critical environment variables for Turnstile
function forceTurnstileEnv() {
  if (typeof process !== "undefined" && process.env) {
    console.log("Setting Turnstile environment variables");

    // Development keys always use Cloudflare test keys
    process.env.TURNSTILE_SITE_KEY_DEV = CLOUDFLARE_TEST_SITE_KEY;
    process.env.TURNSTILE_SECRET_KEY_DEV = CLOUDFLARE_TEST_SECRET_KEY;
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV = CLOUDFLARE_TEST_SITE_KEY;

    // For production, use the configured values or fallbacks
    process.env.TURNSTILE_SITE_KEY =
      process.env.TURNSTILE_SITE_KEY || "0x4AAAAAAA_KNHY49GyF-yvh";
    process.env.TURNSTILE_SECRET_KEY =
      process.env.TURNSTILE_SECRET_KEY || "0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAA_KNHY49GyF-yvh";

    // Enable CAPTCHA and Turnstile for both development and production
    process.env.ENABLE_TURNSTILE = "true";
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE = "true";
    process.env.ENABLE_TURNSTILE_IN_DEV = "true";
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV = "true";
    process.env.ENABLE_CAPTCHA = "true";
    process.env.NEXT_PUBLIC_ENABLE_CAPTCHA = "true";

    // Simple logging without template literals or optional chaining
    console.log("Turnstile configured successfully");
  } else {
    console.warn(
      "Cannot set Turnstile environment variables - process.env not available"
    );
  }
}

// Export a function to get the Turnstile environment variables
function getTurnstileEnv() {
  let siteKey = "0x4AAAAAAA_KNHY49GyF-yvh";
  let secretKey = "0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4";

  if (process.env.NODE_ENV === "development") {
    siteKey = CLOUDFLARE_TEST_SITE_KEY;
    secretKey = CLOUDFLARE_TEST_SECRET_KEY;
  } else if (process.env.TURNSTILE_SITE_KEY) {
    siteKey = process.env.TURNSTILE_SITE_KEY;
  }

  if (
    process.env.NODE_ENV !== "development" &&
    process.env.TURNSTILE_SECRET_KEY
  ) {
    secretKey = process.env.TURNSTILE_SECRET_KEY;
  }

  return {
    isDev: process.env.NODE_ENV === "development",
    siteKey: siteKey,
    secretKey: secretKey,
    enabled: true,
    enabledInDev: true,
  };
}

// Execute immediately to ensure environment variables are set
forceTurnstileEnv();

// Export the environment values and helper functions
export {
  forceTurnstileEnv,
  getTurnstileEnv,
  CLOUDFLARE_TEST_SITE_KEY,
  CLOUDFLARE_TEST_SECRET_KEY,
};
