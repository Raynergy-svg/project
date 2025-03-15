/**
 * Environment Initializer for API Routes
 *
 * This module ensures that environment variables are properly set
 * before any API logic is executed.
 *
 * Note: Turnstile has been disabled and moved to src/utils/captcha
 */

import { forceTurnstileEnv } from "@/utils/env-loader";

// Force environment variables to be set (now a no-op for Turnstile)
forceTurnstileEnv();

// Export some useful utilities for debugging
export function getDebugInfo() {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    turnstileStatus: {
      enabled: false,
      message:
        "Turnstile CAPTCHA has been disabled and moved to src/utils/captcha",
    },
  };
}

export default {
  getDebugInfo,
};
