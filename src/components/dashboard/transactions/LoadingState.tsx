import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading transaction data...',
  className,
}) => {
  return (
    <Card className={cn("rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm p-6", className)}>
      <div className="flex flex-col items-center justify-center py-12" aria-live="polite" aria-busy="true">
        <div className="animate-spin mb-4" role="status">
          <RefreshCw className="w-8 h-8 text-[#88B04B]/70" />
          <span className="sr-only">Loading...</span>
        </div>
        <p className="text-white/70">{message}</p>
      </div>
    </Card>
  );
};

export default LoadingState; 