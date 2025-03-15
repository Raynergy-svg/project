"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  TURNSTILE_SITE_KEY,
  isTurnstileDisabled,
  generateBypassToken,
} from "@/utils/turnstile";
import { IS_DEV } from "@/utils/environment";
import {
  loadTurnstileScript,
  isTurnstileScriptLoaded,
  onTurnstileLoad,
  resetTurnstileState,
} from "@/utils/turnstileLoader";
import { clearTurnstileWidgets } from "@/components/auth/TurnstileWidget";
import { useTurnstile } from "./TurnstileProvider";
import {
  getTurnstileSiteKey,
  CLOUDFLARE_TEST_SITE_KEY,
} from "@/utils/env-loader";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  action?: string; // For analytics
}

export type TurnstileCaptchaRef = {
  reset: () => void;
};

// Global widget registry to avoid duplicates
const captchaWidgetRegistry: Record<string, boolean> = {};

// Track widget IDs for proper cleanup
const captchaWidgetIdRegistry: Record<string, string> = {};

// Function to safely render the Turnstile widget
const renderSafely = (
  container: HTMLElement,
  options: any,
  onSuccess: (widgetId: string) => void,
  onFail: (error: any) => void
) => {
  try {
    if (!window.turnstile) {
      throw new Error("Turnstile not loaded");
    }

    // Get a unique identifier for this container
    const containerKey =
      container.id || container.getAttribute("data-turnstile-container");

    // Check if this container already has a widget
    if (containerKey && captchaWidgetRegistry[containerKey]) {
      console.log(
        `🔑 CAPTCHA: Container ${containerKey} already has a widget. Handling duplicate render.`
      );

      // Get the existing widget ID from our registry
      const existingWidgetId = captchaWidgetIdRegistry[containerKey];

      // If we already have a widget ID, reuse it instead of re-rendering
      if (existingWidgetId) {
        console.log(
          `🔑 CAPTCHA: Reusing existing widget ${existingWidgetId} for container ${containerKey}`
        );
        onSuccess(existingWidgetId);
        return;
      }

      // If we don't have the widget ID cached, try to clean up any existing widget
      try {
        const widgetId = container.getAttribute("data-widget-id");
        if (widgetId && window.turnstile) {
          window.turnstile.remove(widgetId);
          console.log(
            `🔑 CAPTCHA: Removed existing widget ${widgetId} from container ${containerKey}`
          );

          // Clear the container
          container.innerHTML = "";

          // Remove from registry to allow re-rendering
          delete captchaWidgetRegistry[containerKey];
          delete captchaWidgetIdRegistry[containerKey];
        }
      } catch (e) {
        console.error(
          `🔑 CAPTCHA: Error cleaning up existing widget in container ${containerKey}`,
          e
        );
        onFail(
          new Error(
            `Container ${containerKey} already has a widget and cleanup failed`
          )
        );
        return;
      }
    }

    // Register this container before rendering
    if (containerKey) {
      captchaWidgetRegistry[containerKey] = true;
      console.log(
        `🔑 CAPTCHA: Registered container ${containerKey} for widget rendering`
      );
    }

    // Use our safer onTurnstileLoad helper - do NOT use turnstile.ready directly
    // This avoids the error about calling turnstile.ready() before script is loaded
    onTurnstileLoad(() => {
      try {
        // At this point, we can safely assume Turnstile is fully loaded
        if (!window.turnstile) {
          throw new Error("Turnstile unexpectedly undefined after load");
        }

        // Double check the container is still in the DOM before rendering
        if (!document.body.contains(container)) {
          console.warn(
            `🔑 CAPTCHA: Container ${containerKey} is no longer in the DOM`
          );
          if (containerKey) {
            delete captchaWidgetRegistry[containerKey];
            delete captchaWidgetIdRegistry[containerKey];
          }
          onFail(new Error("Container is no longer in the DOM"));
          return;
        }

        // If this container already has a data-widget-id attribute,
        // the widget may have been rendered already by React StrictMode
        const existingWidgetId = container.getAttribute("data-widget-id");
        if (existingWidgetId) {
          console.log(
            `🔑 CAPTCHA: Found existing widget ID ${existingWidgetId} in container ${containerKey}`
          );

          // Store the widget ID in our registry
          if (containerKey) {
            captchaWidgetIdRegistry[containerKey] = existingWidgetId;
          }

          onSuccess(existingWidgetId);
          return;
        }

        // Now render the widget directly without ready()
        const widgetId = window.turnstile.render(container, options);
        if (widgetId) {
          console.log(
            `🔑 CAPTCHA: Successfully rendered widget ${widgetId} in container ${containerKey}`
          );

          // Store the widget ID in our registry
          if (containerKey) {
            captchaWidgetIdRegistry[containerKey] = widgetId;
          }

          // Save widget ID as data attribute to help with debugging
          container.setAttribute("data-widget-id", widgetId);

          onSuccess(widgetId);
        } else {
          onFail(new Error("Failed to get widget ID from Turnstile"));
          // Unregister on failure
          if (containerKey) {
            delete captchaWidgetRegistry[containerKey];
            delete captchaWidgetIdRegistry[containerKey];
          }
        }
      } catch (error) {
        console.error("🔑 CAPTCHA: Error rendering in callback", error);
        onFail(error);
        // Unregister on failure
        if (containerKey) {
          delete captchaWidgetRegistry[containerKey];
          delete captchaWidgetIdRegistry[containerKey];
        }
      }
    });
  } catch (error) {
    console.error("🔑 CAPTCHA: Error setting up rendering", error);
    onFail(error);

    // Unregister on failure
    const containerKey =
      container.id || container.getAttribute("data-turnstile-container");
    if (containerKey) {
      delete captchaWidgetRegistry[containerKey];
      delete captchaWidgetIdRegistry[containerKey];
    }
  }
};

