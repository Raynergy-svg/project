'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * CareersFallback - A dedicated fallback component for the careers page
 * 
 * This component provides a graceful error experience when the careers page 
 * chunk fails to load, with options to retry or contact us directly.
 */
export function CareersFallback() {
  // Handle retry
  const handleRetry = () => {
    // Force a refresh of the page
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] w-full max-w-4xl mx-auto flex items-center justify-center p-6">
      <div className="w-full max-w-2xl p-8 rounded-lg bg-muted/30 shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
        
        <div className="mb-8">
          <p className="text-xl mb-4">
            We're experiencing a technical issue loading our careers page.
          </p>
          <p className="text-muted-foreground mb-4">
            We're always looking for talented individuals passionate about financial technology and helping others achieve financial freedom.
          </p>
          <p className="text-muted-foreground mb-4">
            If you're interested in joining our team, please try refreshing the page or reach out to us directly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button 
            onClick={handleRetry} 
            variant="default" 
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            className="w-full gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="secondary" 
            className="w-full gap-2 sm:col-span-2"
          >
            <Link href="mailto:careers@example.com">
              <Mail className="h-4 w-4" />
              <span>Email Us</span>
            </Link>
          </Button>
          
          <div className="sm:col-span-2 mt-4 text-sm text-muted-foreground">
            <p>
              You can also check our <Link href="https://www.linkedin.com/company/example" className="text-primary underline hover:text-primary/80 inline-flex items-center">
                LinkedIn page <ExternalLink className="h-3 w-3 ml-1" />
              </Link> for current openings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareersFallback;
