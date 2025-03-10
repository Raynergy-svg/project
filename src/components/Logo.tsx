'use client';

import Link from 'next/link';
import { memo, useEffect } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLink?: boolean;
  linkClassName?: string;
}

const LogoContent = memo(({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: '24px',
    md: '28px',
    lg: '32px'
  };

  return (
    <div className="flex items-center">
      <div style={{ height: sizeClasses[size], width: sizeClasses[size] }} className="relative flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Simple circle */}
          <circle cx="12" cy="12" r="10" fill="#1DB954" />
          
          {/* Properly oriented S */}
          <path 
            d="M15 9.5C15 8.11929 13.8807 7 12.5 7H11.5C10.1193 7 9 8.11929 9 9.5C9 10.8807 10.1193 12 11.5 12H12.5C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17H11.5C10.1193 17 9 15.8807 9 14.5" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span 
          className="font-bold text-xl whitespace-nowrap text-[#1DB954] ml-2"
        >
          Smart Debt Flow
        </span>
      )}
    </div>
  );
});

LogoContent.displayName = 'LogoContent';

export function Logo({ className = '', showText = true, size = 'md', isLink = true, linkClassName = '' }: LogoProps) {
  // Development warning for potential nesting issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isLink) {
      const parentIsLink = document.querySelector('a > [data-logo-component="true"]');
      if (parentIsLink) {
        console.warn('Warning: Logo component with isLink=true is nested inside another <a> tag. This can cause hydration errors. Set isLink={false} when using Logo inside another link.');
      }
    }
  }, [isLink]);

  // Always return just the content when nested in a Link/anchor to avoid nesting issues
  if (typeof window !== 'undefined' && window.__NEXT_DATA__?.props?.pageProps?.__isPrerendering) {
    // This is a workaround for SSR
    return <LogoContent showText={showText} size={size} />;
  }

  if (isLink) {
    return (
      <Link 
        href="/" 
        className={`inline-flex items-center hover:opacity-90 transition-opacity ${className} ${linkClassName}`}
      >
        <LogoContent showText={showText} size={size} />
      </Link>
    );
  }

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      data-logo-component="true"
    >
      <LogoContent showText={showText} size={size} />
    </div>
  );
}