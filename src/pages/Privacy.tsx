import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <Layout 
      title="Privacy Policy - Smart Debt Flow" 
      description="Learn about how Smart Debt Flow collects, uses, and protects your personal information."
    >
      <Head>
        <meta property="og:title" content="Privacy Policy - Smart Debt Flow" />
        <meta
          property="og:description"
          content="Learn about our privacy practices and how we protect your personal information."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/privacy" />
      </Head>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: June 1, 2023</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="lead">
            Smart Debt Flow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, information we collect automatically, and information from third parties. This may include:
          </p>
          <h3 className="text-xl font-medium mt-6 mb-3">Personal Information</h3>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>Contact information (name, email address, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Financial information (account numbers, balances, transaction history)</li>
            <li>Profile information (financial goals, debt details)</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Automatically Collected Information</h3>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, time spent on site, interactions)</li>
            <li>Location information (approximate location based on IP address)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li>Providing, maintaining, and improving our services</li>
            <li>Processing and completing transactions</li>
            <li>Sending you technical notices, updates, security alerts, and support messages</li>
            <li>Responding to your comments, questions, and requests</li>
            <li>Developing new products and services</li>
            <li>Personalizing your experience</li>
            <li>Monitoring and analyzing trends, usage, and activities</li>
            <li>Detecting, preventing, and addressing fraud and security issues</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing Your Information</h2>
          <p>
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who perform services on our behalf.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if we believe it is necessary to comply with a legal obligation, protect and defend our rights or property, prevent fraud, or protect the safety of our users.</li>
            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, financing, or sale of assets, your information may be transferred as part of that transaction.</li>
            <li><strong>With Your Consent:</strong> We may share your information with third parties when we have your consent to do so.</li>
          </ul>
          <p>
            We do not sell your personal information to third parties for marketing purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no security system is impenetrable, and we cannot guarantee the absolute security of our systems.
          </p>
          <p>
            We use industry-standard encryption, secure server facilities, and other safeguards to protect your information. We regularly review our security procedures to ensure they meet current best practices.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights and Choices</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li><strong>Access:</strong> You can request access to the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> You can request that we delete your personal information.</li>
            <li><strong>Restriction:</strong> You can request that we restrict the processing of your data.</li>
            <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, commonly used, and machine-readable format.</li>
            <li><strong>Objection:</strong> You can object to our processing of your personal information.</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
          </p>
          <p>
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-8 my-4 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the operation of our service.</li>
            <li><strong>Preference Cookies:</strong> Allow us to remember your preferences and settings.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
            <li><strong>Marketing Cookies:</strong> Used to track visitors across websites to display relevant advertisements.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
          <p>
            Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we learn we have collected personal information from a child under 18, we will delete that information as quickly as possible.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. International Data Transfers</h2>
          <p>
            Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
          </p>
          <p>
            If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> privacy@smartdebtflow.com
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