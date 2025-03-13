import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  compact?: boolean;
  interactive?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

/**
 * A responsive card component that adapts well to different screen sizes.
 * This component extends the base Card component with additional responsive features.
 */
export function ResponsiveCard({
  title,
  description,
  footer,
  children,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  compact = false,
  interactive = false,
  hoverable = false,
  bordered = true,
  elevated = false,
  ...props
}: ResponsiveCardProps) {
  return (
    <Card
      className={cn(
        bordered ? 'border' : 'border-0',
        elevated && 'shadow-md',
        hoverable && 'transition-all duration-200 hover:shadow-lg',
        interactive && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <CardHeader className={cn(
          compact ? 'p-4 md:p-5' : 'p-5 md:p-6',
          headerClassName
        )}>
          {title && (
            typeof title === 'string' ? (
              <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
            ) : (
              title
            )
          )}
          {description && (
            typeof description === 'string' ? (
              <CardDescription className="text-sm md:text-base">{description}</CardDescription>
            ) : (
              description
            )
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        compact ? 'p-4 md:p-5' : 'p-5 md:p-6',
        (title || description) && 'pt-0',
        contentClassName
      )}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn(
          compact ? 'p-4 md:p-5' : 'p-5 md:p-6',
          'flex flex-wrap gap-2',
          footerClassName
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * A responsive card grid component that displays cards in a responsive grid layout.
 */
export function ResponsiveCardGrid({
  children,
  className,
  columns = 3,
  gap = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'small' | 'default' | 'large';
}) {
  const getGapClass = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'small':
        return 'gap-2 md:gap-3';
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
 * A responsive feature card component for highlighting features or benefits.
 */
export function FeatureCard({
  icon,
  title,
  description,
  className,
  ...props
}: ResponsiveCardProps & {
  icon?: React.ReactNode;
}) {
  return (
    <ResponsiveCard
      className={cn('h-full', className)}
      {...props}
    >
      <div className="flex flex-col h-full">
        {icon && (
          <div className="mb-4 text-primary">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        {props.children && (
          <div className="mt-4">
            {props.children}
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
}

export default ResponsiveCard; 