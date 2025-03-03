import { cn } from '@/lib/utils';
import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'circular' | 'chart';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Skeleton component for displaying loading states
 */
export const Skeleton = memo(({
  className = '',
  variant = 'default',
  width,
  height,
  animate = true,
}: SkeletonProps) => {
  // Base style for all skeletons
  const baseClass = cn(
    'bg-white/10 rounded',
    animate && 'animate-pulse',
    className
  );

  // Apply variant-specific styles and dimensions
  switch (variant) {
    case 'card':
      return (
        <div 
          className={cn(
            baseClass,
            'rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm overflow-hidden'
          )}
          style={{ width, height }}
        >
          <div className="p-6 flex flex-col space-y-4">
            <div className="h-4 w-1/3 bg-white/10 rounded" />
            <div className="h-10 w-2/3 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
          </div>
        </div>
      );
    
    case 'text':
      return (
        <div 
          className={cn(baseClass, 'h-4')}
          style={{ width: width || '100%', height }}
        />
      );
    
    case 'circular':
      return (
        <div 
          className={cn(baseClass, 'rounded-full')}
          style={{ 
            width: width || '2.5rem', 
            height: height || width || '2.5rem'
          }}
        />
      );
      
    case 'chart':
      return (
        <div 
          className={cn(
            baseClass,
            'flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm'
          )}
          style={{ width: width || '100%', height: height || '12rem' }}
        >
          <div className="h-12 w-12 rounded-full bg-white/10 mb-4" />
          <div className="h-4 w-48 max-w-[80%] bg-white/10 rounded mb-2" />
          <div className="h-3 w-64 max-w-[90%] bg-white/10 rounded" />
        </div>
      );
      
    case 'default':
    default:
      return (
        <div 
          className={baseClass}
          style={{ width, height }}
        />
      );
  }
});

/**
 * Skeleton text that can span multiple lines
 */
export const SkeletonText = memo(({
  lines = 1,
  width = '100%',
  lineHeight = '1rem',
  className = '',
  lastLineWidth = '75%',
  animate = true,
}: {
  lines?: number;
  width?: string | number;
  lineHeight?: string | number;
  className?: string;
  lastLineWidth?: string | number;
  animate?: boolean;
}) => {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lines > 1 ? lastLineWidth : width}
          height={lineHeight}
          animate={animate}
        />
      ))}
    </div>
  );
});

/**
 * Skeleton for card layouts
 */
export const SkeletonCardGrid = memo(({
  cards = 3,
  columns = 3,
  cardHeight = '9rem',
  className = '',
  animate = true,
}: {
  cards?: number;
  columns?: number;
  cardHeight?: string | number;
  className?: string;
  animate?: boolean;
}) => {
  return (
    <div className={cn(`grid grid-cols-1 md:grid-cols-${columns} gap-6`, className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <Skeleton
          key={i}
          variant="card"
          height={cardHeight}
          animate={animate}
        />
      ))}
    </div>
  );
}); 