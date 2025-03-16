"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";
import Footer from "@/components/layout/Footer";

export default function SimpleLandingClient() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-28 overflow-hidden bg-gradient-to-br from-background to-background/80">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Take Control of Your Debt
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10">
              Smart Debt Flow helps you manage your finances, create payment
              plans, and track your progress toward financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Smart Features for Your Financial Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-10 text-center max-w-3xl mx-auto">
            Our powerful tools help you visualize, plan, and accelerate your
            debt payoff.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4 w-fit">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Debt Tracking</h3>
              <p className="text-muted-foreground">
                Easily track all your debts in one place with automatic balance
                updates and progress tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4 w-fit">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Strategies</h3>
              <p className="text-muted-foreground">
                Choose from proven methods like Snowball and Avalanche or create
                a custom plan that works for you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4 w-fit">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistance</h3>
              <p className="text-muted-foreground">
                Get personalized recommendations and insights from our AI to
                optimize your debt payoff journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Debt?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of others who are using Smart Debt Flow to pay off
            debt faster and achieve financial peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started - It's Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Information */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
              <Shield size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your Data is Secure</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              We use bank-level 256-bit encryption to protect your information
              and never store your login credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
