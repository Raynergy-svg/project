import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

// This file is kept for backward compatibility but redirects to the App Router access-denied page

/**
 * @deprecated This page is deprecated in favor of the App Router's access-denied page
 */
const AccessDenied = () => {
  const router = useRouter();
  const { message, from } = router.query;

  useEffect(() => {
    // Build the redirect URL with the query parameters
    let redirectUrl = '/access-denied';
    const params = new URLSearchParams();
    
    if (typeof message === 'string') {
      params.append('message', message);
    }
    
    if (typeof from === 'string') {
      params.append('from', from);
    }
    
    // Add parameters if there are any
    if (params.toString()) {
      redirectUrl += '?' + params.toString();
    }
    
    // Redirect to the App Router access-denied page
    router.replace(redirectUrl);
  }, [router, message, from]);

  // Return an empty div as this will never be seen
  return <div />;
};

export default AccessDenied; 