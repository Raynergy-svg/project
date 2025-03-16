/**
 * Temporary Constants - Emergency Fix
 *
 * This file provides core constants without any complex logic
 * to temporarily bypass the env-loader issue.
 */

// Cloudflare Turnstile test keys
export const CLOUDFLARE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const CLOUDFLARE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

// Function stubs that do nothing to satisfy imports
export function forceTurnstileEnv() {
  // No-op implementation
  console.log("Turnstile env forcing bypassed");
}

export function getTurnstileEnv() {
  return {
    isDev: true,
    siteKey: CLOUDFLARE_TEST_SITE_KEY,
    secretKey: CLOUDFLARE_TEST_SECRET_KEY,
    enabled: true,
    enabledInDev: true,
  };
}
