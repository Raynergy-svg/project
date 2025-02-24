import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#88B04B] text-white hover:bg-[#88B04B]/90",
        destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50",
        outline: "border border-white/10 bg-transparent hover:bg-white/5",
        secondary: "bg-white/5 text-white hover:bg-white/10",
        ghost: "hover:bg-white/5",
        link: "text-[#88B04B] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
      isLoading: {
        true: "relative !text-transparent hover:!text-transparent !cursor-wait transition-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isLoading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, isLoading, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        {props.children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };