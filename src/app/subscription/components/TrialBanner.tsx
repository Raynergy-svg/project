"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  daysRemaining: number;
  onDismiss?: () => void;
}

export default function TrialBanner({
  daysRemaining,
  onDismiss,
}: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  // Customize messaging based on days remaining
  let message = "";
  let isUrgent = false;

  if (daysRemaining <= 1) {
    message = "Your trial ends today!";
    isUrgent = true;
  } else if (daysRemaining <= 3) {
    message = `Only ${daysRemaining} days left in your trial!`;
    isUrgent = true;
  } else {
    message = `You have ${daysRemaining} days left in your trial.`;
  }

  return (
    <div
      className={`py-3 px-4 flex items-center justify-between ${
        isUrgent
          ? "bg-amber-500/10 text-amber-700"
          : "bg-violet-500/10 text-violet-700"
      } rounded-lg`}
    >
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5" />
        <p className="font-medium">
          {message} Upgrade to continue access to premium features.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={handleUpgrade}
          size="sm"
          className={
            isUrgent
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-violet-600 hover:bg-violet-700 text-white"
          }
        >
          Upgrade Now
        </Button>

        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-foreground/60 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
