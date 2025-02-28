import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorColor?: string;
    indicatorClassName?: string;
    max?: number;
  }
>(({ className, value, indicatorColor, indicatorClassName, max = 100, ...props }, ref) => {
  // Calculate the percentage value
  const percentage = value !== undefined ? (value / max) * 100 : 0;
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          indicatorClassName || (indicatorColor ? null : "bg-[#88B04B]")
        )}
        style={{ 
          transform: `translateX(-${100 - percentage}%)`,
          backgroundColor: indicatorColor || undefined
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }; 