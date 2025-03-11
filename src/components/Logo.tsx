import Link from 'next/link';
import { memo } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLink?: boolean;
}

const LogoContent = memo(({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  return (
    <>
      <div 
        className={`${sizeClasses[size]} flex items-center justify-center overflow-visible`}
        style={{ 
          contain: 'none',
          boxSizing: 'content-box',
          padding: '2px'
        }}
      >
        {/* Circle background */}
        <svg 
          viewBox="0 0 28 28" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            display: 'block'
          }}
        >
          {/* Simple circle with padding inside viewBox */}
          <circle cx="14" cy="14" r="11" fill="#1DB954" />

          {/* Skinnier S - adjusted for new viewBox center */}
          <path 
            d="M18 11C18 9.34315 16.6569 8 15 8H13C11.3431 8 10 9.34315 10 11C10 12.6569 11.3431 14 13 14H15C16.6569 14 18 15.3431 18 17C18 18.6569 16.6569 20 15 20H13C11.3431 20 10 18.6569 10 17" 
            stroke="white" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
      {showText && (
        <span 
          className="font-bold text-[#1DB954] font-['Poppins'] text-xl whitespace-nowrap"
          style={{ 
            contain: 'none',
            marginLeft: '4px'
          }}
        >
          Smart Debt Flow
        </span>
      )}
    </>
  );
});

LogoContent.displayName = 'LogoContent';

export function Logo({ className = '', showText = true, size = 'md', isLink = true }: LogoProps) {
  if (isLink) {
    return (
      <Link 
        href="/" 
        className={`flex items-center hover:opacity-90 transition-opacity ${className}`}
        style={{ 
          contain: 'none',
          gap: '8px'
        }}
      >
        <LogoContent showText={showText} size={size} />
      </Link>
    );
  }

  return (
    <div 
      className={`flex items-center ${className}`}
      style={{ 
        contain: 'none',
        gap: '8px'
      }}
    >
      <LogoContent showText={showText} size={size} />
    </div>
  );
}