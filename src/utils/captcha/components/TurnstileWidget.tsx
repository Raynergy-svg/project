"use client";

import React, { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY, isTurnstileDisabled } from "@/utils/turnstile";
import { IS_DEV } from "@/utils/environment";
import {
  loadTurnstileScript,
  isTurnstileScriptLoaded,
  onTurnstileLoad,
  resetTurnstileState,
  registerWidget,
  unregisterWidget,
  hasRegisteredWidget,
  getWidgetIdForContainer,
  forceCleanupTurnstile,
} from "@/utils/turnstileLoader";

// Global registry to track which containers have Turnstile widgets
const widgetRegistry: Record<string, boolean> = {};

// Track rendered widgets with their IDs to properly clean up
const widgetIdRegistry: Record<string, string> = {};

/**
 * Clear all Turnstile widgets and reset the registry.
 * This is useful when navigating between pages or when we want to force a fresh start.
 */
export function clearTurnstileWidgets() {
  forceCleanupTurnstile();
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
  action?: string; // Optional action parameter for tracking
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

// Generate a unique container ID for each widget instance
function generateUniqueId(): string {
  return `turnstile-widget-${Math.random().toString(36).substring(2, 11)}`;
}

// Function to safely render the Turnstile widget
const renderTurnstileWidget = (
  container: HTMLElement,
  options: any,
  onSuccess: (widgetId: string) => void,
  onFail: (error: any) => void
) => {
  try {
    // First check if window.turnstile exists at all
    if (!window.turnstile) {
      throw new Error("Turnstile not loaded");
    }

    // Get a unique identifier for this container
    const containerKey =
      container.id || container.getAttribute("data-turnstile-container");

    // Check if this container already has a widget in our registry
    if (containerKey && hasRegisteredWidget(containerKey)) {
      console.log(
        `🔒 Turnstile: Container ${containerKey} already has a widget registered. Preventing duplicate render.`
      );

      // Get the existing widget ID from our registry
      const existingWidgetId = getWidgetIdForContainer(containerKey);

      // If we already have a widget ID, reuse it instead of re-rendering
      if (existingWidgetId) {
        console.log(
          `🔒 Turnstile: Reusing existing widget ${existingWidgetId} for container ${containerKey}`
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
            `🔒 Turnstile: Removed existing widget ${widgetId} from container ${containerKey}`
          );

          // Clear the container
          container.innerHTML = "";

          // Unregister this container
          if (containerKey) {
            unregisterWidget(containerKey);
          }
        }
      } catch (e) {
        console.error(
          `🔒 Turnstile: Error cleaning up existing widget in container ${containerKey}`,
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

    // Now we can safely render the widget
    onTurnstileLoad(() => {
      try {
        // At this point, we know Turnstile is fully loaded
        if (!window.turnstile) {
          throw new Error("Turnstile unexpectedly undefined after load");
        }

        // Double check the container is still in the DOM before rendering
        if (!document.body.contains(container)) {
          console.warn(
            `🔒 Turnstile: Container ${containerKey} is no longer in the DOM`
          );
          if (containerKey) {
            unregisterWidget(containerKey);
          }
          onFail(new Error("Container is no longer in the DOM"));
          return;
        }

        // If this container already has a data-widget-id attribute,
        // the widget may have been rendered already by React StrictMode
        const existingWidgetId = container.getAttribute("data-widget-id");
        if (existingWidgetId) {
          console.log(
            `🔒 Turnstile: Found existing widget ID ${existingWidgetId} in container ${containerKey}`
          );

          // Register the widget in our registry
          if (containerKey) {
            registerWidget(containerKey, existingWidgetId);
          }

          onSuccess(existingWidgetId);
          return;
        }

        // Now we can safely render the widget
        const widgetId = window.turnstile.render(container, options);
        if (widgetId) {
          console.log(
            `🔒 Turnstile: Successfully rendered widget ${widgetId} in container ${containerKey}`
          );

          // Save widget ID as data attribute for future reference
          container.setAttribute("data-widget-id", widgetId);

          // Register the widget in our registry
          if (containerKey) {
            registerWidget(containerKey, widgetId);
          }

          onSuccess(widgetId);
        } else {
          onFail(new Error("Failed to get widget ID from Turnstile"));
          // Unregister on failure
          if (containerKey) {
            unregisterWidget(containerKey);
          }
        }
      } catch (error) {
        console.error("🔒 Turnstile: Error rendering widget after load", error);
        onFail(error);
        // Unregister on failure
        if (containerKey) {
          unregisterWidget(containerKey);
        }
      }
    });
  } catch (error) {
    console.error("🔒 Turnstile: Error setting up rendering", error);
    onFail(error);

    // Unregister on failure
    const containerKey =
      container.id || container.getAttribute("data-turnstile-container");
    if (containerKey) {
      unregisterWidget(containerKey);
    }
  }
};

// Internal widget component used by both exports
const InternalTurnstileWidget = React.forwardRef<
  { reset: () => void },
  TurnstileWidgetProps
>(
  (
    {
      onVerify,
      onError,
      onExpire,
      className = "",
      action = "login",
      theme = "auto",
      size = "normal",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [componentScriptLoaded, setComponentScriptLoaded] = useState(
      isTurnstileScriptLoaded()
    );
    const [loadAttempts, setLoadAttempts] = useState(0);
    const [renderAttempts, setRenderAttempts] = useState(0);
    const [containerId] = useState(generateUniqueId());

    // Reset on unmount to prevent duplicate widgets
    useEffect(() => {
      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            console.log(
              `🔒 Turnstile: Removing widget ${widgetIdRef.current} on component unmount`
            );
            window.turnstile.remove(widgetIdRef.current);

            // Unregister this container from the registry
            unregisterWidget(containerId);
            console.log(
              `🔒 Turnstile: Unregistered container ${containerId} on unmount`
            );
          } catch (e) {
            console.warn("🔒 Turnstile: Error removing widget on unmount", e);
          }
        }
      };
    }, [containerId]);

    // Load the Turnstile script
    useEffect(() => {
      // In development mode, check if we should use the "Always Pass" Turnstile setup
      if (IS_DEV && process.env.ENABLE_TURNSTILE_IN_DEV === "true") {
        console.log(
          '🔒 Turnstile: Using development mode with "Always Pass" configuration'
        );
        // Continue with script loading to use the "Always Pass" widget
      }
      // Skip completely if Turnstile is disabled
      else if (
        IS_DEV &&
        (process.env.DISABLE_TURNSTILE === "true" ||
          process.env.SKIP_AUTH_CAPTCHA === "true" ||
          process.env.SUPABASE_AUTH_CAPTCHA_DISABLE === "true")
      ) {
        console.log("🔒 Turnstile: Using bypass token in development mode");
        // Simulate a successful verification with a bypass token
        setTimeout(() => {
          onVerify("1x00000000000000000000AA");
        }, 500);
        return;
      }

      // Check if Turnstile script is already loaded globally
      if (isTurnstileScriptLoaded()) {
        setComponentScriptLoaded(true);
        return;
      }

      // Load the script
      console.log("🔒 Turnstile: Loading script...");
      loadTurnstileScript()
        .then(() => {
          console.log("🔒 Turnstile: Script loaded successfully");
          setComponentScriptLoaded(true);
        })
        .catch((error) => {
          console.error("🔒 Turnstile: Script loading failed", error);
          // Try again if we haven't attempted too many times
          if (loadAttempts < 2) {
            setTimeout(() => {
              setLoadAttempts((prev) => prev + 1);
            }, 2000);
          }
          if (onError) onError(error);
        });

      // No cleanup needed since we're using a global loader
    }, [onVerify, onError, loadAttempts]);

    // Render the widget when the script is loaded
    useEffect(() => {
      // Skip rendering if we're just using a bypass token
      if (!containerRef.current || !componentScriptLoaded || isLoaded) {
        return;
      }

      // Don't try to render if the component is unmounting
      if (!document.body.contains(containerRef.current)) {
        return;
      }

      // Clear any previous content in the container
      containerRef.current.innerHTML = "";

      // Update the container attribute for tracking
      containerRef.current.setAttribute(
        "data-turnstile-container",
        containerId
      );

      console.log(
        `🔒 Turnstile: Attempting to render widget in container ${containerId}`
      );

      // Prepare options for the Turnstile widget
      const options = {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          console.log(
            `🔒 Turnstile: Verification successful with token ${token.substring(
              0,
              10
            )}...`
          );
          onVerify(token);
        },
        "expired-callback": () => {
          console.log("🔒 Turnstile: Token expired");
          if (onExpire) onExpire();
        },
        "error-callback": (error: any) => {
          console.error("🔒 Turnstile: Widget error", error);
          if (onError) onError(error);
        },
        theme: theme,
        size: size,
        tabindex: 0,
        action: action,
        "response-field": false,
        retry: "auto",
        "retry-interval": 5000,
      };

      // Log diagnostics for development debugging
      if (IS_DEV) {
        console.log("🔒 Turnstile Configuration:", {
          siteKey: TURNSTILE_SITE_KEY,
          isDev: IS_DEV,
          isDisabled: isTurnstileDisabled(),
          container: containerId,
        });
      }

      // Check if there's already a widget ID stored for this container
      // This helps handle React StrictMode's double rendering
      const existingWidgetId = containerId
        ? widgetIdRegistry[containerId]
        : null;

      if (existingWidgetId) {
        console.log(
          `🔒 Turnstile: Reusing existing widget ${existingWidgetId} for ${containerId} during re-render`
        );
        widgetIdRef.current = existingWidgetId;
        setIsLoaded(true);
        return;
      }

      try {
        console.log(
          "🔒 Turnstile: Setting up widget with site key",
          TURNSTILE_SITE_KEY
        );

        // Use the safer rendering approach
        renderTurnstileWidget(
          containerRef.current,
          options,
          (widgetId) => {
            widgetIdRef.current = widgetId;
            setIsLoaded(true);

            // Store the widget ID as a data attribute for debugging
            if (containerRef.current) {
              containerRef.current.setAttribute("data-widget-id", widgetId);
            }

            // Also store in our registry
            if (containerId) {
              widgetIdRegistry[containerId] = widgetId;
            }
          },
          (error) => {
            console.error("🔒 Turnstile: Error rendering widget", error);

            // Only attempt re-render if we haven't tried too many times
            if (renderAttempts < 2) {
              setTimeout(() => {
                setRenderAttempts((prev) => prev + 1);
                // Force a refresh of the component
                setIsLoaded(false);
              }, 2000);
            }

            if (onError) onError(error);
          }
        );
      } catch (error) {
        console.error("🔒 Turnstile: Error in render effect", error);
        if (onError) onError(error);
      }

      return () => {
        // Clean up widget when effect reruns but only if widgetId isn't in registry
        // This prevents cleaning up during StrictMode's double-run
        if (widgetIdRef.current && window.turnstile) {
          try {
            // Don't actually remove the widget if it's in our registry
            // This helps with React StrictMode double rendering
            const shouldRemove = !containerId || !widgetIdRegistry[containerId];

            if (shouldRemove) {
              console.log(
                `🔒 Turnstile: Removing widget ${widgetIdRef.current} on cleanup`
              );
              window.turnstile.remove(widgetIdRef.current);
              widgetIdRef.current = null;
            } else {
              console.log(
                `🔒 Turnstile: Skipping removal of widget ${widgetIdRef.current} during StrictMode render`
              );
            }
          } catch (e) {
            console.warn("🔒 Turnstile: Error removing widget on cleanup", e);
          }
        }
      };
    }, [
      componentScriptLoaded,
      isLoaded,
      onVerify,
      onError,
      onExpire,
      action,
      theme,
      size,
      renderAttempts,
    ]);

    // Function to reset the widget
    const reset = () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn("🔒 Turnstile: Error resetting widget", e);

          // If reset fails, try a full reset
          setIsLoaded(false);

          // Try again after a brief delay
          setTimeout(() => {
            if (containerRef.current) {
              setComponentScriptLoaded(true);
            }
          }, 500);
        }
      }
    };

    // Properly expose the reset method using useImperativeHandle
    React.useImperativeHandle(ref, () => ({
      reset,
    }));

    return (
      <div
        ref={containerRef}
        id={containerId}
        data-turnstile-container={containerId}
        className={`turnstile-container ${className}`}
        data-testid="turnstile-widget"
        data-state={isLoaded ? "loaded" : "loading"}
        data-theme={theme}
        data-size={size}
      />
    );
  }
);

// Use React's memo to prevent unnecessary rerenders of the widget
export const TurnstileWidget = React.memo(function TurnstileWidget(
  props: TurnstileWidgetProps
) {
  return <InternalTurnstileWidget {...props} />;
});

// Also memoize the forwarded ref version
export const ForwardedTurnstileWidget = React.memo(InternalTurnstileWidget);

// Hook to use Turnstile in functional components
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const widgetRef = useRef<{ reset: () => void } | null>(null);

  const handleVerify = (newToken: string) => {
    setToken(newToken);
    setIsVerified(true);
    setError(null);
  };

  const handleError = (err: any) => {
    setError(err);
    setIsVerified(false);
  };

  const handleExpire = () => {
    setToken(null);
    setIsVerified(false);
  };

  const resetToken = () => {
    if (widgetRef.current) {
      widgetRef.current.reset();
    }
    setToken(null);
    setIsVerified(false);
  };

  return {
    token,
    error,
    isVerified,
    resetToken,
    TurnstileWidget: (
      props: Omit<TurnstileWidgetProps, "onVerify" | "onError" | "onExpire">
    ) => (
      <ForwardedTurnstileWidget
        {...props}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        ref={widgetRef}
      />
    ),
  };
}
