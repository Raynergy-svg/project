'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing Terms page in the Pages Router
    // Make sure the path is a string
    const path = '/Terms';
    router.push(path);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
} 