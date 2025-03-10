import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <Layout 
      title="Terms of Service - Smart Debt Flow" 
      description="Read our terms of service to understand the agreement between you and Smart Debt Flow."
    >
      <Head>
        <meta property="og:title" content="Terms of Service - Smart Debt Flow" />
        <meta
          property="og:description"
          content="Read the terms and conditions that govern your use of Smart Debt Flow services."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/terms" />
      </Head>

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
            Smart Debt Flow provides a platform for users to manage their personal financial information, particularly focusing on debt management, through various tools and features ("Service"). The Service may include, but is not limited to, debt tracking, payment planning, financial analysis, and educational resources.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue the Service (or any part or content thereof) at any time with or without notice, and we will not be liable to you or to any third party for any such modification, suspension, or discontinuance.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            In order to use certain features of the Service, you must register for an account with us and provide certain information as prompted by the account registration form. You represent and warrant that:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>All required registration information you submit is truthful and accurate;</li>
            <li>You will maintain the accuracy of such information;</li>
            <li>You are at least 18 years of age or have the legal capacity to enter into this agreement;</li>
            <li>Your use of the Service does not violate any applicable law or regulation.</li>
          </ul>
          <p>
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Privacy Policy</h2>
          <p>
            We care about data privacy and security. Please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Service, you agree to be bound by our Privacy Policy, which is incorporated into these Terms. You further acknowledge and agree that we may collect, use, and disclose your personal information as described in our Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Financial Information</h2>
          <p>
            Smart Debt Flow is not a financial institution, and we do not provide financial, legal, or tax advice. The information and services provided by Smart Debt Flow are for informational and educational purposes only.
          </p>
          <p>
            You acknowledge that:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>Any financial information displayed on the Site is for illustrative purposes only;</li>
            <li>The Service is not intended to provide financial, investment, or tax advice;</li>
            <li>You should consult with a qualified professional before making financial decisions;</li>
            <li>Smart Debt Flow is not responsible for any financial decisions you make based on information from our Service.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. User Content</h2>
          <p>
            When you create, post, submit, or share content on or through our Service, you grant us a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, store, display, reproduce, modify, and distribute your content for the purpose of operating and improving our Service.
          </p>
          <p>
            You are solely responsible for your content and the consequences of sharing it. We reserve the right to remove any content that violates these Terms or that we determine is inappropriate.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Prohibited Activities</h2>
          <p>
            You agree not to use the Service for any purpose that is unlawful or prohibited by these Terms. Prohibited activities include, but are not limited to:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law;</li>
            <li>Attempting to bypass any security measures of the Service;</li>
            <li>Introducing viruses, trojans, worms, logic bombs, or other materials that are malicious or harmful;</li>
            <li>Impersonating or attempting to impersonate Smart Debt Flow, an employee, another user, or any other person;</li>
            <li>Engaging in any automated use of the system, such as using scripts to send comments or messages;</li>
            <li>Interfering with, disrupting, or creating an undue burden on the Service or the networks connected to the Service.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Intellectual Property Rights</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Smart Debt Flow and are protected by copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Smart Debt Flow.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion, subject to our data retention policies.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
          <p>
            In no event shall Smart Debt Flow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use or alteration of your transmissions or content.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Disclaimer</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Smart Debt Flow does not warrant that the Service will be uninterrupted, timely, secure, or error-free. We do not warrant that the results that may be obtained from the use of the Service will be accurate or reliable.
          </p>
          <p>
            You understand that Smart Debt Flow does not provide professional financial advice and is not a substitute for professional financial advisors, accountants, or legal counsel.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page and updating the "last updated" date at the top of this page.
          </p>
          <p>
            Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. If you do not agree to the new Terms, you are no longer authorized to use the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> legal@smartdebtflow.com
          </p>
          <p>
            <strong>Mailing Address:</strong><br />
            Smart Debt Flow<br />
            123 Financial Street<br />
            Suite 456<br />
            San Francisco, CA 94103<br />
            United States
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" passHref>
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    // Revalidate once per day
    revalidate: 86400,
  };
} 