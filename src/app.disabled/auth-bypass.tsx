"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

/**
 * Temporary Auth Bypass Component
 *
 * This component provides a simple way to bypass authentication in development
 * while maintaining proper authentication in production.
 *
 * Usage:
 * import AuthBypass from '@/app/auth-bypass';
 *
 * function ProtectedPage() {
 *   return (
 *     <AuthBypass fallback={<Login />}>
 *       <YourProtectedContent />
 *     </AuthBypass>
 *   );
 * }
 */
export default function AuthBypass({
  children,
  fallback,
  role = "user",
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  role?: "admin" | "user";
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setError("Failed to check authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle dev sign-in
  const handleDevSignIn = async () => {
    if (process.env.NODE_ENV !== "development") {
      setError("Dev sign-in is only available in development mode");
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // Use a development email based on the role
      const email = role === "admin" ? "admin@example.com" : "user@example.com";

      // Get the dev sign-in function directly to avoid circular imports
      const { devSignIn } = await import("@/utils/supabase/client");
      const result = await devSignIn(
        email,
        role === "admin" ? "admin-password" : "user-password"
      );

      if (result.error) {
        setError(`Sign-in failed: ${result.error.message}`);
      } else {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Dev sign-in error:", err);
      setError("An unexpected error occurred during sign-in");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // In production, behave normally
  if (process.env.NODE_ENV === "production") {
    return isAuthenticated ? <>{children}</> : <>{fallback}</>;
  }

  // In development, provide a bypass option
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen">
      <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Development Authentication</h1>

        <p className="mb-6 text-muted-foreground">
          This page requires authentication. You can use the regular
          authentication flow or use the development bypass below.
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleDevSignIn}
            disabled={isAuthenticating}
            className="w-full"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>Dev Sign In as {role}</>
            )}
          </Button>

          {fallback ? (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Or use the regular authentication flow:
              </p>
              {fallback}
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/signin")}
            >
              Go to Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
