import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Metadata for the page (replaces Head in Pages Router)
export const metadata: Metadata = {
  title: 'Privacy Policy - Smart Debt Flow',
  description: 'Learn about how Smart Debt Flow collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy - Smart Debt Flow',
    description: 'Learn about our privacy practices and how we protect your personal information.',
    type: 'website',
    url: 'https://smartdebtflow.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: June 1, 2023</p>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead">
          Smart Debt Flow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </p>
        <p>
          Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We may collect personal information that you voluntarily provide to us when you register on the website, express interest in obtaining information about us or our products and services, participate in activities on the website, or otherwise contact us.
        </p>
        <p>
          The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include:
        </p>
        <ul className="list-disc pl-8 my-4 space-y-2">
          <li>Names</li>
          <li>Email addresses</li>
          <li>Usernames</li>
          <li>Passwords</li>
          <li>Financial information</li>
          <li>Contact information</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.
        </p>
        <p>
          We use the information we collect or receive:
        </p>
        <ul className="list-disc pl-8 my-4 space-y-2">
          <li>To facilitate account creation and login process</li>
          <li>To provide and maintain our Service</li>
          <li>To respond to your inquiries and solve potential issues</li>
          <li>To send administrative information to you</li>
          <li>To send you marketing and promotional communications</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclosure of Your Information</h2>
        <p>
          We may share information in specific situations described below:
        </p>
        <ul className="list-disc pl-8 my-4 space-y-2">
          <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition.</li>
          <li><strong>Third-Party Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors or agents who perform services for us.</li>
          <li><strong>Legal Obligations:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Privacy Rights</h2>
        <p>
          Depending on where you reside, you may have certain rights regarding your personal information, such as:
        </p>
        <ul className="list-disc pl-8 my-4 space-y-2">
          <li><strong>Access:</strong> You can request access to the personal information we hold about you.</li>
          <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
          <li><strong>Deletion:</strong> You can request that we delete your personal information.</li>
          <li><strong>Restriction:</strong> You can request that we restrict the processing of your data.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> privacy@smartdebtflow.com<br />
          <strong>Address:</strong> 123 Financial Way, Suite 500, San Francisco, CA 94105<br />
          <strong>Phone:</strong> (555) 123-4567
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
