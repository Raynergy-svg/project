import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Metadata for the page (replaces Head in Pages Router)
export const metadata: Metadata = {
  title: 'Terms of Service - Smart Debt Flow',
  description: 'Read our terms of service to understand the agreement between you and Smart Debt Flow.',
  openGraph: {
    title: 'Terms of Service - Smart Debt Flow',
    description: 'Read the terms and conditions that govern your use of Smart Debt Flow services.',
    type: 'website',
    url: 'https://smartdebtflow.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-6">Last updated: June 1, 2023</p>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
        <p>
          These Terms of Service ("Terms") constitute a legally binding agreement made between you and Smart Debt Flow ("we", "us", or "our") concerning your access to and use of the smartdebtflow.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
        </p>
        <p>
          You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms. If you do not agree with all of these Terms, then you are expressly prohibited from using the Site and you must discontinue use immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Service Description</h2>
        <p>
          Smart Debt Flow provides tools and resources to help users manage and pay off their debts more effectively. Our services include debt tracking, payment planning, financial education, and other related features designed to improve financial well-being.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
        </p>
        <p>
          The Content and Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Representations</h2>
        <p>
          By using the Site, you represent and warrant that: (1) you have the legal capacity to agree to these Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Site through automated or non-human means; (4) you will not use the Site for any illegal or unauthorized purpose; and (5) your use of the Site will not violate any applicable law or regulation.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Activities</h2>
        <p>
          You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>
        <ul className="list-disc pl-8 my-4 space-y-2">
          <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law;</li>
          <li>Attempting to bypass any security measures of the Service;</li>
          <li>Introducing viruses, trojans, worms, logic bombs, or other materials that are malicious or harmful;</li>
          <li>Impersonating or attempting to impersonate Smart Debt Flow, an employee, another user, or any other person;</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Privacy Policy</h2>
        <p>
          We care about data privacy and security. Please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Site, you agree to be bound by our Privacy Policy, which is incorporated into these Terms. If you have any questions or concerns, please contact us.
        </p>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" passHref>
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
