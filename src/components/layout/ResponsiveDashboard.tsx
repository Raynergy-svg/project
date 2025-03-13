import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ResponsiveDashboardProps {
  children: ReactNode;
  className?: string;
}

interface ResponsiveDashboardSidebarProps {
  children: ReactNode;
  className?: string;
  collapsed?: boolean;
  width?: 'narrow' | 'default' | 'wide';
}

interface ResponsiveDashboardMainProps {
  children: ReactNode;
  className?: string;
}

interface ResponsiveDashboardHeaderProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

interface ResponsiveDashboardSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  fullWidth?: boolean;
}

interface ResponsiveDashboardGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'small' | 'default' | 'large';
}

/**
 * A responsive dashboard layout component that adapts to different screen sizes.
 * This component provides a flexible layout for dashboard pages with sidebar and main content areas.
 */
export function ResponsiveDashboard({ children, className }: ResponsiveDashboardProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row min-h-screen', className)}>
      {children}
    </div>
  );
}

/**
 * The sidebar component for the responsive dashboard layout.
 */
export function ResponsiveDashboardSidebar({ 
  children, 
  className,
  collapsed = false,
  width = 'default'
}: ResponsiveDashboardSidebarProps) {
  const widthClasses = {
    narrow: 'w-full lg:w-56',
    default: 'w-full lg:w-64',
    wide: 'w-full lg:w-80'
  };

  return (
    <aside 
      className={cn(
        'border-r border-border bg-card',
        collapsed ? 'lg:w-16' : widthClasses[width],
        'transition-all duration-300 ease-in-out',
        'overflow-y-auto',
        className
      )}
    >
      <div className="sticky top-0">
        {children}
      </div>
    </aside>
  );
}

/**
 * The main content area for the responsive dashboard layout.
 */
export function ResponsiveDashboardMain({ children, className }: ResponsiveDashboardMainProps) {
  return (
    <main className={cn('flex-1 overflow-x-hidden', className)}>
      {children}
    </main>
  );
}

/**
 * The header component for the responsive dashboard layout.
 */
export function ResponsiveDashboardHeader({ 
  children, 
  className,
  sticky = true
}: ResponsiveDashboardHeaderProps) {
  return (
    <header 
      className={cn(
        'border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'py-3 px-4 sm:px-6',
        sticky && 'sticky top-0 z-10',
        className
      )}
    >
      {children}
    </header>
  );
}

/**
 * A section component for the responsive dashboard layout.
 */
export function ResponsiveDashboardSection({ 
  children, 
  className,
  title,
  description,
  fullWidth = false
}: ResponsiveDashboardSectionProps) {
  return (
    <section className={cn('py-4 sm:py-6', className)}>
      <div className={cn(
        !fullWidth && 'container px-4 sm:px-6 mx-auto'
      )}>
        {(title || description) && (
          <div className="mb-4 sm:mb-6">
            {title && <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">{title}</h2>}
            {description && <p className="text-sm sm:text-base text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * A responsive grid component for dashboard content.
 */
export function ResponsiveDashboardGrid({ 
  children, 
  className,
  columns = 3,
  gap = 'default'
}: ResponsiveDashboardGridProps) {
  const getGapClass = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'small':
        return 'gap-2 sm:gap-3';
      case 'large':
        return 'gap-6 sm:gap-8';
      default:
        return 'gap-4 sm:gap-6';
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
    >
      {children}
    </div>
  );
}

/**
 * A responsive stats grid component for dashboard metrics.
 */
export function ResponsiveDashboardStats({ 
  children, 
  className,
  columns = 4
}: Omit<ResponsiveDashboardGridProps, 'gap'>) {
  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 xs:grid-cols-2 md:grid-cols-4';
    }
  };

  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        getColumnsClass(),
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A responsive layout for dashboard content with sidebar and main sections.
 */
export function ResponsiveDashboardLayout({ 
  children, 
  sidebar,
  sidebarCollapsed = false,
  sidebarWidth = 'default',
  className
}: {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarWidth?: 'narrow' | 'default' | 'wide';
  className?: string;
}) {
  return (
    <ResponsiveDashboard className={className}>
      <ResponsiveDashboardSidebar 
        collapsed={sidebarCollapsed}
        width={sidebarWidth}
      >
        {sidebar}
      </ResponsiveDashboardSidebar>
      <ResponsiveDashboardMain>
        {children}
      </ResponsiveDashboardMain>
    </ResponsiveDashboard>
  );
}

export default ResponsiveDashboard; 