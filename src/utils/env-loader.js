/**
 * Environment Variable Loader for Turnstile
 *
 * This utility ensures Turnstile environment variables are explicitly set
 * at runtime to avoid issues with Next.js environment variable loading.
 */

// Cloudflare Turnstile official test keys for "Always Pass" mode
// These are documented in Cloudflare's documentation
const CLOUDFLARE_TEST_SITE_KEY = "1x00000000000000000000AA";
const CLOUDFLARE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

// Force-set critical environment variables for Turnstile
function forceTurnstileEnv() {
  if (typeof process !== "undefined" && process.env) {
    console.log("🔧 Forcing Turnstile environment variables");

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

    // Log the values we're setting
    console.log(
      "✅ Set TURNSTILE_SITE_KEY_DEV:",
      process.env.TURNSTILE_SITE_KEY_DEV
    );
    console.log(
      "✅ Set TURNSTILE_SECRET_KEY_DEV:",
      `${process.env.TURNSTILE_SECRET_KEY_DEV?.substring(0, 5)}...`
    );
    console.log(
      "✅ Set TURNSTILE_SITE_KEY:",
      `${process.env.TURNSTILE_SITE_KEY?.substring(0, 10)}...`
    );
    console.log(
      "✅ Set TURNSTILE_SECRET_KEY:",
      `${process.env.TURNSTILE_SECRET_KEY?.substring(0, 5)}...`
    );
    console.log("✅ Turnstile enabled:", process.env.ENABLE_TURNSTILE);
    console.log(
      "✅ Turnstile in dev enabled:",
      process.env.ENABLE_TURNSTILE_IN_DEV
    );
  } else {
    console.warn(
      "⚠️ Cannot set Turnstile environment variables - process.env not available"
    );
  }
}

// Export a function to get the Turnstile environment variables
function getTurnstileEnv() {
  return {
    isDev: process.env.NODE_ENV === "development",
    siteKey:
      process.env.NODE_ENV === "development"
        ? CLOUDFLARE_TEST_SITE_KEY
        : process.env.TURNSTILE_SITE_KEY || "0x4AAAAAAA_KNHY49GyF-yvh",
    secretKey:
      process.env.NODE_ENV === "development"
        ? CLOUDFLARE_TEST_SECRET_KEY
        : process.env.TURNSTILE_SECRET_KEY ||
          "0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4",
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
