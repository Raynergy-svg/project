import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = '' }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white ${className}`}>
      <div className="flex flex-col min-h-screen">
        {/* Main content area with conditional padding based on page type */}
        <main 
          className={`flex-grow w-full ${
            isAuthPage 
              ? 'pt-0' // No padding for auth pages
              : isLandingPage
              ? 'pt-0' // No padding for landing page
              : 'pt-16 px-4 md:px-6 lg:px-8' // Default padding for other pages
          }`}
        >
          {/* Wrapper for content with responsive width constraints */}
          <div 
            className={`w-full h-full ${
              isAuthPage 
                ? 'max-w-6xl mx-auto' // Constrain width for auth pages
                : ''
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 