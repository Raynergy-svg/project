import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * @deprecated This page is deprecated in favor of the App Router's not-found.tsx pattern
 */
const NotFound: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to a URL that will trigger the App Router's not-found handling
    router.replace('/not-found-' + Math.random().toString(36).substring(7));
  }, [router]);

  // Return an empty div as this will never be seen
  return <div />;
};

export default NotFound;