"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/auth-adapter";
import SubscriptionManagement from "./components/SubscriptionManagement";
import { SubscriptionTier } from "@/types";

export default function SubscriptionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // If auth is loaded and user isn't authenticated, redirect to sign in
    if (!isLoading && !user) {
      router.push("/signin");
    } else if (!isLoading && user) {
      setIsPageLoading(false);
    }
  }, [isLoading, user, router]);

  // Show loading state
  if (isLoading || isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading subscription details...</p>
      </div>
    );
  }

  // If the user exists but there's no subscription, show something appropriate
  if (!user?.subscription) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="bg-card/50 rounded-lg border p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Active Subscription</h1>
          <p className="text-muted-foreground mb-6">
            You don't currently have an active subscription. Upgrade to access
            premium features.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
      <p className="text-muted-foreground mb-8">
        View and manage your subscription details and billing information.
      </p>

      <SubscriptionManagement
        currentPlan={user.subscription.planName as SubscriptionTier["name"]}
        subscriptionStatus={user.subscription.status}
        nextBillingDate={user.subscription.currentPeriodEnd?.toDateString()}
      />
    </div>
  );
}
