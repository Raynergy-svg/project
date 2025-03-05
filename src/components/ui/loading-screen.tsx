import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...",
  fullScreen = true
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center w-full h-full min-h-[200px]";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground/80">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 