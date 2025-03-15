"use client";

import { CrownIcon } from "lucide-react";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";

const statusConfig = {
  free: {
    label: "Free Plan",
    bgColor: "bg-slate-600",
    textColor: "text-white",
    icon: null,
  },
  active: {
    label: "Premium",
    bgColor: "bg-gradient-to-r from-amber-500 to-amber-600",
    textColor: "text-white",
    icon: <CrownIcon className="w-3 h-3" />,
  },
  past_due: {
    label: "Payment Due",
    bgColor: "bg-orange-600",
    textColor: "text-white",
    icon: null,
  },
  canceled: {
    label: "Canceled",
    bgColor: "bg-slate-700",
    textColor: "text-white",
    icon: null,
  },
  trialing: {
    label: "Trial",
    bgColor: "bg-violet-600",
    textColor: "text-white",
    icon: null,
  },
};

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
  planName?: string;
  className?: string;
}

export default function SubscriptionBadge({
  status,
  planName,
  className = "",
}: SubscriptionBadgeProps) {
  const config = statusConfig[status] || statusConfig.free;
  const displayLabel =
    status === "active" && planName ? planName : config.label;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.icon && <span>{config.icon}</span>}
      <span>{displayLabel}</span>
    </div>
  );
}
