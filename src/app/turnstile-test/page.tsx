import React from 'react';
import TurnstileTest from '@/components/auth/TurnstileTest';

export const metadata = {
  title: 'Turnstile Test | Smart Debt Flow',
  description: 'Test page for Cloudflare Turnstile implementation'
};

export default function TurnstileTestPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Turnstile Test
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Testing our Cloudflare Turnstile implementation with preload fix
          </p>
        </div>
        
        <TurnstileTest />
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
} 