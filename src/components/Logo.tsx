'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { createPreloadLink } from '@/utils/preloadFix';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLink?: boolean;
  href?: string;
}

// Utility function to scroll to top with smooth animation
const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

// Logo content component to avoid duplication
function LogoContent({ className = '', showText = true, size = 'lg' }: Omit<LogoProps, 'isLink' | 'href'>) {
  // Define size classes - increased sizes across the board
  const sizeClasses = {
    xs: 'h-8 w-8',
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
    xl: 'h-16 w-16'
  };

  return (
    <>
      <div className={`logo-image ${sizeClasses[size]}`}>
        <img 
          src="/favicon-192.png" 
          alt="Smart Debt Flow Logo" 
          width={64} 
          height={64} 
          className="w-full h-full"
        />
      </div>
      {showText && (
        <div className="logo-text ml-2">
          <span className="text-primary font-bold text-xl md:text-2xl">Smart Debt Flow</span>
        </div>
      )}
    </>
  );
}

LogoContent.displayName = 'LogoContent';

export function Logo({ className = '', showText = true, size = 'lg', isLink = true, href = '/' }: LogoProps) {
  // Fix preload warning for logo image
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if there's a preload link for favicon without the 'as' attribute
    const preloadLinks = document.querySelectorAll('link[rel="preload"][href*="favicon-192.png"]');
    preloadLinks.forEach(link => {
      if (!link.hasAttribute('as')) {
        link.setAttribute('as', 'image');
      }
    });
  }, []);

  if (isLink) {
    return (
      <>
        <Head>
          {/* Properly preload the logo with correct 'as' attribute */}
          <link 
            rel="preload"
            href="/favicon-192.png"
            as="image"
            type="image/png"
          />
        </Head>
        <Link 
          href={href} 
          className={`flex items-center hover:opacity-90 transition-opacity -ml-3 ${className} cursor-pointer`}
          style={{ 
            contain: 'none',
            gap: '4px'
          }}
          onClick={(e) => {
            // If we're already on the homepage and href is '/', 
            // prevent default and just scroll to top
            if (href === '/' && window.location.pathname === '/') {
              e.preventDefault();
              scrollToTop();
            } else {
              // If navigating to another page, let the Link handle it normally
              // The page will load at the top anyway
            }
          }}
        >
          <LogoContent showText={showText} size={size} />
        </Link>
      </>
    );
  }

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/favicon-192.png"
          as="image"
          type="image/png"
        />
      </Head>
      <div 
        className={`flex items-center -ml-3 ${className} cursor-pointer`}
        style={{ 
          contain: 'none',
          gap: '4px'
        }}
        onClick={scrollToTop}
        role="button"
        tabIndex={0}
        aria-label="Scroll to top"
        onKeyDown={(e) => {
          // Also trigger on Enter or Space key for accessibility
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
          }
        }}
      >
        <LogoContent showText={showText} size={size} />
      </div>
    </>
  );
}

export default Logo;