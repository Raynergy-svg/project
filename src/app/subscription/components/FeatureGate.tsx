"use client";

import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FeatureGateProps {
  children: ReactNode;
  isPremium: boolean;
  isTrialing: boolean;
  feature: string;
  className?: string;
}

export default function FeatureGate({
  children,
  isPremium,
  isTrialing,
  feature,
  className = "",
}: FeatureGateProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  // If user has premium or is in trial, show the feature
  if (isPremium || isTrialing) {
    return <>{children}</>;
  }

  // Otherwise, show a locked state
  return (
    <Card
      className={`p-6 flex flex-col items-center justify-center text-center space-y-4 ${className}`}
    >
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
        <Lock className="w-6 h-6 text-primary" />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Premium Feature</h3>
        <p className="text-muted-foreground text-sm">
          {feature} is available to premium subscribers. Upgrade your account to
          access this feature.
        </p>
      </div>

      <Button onClick={handleUpgrade} className="mt-4">
        Upgrade to Premium
      </Button>
    </Card>
  );
}
