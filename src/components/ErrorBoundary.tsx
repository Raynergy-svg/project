import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo?: ErrorInfo;
  showThankYou: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showThankYou: false,
    error: null,
    errorInfo: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Don't show error UI for Supabase configuration errors
    if (error && error.message && error.message.includes("Missing Supabase credentials")) {
      return { 
        hasError: false, 
        error: null, 
        showThankYou: false, 
        errorInfo: undefined 
      };
    }
    
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error, 
      showThankYou: false, 
      errorInfo: undefined 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // For Supabase configuration errors, we don't want to show an error
    if (error && error.message && error.message.includes("Missing Supabase credentials")) {
      // Reset the error state to prevent showing the error UI
      this.setState({ hasError: false, error: null });
      return;
    }

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Uncaught error:", error, errorInfo);
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    // Don't show error UI for Supabase configuration errors
    if (this.state.error && this.state.error.message && 
        this.state.error.message.includes("Missing Supabase credentials")) {
      return this.props.children;
    }

    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset} variant="default">
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
