import { useEffect } from "react";
import { useRouter } from "next/router";

// This file is kept for backward compatibility but redirects to the App Router not-found page

/**
 * @deprecated This page is deprecated in favor of the App Router's not-found.tsx pattern
 */
export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to a URL that will trigger the App Router's not-found handling
    router.replace('/not-found-' + Math.random().toString(36).substring(7));
  }, [router]);

  // Return an empty div as this will never be seen
  return <div />;
}