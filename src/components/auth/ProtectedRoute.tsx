import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "@/empty-module";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { supabase } from "@/utils/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      // Always bypass subscription check in development mode
      if (
        window.location.hostname === "localhost" ||
        import.meta.env.MODE === "development"
      ) {
        console.log("Development mode detected - bypassing subscription check");
        setHasSubscription(true);
        setIsLoading(false);
        return;
      }

      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Query the user's subscription status from Supabase
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("status, subscription_id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error checking subscription:", error);
          // If we can't check the subscription (API error, etc.), allow access in development
          // but block in production
          if (import.meta.env.MODE === "development") {
            console.warn(
              "Development mode - allowing access despite subscription check error"
            );
            setHasSubscription(true);
          } else {
            setHasSubscription(false);
          }
        } else {
          // Check if subscription is active
          setHasSubscription(data && data.status === "active");
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        // Same fallback behavior as above
        if (import.meta.env.MODE === "development") {
          console.warn("Development mode - allowing access despite error");
          setHasSubscription(true);
        } else {
          setHasSubscription(false);
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign in if not authenticated
    return (
      <Navigate to="/signin" state={{ returnTo: location.pathname }} replace />
    );
  }

  if (!hasSubscription) {
    // Redirect to pricing section of the landing page if no active subscription
    return <Navigate to="/?pricing=true" replace />;
  }

  return <>{children}</>;
}
