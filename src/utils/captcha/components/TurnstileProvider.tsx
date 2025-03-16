"use client";

import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import Head from "next/head";
import { TurnstilePreconnect } from "./TurnstilePreconnect";
import {
  isTurnstileScriptLoaded,
  loadTurnstileScript,
} from "@/utils/turnstileLoader";
import setupPreloadWarningFix, { createPreloadLink } from "@/utils/preloadFix";

interface TurnstileContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  token: string | null;
  resetToken: (newToken?: string) => void;
  TurnstileWidget: React.FC<any>;
}

const TurnstileContext = createContext<TurnstileContextType>({
  isLoaded: false,
  isLoading: false,
  error: null,
  token: null,
  resetToken: () => {},
  TurnstileWidget: () => null,
});

export const useTurnstile = () => useContext(TurnstileContext);

// Default widget component that will be provided through context
const DefaultTurnstileWidget: React.FC<any> = (props) => {
  const { isLoaded } = useTurnstile();

  if (!isLoaded) {
    return (
      <div className="turnstile-loading">Loading security verification...</div>
    );
  }

  return (
    <div
      id={props.id || "turnstile-widget"}
      className={`turnstile-container ${props.className || ""}`}
      data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    />
  );
};

export function TurnstileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    Omit<TurnstileContextType, "resetToken" | "TurnstileWidget">
  >({
    isLoaded: isTurnstileScriptLoaded(),
    isLoading: false,
    error: null,
    token: null,
  });

  // Track load attempts to avoid infinite loading
  const [loadAttempts, setLoadAttempts] = useState(0);
  const maxLoadAttempts = 3;

  // Reset token function - allows passing a specific token or clearing the current one
  const resetToken = useCallback((newToken?: string) => {
    setState((prev) => ({
      ...prev,
      token: newToken || null,
    }));
  }, []);

  // Load Turnstile script on mount with retry logic
  useEffect(() => {
    if (state.isLoaded || state.isLoading) {
      return;
    }

    const loadTurnstile = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        await loadTurnstileScript();
        setState({
          isLoaded: true,
          isLoading: false,
          error: null,
          token: null,
        });

        console.log("🔒 Turnstile: Script loaded successfully");
      } catch (error) {
        console.error("🔒 Turnstile: Failed to load script:", error);

        setState({
          isLoaded: false,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
          token: null,
        });

        // Retry loading if we haven't exceeded max attempts
        if (loadAttempts < maxLoadAttempts) {
          console.log(
            `🔒 Turnstile: Retrying script load (attempt ${
              loadAttempts + 1
            }/${maxLoadAttempts})`
          );

          // Exponential backoff for retries
          const retryDelay = Math.min(1000 * Math.pow(2, loadAttempts), 10000);

          setTimeout(() => {
            setLoadAttempts((prev) => prev + 1);
            setState((prev) => ({ ...prev, isLoading: false }));
          }, retryDelay);
        }
      }
    };

    loadTurnstile();
  }, [state.isLoaded, state.isLoading, loadAttempts]);

  // Clean up Turnstile on unmount
  useEffect(() => {
    return () => {
      // Clean up any Turnstile widgets when the provider unmounts
      if (typeof window !== "undefined" && window.turnstile) {
        const widgetIds = document.querySelectorAll("[data-widget-id]");
        widgetIds.forEach((element) => {
          const widgetId = element.getAttribute("data-widget-id");
          if (widgetId) {
            try {
              window.turnstile.remove(widgetId);
            } catch (e) {
              console.warn(
                "🔒 Turnstile: Error removing widget on provider unmount",
                e
              );
            }
          }
        });
      }
    };
  }, []);

  // Set up the preload warning fix
  useEffect(() => {
    // Set up the global preload warning fix
    const cleanup = setupPreloadWarningFix();

    return () => {
      cleanup();
    };
  }, []);

  // Define a custom TurnstileWidget component that accesses the context internally
  const TurnstileWidget: React.FC<any> = useCallback(
    (props) => {
      const [widgetId, setWidgetId] = useState<string | null>(null);
      const containerRef = React.useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (
          !state.isLoaded ||
          !containerRef.current ||
          widgetId ||
          !window.turnstile
        ) {
          return;
        }

        // Initialize widget when Turnstile is loaded
        const onVerify = (token: string) => {
          console.log("🔒 Turnstile: Verification successful");
          setState((prev) => ({ ...prev, token }));
          if (props.onVerify) props.onVerify(token);
        };

        const onError = (error: any) => {
          console.error("🔒 Turnstile: Verification error", error);
          if (props.onError) props.onError(error);
        };

        const onExpire = () => {
          console.log("🔒 Turnstile: Token expired");
          setState((prev) => ({ ...prev, token: null }));
          if (props.onExpire) props.onExpire();
        };

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
            theme: props.theme || "light",
            callback: onVerify,
            "error-callback": onError,
            "expired-callback": onExpire,
            size: props.size || "normal",
          });

          setWidgetId(id);
          containerRef.current.setAttribute("data-widget-id", id);
        } catch (error) {
          console.error("🔒 Turnstile: Error rendering widget", error);
          if (props.onError) props.onError(error);
        }

        return () => {
          if (widgetId && window.turnstile) {
            try {
              window.turnstile.remove(widgetId);
            } catch (e) {
              console.warn("🔒 Turnstile: Error removing widget", e);
            }
          }
        };
      }, [state.isLoaded, widgetId, props]);

      // Show loading indicator while we're loading the script
      if (state.isLoading) {
        return (
          <div className="turnstile-widget-loading flex items-center justify-center space-x-2 py-3 min-h-[65px]">
            <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">
              Loading security check...
            </span>
          </div>
        );
      }

      // Show error state if loading failed
      if (state.error && !state.isLoaded) {
        // When in development mode, provide a bypass option
        if (process.env.NODE_ENV === "development") {
          // Automatically trigger the callback with a development bypass token
          const bypassToken = "1x00000000000000000000AA";
          setTimeout(() => {
            if (typeof props.onVerify === "function") {
              props.onVerify(bypassToken);
            }
            setState((prev) => ({ ...prev, token: bypassToken }));
          }, 500);

          return (
            <div className="turnstile-widget-bypass flex flex-col items-center justify-center py-3 min-h-[65px] border border-dashed border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <span className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">
                Development Mode: CAPTCHA Bypassed
              </span>
              <span className="text-xs text-muted-foreground">
                Security verification will be skipped
              </span>
            </div>
          );
        }

        return (
          <div className="turnstile-widget-error flex flex-col items-center justify-center py-3 min-h-[65px] border border-dashed border-destructive/50 bg-destructive/10 rounded-md">
            <span className="text-sm text-destructive mb-1">
              Failed to load security verification
            </span>
            <button
              onClick={() => {
                setState((prev) => ({ ...prev, isLoading: true, error: null }));
                loadTurnstileScript()
                  .then(() => {
                    setState((prev) => ({
                      ...prev,
                      isLoaded: true,
                      isLoading: false,
                      error: null,
                    }));
                    // Force re-render to initialize widget
                    setWidgetId(null);
                  })
                  .catch((err) => {
                    setState((prev) => ({
                      ...prev,
                      isLoading: false,
                      error:
                        err instanceof Error ? err : new Error(String(err)),
                    }));
                  });
              }}
              className="text-xs underline text-muted-foreground hover:text-foreground"
            >
              Try again
            </button>
          </div>
        );
      }

      return (
        <div
          ref={containerRef}
          className={`turnstile-widget ${props.className || ""}`}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "65px",
          }}
        >
          {state.isLoading && (
            <div className="turnstile-loading">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                <span className="text-sm text-muted-foreground">
                  Loading security verification...
                </span>
              </div>
            </div>
          )}
        </div>
      );
    },
    [state.isLoaded, state.isLoading, state.error, resetToken]
  );

  const contextValue: TurnstileContextType = {
    ...state,
    resetToken,
    TurnstileWidget,
  };

  return (
    <TurnstileContext.Provider value={contextValue}>
      <Head>
        {/* 
          Add preconnect links for Cloudflare Turnstile
          This improves performance by establishing early connections
        */}
        <link
          rel="preconnect"
          href="https://challenges.cloudflare.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />

        {/* Preload the Turnstile API script with correct 'as' attribute */}
        <link
          rel="preload"
          href="https://challenges.cloudflare.com/turnstile/v0/api.js"
          as="script"
          crossOrigin="anonymous"
        />
      </Head>
      {children}
    </TurnstileContext.Provider>
  );
}

export default TurnstileProvider;
