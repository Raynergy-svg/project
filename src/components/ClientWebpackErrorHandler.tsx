'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WebpackErrorHandler with ssr: false
const WebpackErrorHandler = dynamic(
  () => import('./WebpackErrorHandler'),
  { ssr: false }
);

interface ClientWebpackErrorHandlerProps {
  children: ReactNode;
}

/**
 * Client-side wrapper component for WebpackErrorHandler
 * This is necessary because Next.js doesn't allow dynamic imports with ssr: false in Server Components
 */
export default function ClientWebpackErrorHandler({ children }: ClientWebpackErrorHandlerProps) {
  const [isClient, setIsClient] = useState(false);

  // This effect will run only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On the server or during initial hydration, just render children
  if (!isClient) {
    return <>{children}</>;
  }

  // Once on the client, render with the error handler
  return <WebpackErrorHandler>{children}</WebpackErrorHandler>;
} 