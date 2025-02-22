import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showThankYou: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showThankYou: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Uncaught error:", error, errorInfo);
    }

    // For Supabase configuration errors, we don't want to show an error
    if (error.message.includes("Missing Supabase credentials")) {
      return;
    }

    // Track error for analytics
    this.trackError(error, errorInfo);

    // Set error info to state
    this.setState({ errorInfo });
  }

  private trackError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Store error locally for debugging
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const storedErrors = JSON.parse(
        localStorage.getItem("errorLogs") || "[]"
      );
      storedErrors.push(errorLog);

      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.shift();
      }

      localStorage.setItem("errorLogs", JSON.stringify(storedErrors));
    } catch (e) {
      console.error("Failed to store error:", e);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isSupabaseError = this.state.error?.message.includes(
        "Missing Supabase credentials"
      );

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-[#1E1E1E] p-4"
          role="alert"
          aria-live="assertive"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center relative"
          >
            <div className="mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              {isSupabaseError
                ? "Database Connection Required"
                : "Oops! Something went wrong"}
            </h2>

            <p className="text-white/80 mb-6">
              {isSupabaseError
                ? 'Please click the "Connect to Supabase" button in the top right corner to set up your database connection.'
                : "We've been notified and will investigate the issue. Please try refreshing the page."}
            </p>

            <div className="space-y-3">
              <Button
                onClick={this.handleReload}
                className="w-full h-12 bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
              >
                <div className="flex items-center justify-center w-full gap-3">
                  <RefreshCw className="w-5 h-5 flex-shrink-0" />
                  <span>Refresh Page</span>
                </div>
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 text-left">
                <details className="text-white/60 text-sm">
                  <summary className="cursor-pointer hover:text-white/80">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-4 bg-black/30 rounded-lg whitespace-pre-wrap break-words max-w-full">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
