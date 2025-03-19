'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Client-side error boundary specifically for careers page
 */
export class CareersErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('CareersFallback error boundary caught:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Additional error logging
    console.error('CareersFallback error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <CareersFallback />;
    }

    return this.props.children;
  }
}

/**
 * CareersFallback Component
 * 
 * This component serves as an emergency fallback when the main careers page fails to load
 * It's designed to be extremely simple to avoid any webpack or React errors
 */
export default function CareersFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Join Our Team
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            We're looking for passionate people to join us on our mission.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hardcoded job listings for fallback */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Frontend Developer
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Remote • Full-time
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p className="text-gray-700">
                  We're looking for a frontend developer to help us build amazing user experiences.
                </p>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link href="/careers/frontend-developer">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Backend Engineer
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Remote • Full-time
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p className="text-gray-700">
                  We're looking for a backend engineer to help us build scalable services.
                </p>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link href="/careers/backend-engineer">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Why Join Us?
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Remote-First</h3>
              <p className="mt-2 text-base text-gray-500">
                Work from anywhere in the world.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Competitive Pay</h3>
              <p className="mt-2 text-base text-gray-500">
                We offer salaries above industry average.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Growth</h3>
              <p className="mt-2 text-base text-gray-500">
                Opportunities to learn and advance your career.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
