import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load transaction data',
  onRetry,
  className,
}) => {
  return (
    <Card className={cn("rounded-xl bg-gray-900/50 border border-red-300/20 backdrop-blur-sm shadow-sm p-6", className)}>
      <div className="flex flex-col items-center justify-center py-8 text-center" aria-live="assertive">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" aria-hidden="true" />
        <p className="text-white mb-4">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline"
            className="bg-white/5 text-white hover:bg-white/10 border-white/20"
          >
            Retry
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorState; 