// Generate a unique ID for each Turnstile container
function generateUniqueId(): string {
  return `turnstile-container-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Turnstile Captcha Component
 *
 * This component renders a Cloudflare Turnstile captcha widget
 * and handles verification callbacks.
 */
const TurnstileCaptcha = React.forwardRef<
  TurnstileCaptchaRef,
  TurnstileCaptchaProps
>(
  (
    {
      onVerify,
      onError,
      onExpire,
      className = "",
      theme = "auto",
      size = "normal",
      action = "login",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetId, setWidgetId] = useState<string | null>(null);
    const [isRendered, setIsRendered] = useState(false);
    const [loadAttempts, setLoadAttempts] = useState(0);
    const [renderAttempts, setRenderAttempts] = useState(0);
    const [containerId] = useState(generateUniqueId());

    // Use the shared Turnstile context from our provider
    const turnstileContext = useTurnstile();

    // Call clearTurnstileWidgets on initial mount to clean up any leftover widgets
    useEffect(() => {
      // Clear any leftover widgets from previous renders
      clearTurnstileWidgets();
      return () => {
        // Cleanup this specific widget on unmount
        if (widgetId && window.turnstile) {
          try {
            console.log(
              `🔑 CAPTCHA: Removing widget ${widgetId} on component unmount`
            );
            window.turnstile.remove(widgetId);

            // Remove from registry
            delete captchaWidgetRegistry[containerId];
            delete captchaWidgetIdRegistry[containerId];
            console.log(
              `🔑 CAPTCHA: Unregistered container ${containerId} on unmount`
            );
          } catch (e) {
            console.warn("🔑 CAPTCHA: Error removing widget on unmount", e);
          }
        }
      };
    }, [containerId, widgetId]);

    // Skip if already loaded using the provider
    useEffect(() => {
      // If Turnstile is disabled, bypass the real captcha
      if (isTurnstileDisabled()) {
        console.log("�� CAPTCHA: Turnstile is disabled, using bypass token");
        // Use our standard test token directly
        onVerify(CLOUDFLARE_TEST_SITE_KEY);
        return;
      }

      // Skip in development mode if needed
      if (IS_DEV && isTurnstileDisabled()) {
        // In development, we can bypass the captcha
        const bypassToken = generateBypassToken();
        console.log(
          "🔑 CAPTCHA: Using bypass token in development mode",
          bypassToken
        );
        setTimeout(() => {
          onVerify(bypassToken);
        }, 500);
        return;
      }

      // If Turnstile is already loaded via the provider, skip loading again
      if (turnstileContext.isLoaded) {
        renderWidget();
        return;
      }

      // If we're in the process of loading, wait for it
      if (turnstileContext.isLoading) {
        return;
      }

      // If there was an error loading, try again directly
      if (turnstileContext.error && loadAttempts < 2) {
        console.log(
          "🔑 CAPTCHA: Turnstile provider failed, trying direct load"
        );
        loadTurnstileScript()
          .then(() => {
            console.log("🔑 CAPTCHA: Direct Turnstile script load succeeded");
            renderWidget();
          })
          .catch((error) => {
            console.error(
              "🔑 CAPTCHA: Direct Turnstile script load failed:",
              error
            );
            setLoadAttempts((prev) => prev + 1);
            if (onError) {
              onError(
                new Error(
                  "Failed to load Turnstile script after multiple attempts"
                )
              );
            }
          });
      }
    }, [
      turnstileContext.isLoaded,
      turnstileContext.isLoading,
      turnstileContext.error,
      loadAttempts,
      onVerify,
    ]);

    // Render the widget when the container and script are ready
    const renderWidget = () => {
      if (!containerRef.current || isRendered) return;

      const container = containerRef.current;

      // Add a unique ID for tracking this container
      container.setAttribute("data-turnstile-container", containerId);

      try {
        console.log("🔑 CAPTCHA: Rendering widget...");

        // Skip rendering if Turnstile is disabled
        if (isTurnstileDisabled()) {
          console.log("🔑 CAPTCHA: Turnstile disabled, skipping render");
          return;
        }

        // Get site key from environment utility
        const siteKey = getTurnstileSiteKey();

        if (!siteKey) {
          console.error("🔑 CAPTCHA: Missing site key");
          onError?.(new Error("Missing site key"));
          return;
        }

        console.log(
          `🔑 CAPTCHA: Rendering with site key ${siteKey.substring(0, 10)}...`
        );

        // Configure widget options
        const options = {
          sitekey: siteKey,
          callback: (token: string) => {
            console.log("🔑 CAPTCHA: Verification successful");
            onVerify(token);
          },
          "expired-callback": () => {
            console.log("🔑 CAPTCHA: Token expired");
            if (onExpire) onExpire();
          },
          "error-callback": (err: any) => {
            console.error("🔑 CAPTCHA: Error during verification", err);
            if (onError) onError(new Error(`Turnstile error: ${err}`));
          },
          theme,
          size,
          action,
        };

        // Render the widget using our safe render helper
        renderSafely(
          container,
          options,
          (id) => {
            setWidgetId(id);
            setIsRendered(true);
            console.log(`🔑 CAPTCHA: Widget rendered with ID ${id}`);
          },
          (error) => {
            console.error("🔑 CAPTCHA: Failed to render widget", error);

            // Try again if we haven't attempted too many times
            if (renderAttempts < 2) {
              console.log(
                `🔑 CAPTCHA: Retrying render (attempt ${renderAttempts + 1})...`
              );
              setTimeout(() => {
                setRenderAttempts((prev) => prev + 1);
                renderWidget();
              }, 1000);
            } else if (onError) {
              onError(
                new Error(
                  `Failed to render Turnstile after ${renderAttempts} attempts`
                )
              );
            }
          }
        );
      } catch (error) {
        console.error("🔑 CAPTCHA: Error during render attempt", error);
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    // Trigger render when the DOM is ready
    useEffect(() => {
      if (turnstileContext.isLoaded) {
        renderWidget();
      }
    }, [turnstileContext.isLoaded, renderAttempts]);

    // Define the reset function to be exposed via ref
    const reset = () => {
      if (widgetId && window.turnstile) {
        console.log(`🔑 CAPTCHA: Resetting widget ${widgetId}`);
        window.turnstile.reset(widgetId);
      }
    };

    // Expose the reset function via ref
    React.useImperativeHandle(
      ref,
      () => ({
        reset,
      }),
      [widgetId]
    );

    // Render the container
    return (
      <div
        ref={containerRef}
        id={containerId}
        className={`turnstile-container ${className}`}
        data-size={size}
        data-theme={theme}
      />
    );
  }
);

export default TurnstileCaptcha;
