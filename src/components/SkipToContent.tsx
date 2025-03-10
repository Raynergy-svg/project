import { useState, useEffect } from 'react';

/**
 * SkipToContent component provides a hidden link that becomes visible when focused,
 * allowing keyboard users to skip the navigation and go straight to main content.
 */
export default function SkipToContent() {
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-none focus:shadow-lg"
    >
      Skip to content
    </a>
  );
} 