import { ReactNode } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  const { breakpoint } = useBreakpoint();

  return (
    <div 
      className={`
        container 
        mx-auto 
        px-4 xs:px-6 sm:px-8 lg:px-12
        ${className}
      `}
      data-breakpoint={breakpoint}
    >
      {children}
    </div>
  );
}