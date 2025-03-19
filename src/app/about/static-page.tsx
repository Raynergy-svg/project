'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Static version of the About page that doesn't use framer motion or complex imports
 * This will be used as a fallback when the main about page fails to load
 */
export default function StaticAboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background pt-24 pb-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary">
              About Smart Debt Flow
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to help everyone achieve financial freedom
              through smart technology and simple solutions.
            </p>
            <Button size="lg" className="rounded-full text-lg px-8">
              Join Our Mission <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value Cards */}
            <div className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">User-Centered</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We put you first. Our tools are designed to solve real money problems that people face every day.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">For Everyone</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We believe everyone deserves financial freedom, no matter your income or debt level.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Time-Saving</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our app does the hard work for you, saving you hours of figuring out payment plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate
            about helping others achieve financial freedom.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full text-lg px-8"
          >
            View Open Positions <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>
    </div>
  );
}
