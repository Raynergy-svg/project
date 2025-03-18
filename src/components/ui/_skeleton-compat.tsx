/**
 * Compatibility file for handling case-sensitivity issues with Skeleton imports
 * This ensures that both '@/components/ui/Skeleton' and '@/components/ui/skeleton'
 * imports work correctly regardless of casing.
 */

import React from 'react';
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "card" | "text" | "circular" | "chart";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton = ({
  className = "",
  variant = "default",
  width,
  height,
  animate = true,
  ...props
}: SkeletonProps) => {
  // Base style for all skeletons
  const baseStyle = cn(
    "bg-gray-200 dark:bg-gray-700 rounded",
    animate && "animate-pulse",
    className
  );

  // Style based on variant
  const variantStyle = {
    default: "h-4",
    card: "h-32 w-full rounded-md",
    text: "h-4 w-3/4",
    circular: "rounded-full h-12 w-12",
    chart: "h-32"
  }[variant];

  // Inline styles for width and height
  const inlineStyle: React.CSSProperties = {};
  if (width) inlineStyle.width = typeof width === "number" ? `${width}px` : width;
  if (height) inlineStyle.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseStyle, variantStyle)}
      style={inlineStyle}
      {...props}
      aria-hidden="true"
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  lineHeight?: string | number;
  className?: string;
  lastLineWidth?: string | number;
  animate?: boolean;
}

export const SkeletonText = ({
  lines = 1,
  width = "100%",
  lineHeight = "1rem",
  className = "",
  lastLineWidth = "75%",
  animate = true,
}: SkeletonTextProps) => {
  const lineStyle: React.CSSProperties = {
    height: typeof lineHeight === "number" ? `${lineHeight}px` : lineHeight,
    width: typeof width === "number" ? `${width}px` : width,
    marginBottom: "0.5rem",
  };

  const lastLineStyle: React.CSSProperties = {
    ...lineStyle,
    width: typeof lastLineWidth === "number" ? `${lastLineWidth}px` : lastLineWidth,
    marginBottom: 0,
  };

  return (
    <div className={className}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={i}
            className="mb-2"
            style={i === lines - 1 ? lastLineStyle : lineStyle}
            animate={animate}
          />
        ))}
    </div>
  );
};

interface SkeletonCardGridProps {
  cards?: number;
  columns?: number;
  cardHeight?: string | number;
  className?: string;
  animate?: boolean;
}

export const SkeletonCardGrid = ({
  cards = 3,
  columns = 3,
  cardHeight = "9rem",
  className = "",
  animate = true,
}: SkeletonCardGridProps) => {
  const style = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "1rem",
  };

  return (
    <div className={className} style={style}>
      {Array(cards)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={i}
            variant="card"
            height={cardHeight}
            animate={animate}
            className="rounded-lg"
          />
        ))}
    </div>
  );
};

const defaultExport = { Skeleton, SkeletonText, SkeletonCardGrid };
export default defaultExport;
