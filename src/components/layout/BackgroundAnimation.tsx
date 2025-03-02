import React from 'react';

interface BackgroundAnimationProps {
  className?: string;
}

export function BackgroundAnimation({ className = '' }: BackgroundAnimationProps) {
  return (
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Simple dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
      
      {/* Subtle dot pattern with reduced opacity */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="h-full w-full"
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} 
        />
      </div>
      
      {/* Static subtle glow effect - no animation */}
      <div
        className="absolute top-20 -left-20 w-96 h-96 bg-[#88B04B]/5 rounded-full blur-[100px]"
      />
      
      {/* Very subtle vignette effect to darken edges */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
    </div>
  );
} 