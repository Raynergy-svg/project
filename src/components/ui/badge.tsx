import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "bg-gray-50 text-gray-600 ring-gray-500/10",
        primary:
          "bg-blue-50 text-blue-700 ring-blue-600/20",
        secondary:
          "bg-purple-50 text-purple-700 ring-purple-600/20",
        destructive:
          "bg-red-50 text-red-700 ring-red-600/20",
        success:
          "bg-green-50 text-green-700 ring-green-600/20",
        warning:
          "bg-amber-50 text-amber-700 ring-amber-600/20",
        info:
          "bg-sky-50 text-sky-700 ring-sky-600/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 