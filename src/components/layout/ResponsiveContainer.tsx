import React from 'react';
import { cn } from '@/utils/cn';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  fluid?: boolean;
  narrow?: boolean;
  wide?: boolean;
  noPadding?: boolean;
}

/**
 * A responsive container component that provides consistent spacing and width constraints
 * across different screen sizes. This component follows mobile-first design principles.
 * 
 * @param children - The content to be rendered inside the container
 * @param className - Additional CSS classes to apply to the container
 * @param as - The HTML element to render the container as (default: div)
 * @param fluid - Whether the container should take up the full width of the viewport
 * @param narrow - Whether the container should have a narrower max-width
 * @param wide - Whether the container should have a wider max-width
 * @param noPadding - Whether the container should have no horizontal padding
 */
export function ResponsiveContainer({
  children,
  className,
  as: Component = 'div',
  fluid = false,
  narrow = false,
  wide = false,
  noPadding = false,
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(
        'w-full mx-auto',
        !noPadding && 'px-4 sm:px-6 md:px-8',
        !fluid && 'max-w-7xl',
        narrow && 'max-w-3xl',
        wide && 'max-w-screen-2xl',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * A responsive section component that provides consistent vertical spacing
 * for page sections across different screen sizes.
 */
export function ResponsiveSection({
  children,
  className,
  as = 'section',
  ...props
}: ResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      as={as}
      className={cn('py-8 md:py-12 lg:py-16', className)}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A responsive grid component that provides a consistent grid layout
 * that adapts to different screen sizes.
 */
export function ResponsiveGrid({
  children,
  className,
  columns = 3,
  gap = 'default',
  ...props
}: ResponsiveContainerProps & {
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'none' | 'small' | 'default' | 'large';
}) {
  const getGapClass = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'small':
        return 'gap-2 md:gap-4';
      case 'large':
        return 'gap-6 md:gap-8';
      default:
        return 'gap-4 md:gap-6';
    }
  };

  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div
      className={cn(
        'grid',
        getColumnsClass(),
        getGapClass(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A responsive flex component that provides a consistent flex layout
 * that adapts to different screen sizes.
 */
export function ResponsiveFlex({
  children,
  className,
  direction = 'row',
  wrap = true,
  gap = 'default',
  ...props
}: ResponsiveContainerProps & {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | 'responsive';
  wrap?: boolean;
  gap?: 'none' | 'small' | 'default' | 'large';
}) {
  const getDirectionClass = () => {
    switch (direction) {
      case 'row':
        return 'flex-row';
      case 'column':
        return 'flex-col';
      case 'row-reverse':
        return 'flex-row-reverse';
      case 'column-reverse':
        return 'flex-col-reverse';
      case 'responsive':
        return 'flex-col md:flex-row';
      default:
        return 'flex-row';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'small':
        return 'gap-2 md:gap-4';
      case 'large':
        return 'gap-6 md:gap-8';
      default:
        return 'gap-4 md:gap-6';
    }
  };

  return (
    <div
      className={cn(
        'flex',
        getDirectionClass(),
        wrap && 'flex-wrap',
        getGapClass(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default ResponsiveContainer; 