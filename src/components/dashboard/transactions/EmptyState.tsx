import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="text-gray-400 mb-3">{icon}</div>
      <p className="text-white/70 mb-4">{message}</p>
      {actionText && onAction && (
        <Button 
          variant="outline" 
          onClick={onAction}
          className="bg-white/5 text-white hover:bg-white/10 border-white/20"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState; 