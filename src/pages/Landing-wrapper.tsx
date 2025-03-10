import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration errors
// This ensures the component only renders on the client side
const Landing = dynamic(() => import('./Landing'), { ssr: false });

// This is a simple wrapper that ensures the Landing component
// gets rendered with the right context from our adapter
export default function LandingWrapper() {
  return <Landing />;
} 