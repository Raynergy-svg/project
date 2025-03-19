import { Metadata } from 'next';
import { Shield, Lock, CheckCircle, Server, Eye, AlertCircle } from 'lucide-react';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Security - Smart Debt Flow',
  description: 'Learn about the security measures we take to protect your data at Smart Debt Flow.',
  openGraph: {
    title: 'Security Policy - Smart Debt Flow',
    description: 'Smart Debt Flow implements bank-level security measures to keep your data safe and secure.',
    type: 'website',
    url: 'https://smartdebtflow.com/security',
  },
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Security at Smart Debt Flow</h1>
        
        <div className="mb-10">
          <p className="text-lg mb-4">
            At Smart Debt Flow, protecting your financial data and personal information 
            is our highest priority. We implement bank-level security measures and 
            industry best practices to ensure your information remains secure.
          </p>
          
          <div className="flex items-center space-x-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Your security is our top priority</span>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Data Encryption</h2>
            </div>
            <p>
              We use 256-bit encryption to protect all data transmissions between your 
              browser and our servers. This is the same level of encryption used by 
              leading banks and financial institutions.
            </p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Secure Authentication</h2>
            </div>
            <p>
              Our platform employs multi-factor authentication, secure password policies, 
              and automatic session timeouts to prevent unauthorized access to your account.
            </p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Server className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Infrastructure Security</h2>
            </div>
            <p>
              We host our application on secure cloud infrastructure with regular security 
              updates, intrusion detection, and 24/7 monitoring to protect against threats.
            </p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Privacy Protection</h2>
            </div>
            <p>
              We never sell your personal information to third parties. Our strict privacy 
              controls ensure that your data is only used for the services you've explicitly 
              requested.
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Your Financial Data</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">How We Access Your Financial Information</h3>
          <p className="mb-4">
            When you connect your financial accounts, we use secure, read-only access 
            through trusted financial data providers. This means:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We never store your banking credentials on our servers</li>
            <li>We can only view your transaction data, not modify or transfer funds</li>
            <li>All connections are encrypted end-to-end</li>
            <li>You can revoke access at any time</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Compliance and Certifications</h3>
          <p className="mb-4">
            Smart Debt Flow adheres to the highest standards of data security and privacy:
          </p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <div className="border rounded p-4 text-center">
              <p className="font-medium">SOC 2 Type II</p>
              <p className="text-sm text-muted-foreground">Certified</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="font-medium">GDPR</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="font-medium">CCPA</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="font-medium">PCI DSS</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="font-medium">ISO 27001</p>
              <p className="text-sm text-muted-foreground">Certified</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="font-medium">HIPAA</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-amber-800 mb-2">Security Best Practices</h3>
              <p className="text-amber-700 mb-3">
                While we take extensive measures to protect your data, we recommend these 
                additional steps to enhance your security:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-amber-700">
                <li>Use a unique, strong password for your Smart Debt Flow account</li>
                <li>Enable multi-factor authentication in your account settings</li>
                <li>Regularly check your account for any suspicious activity</li>
                <li>Keep your devices and browsers updated with the latest security patches</li>
                <li>Be cautious of phishing attempts - we will never ask for your password via email</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Contact Our Security Team</h2>
          <p className="mb-4">
            If you have questions about our security practices or need to report a 
            security concern, please contact our dedicated security team:
          </p>
          <a 
            href="mailto:security@smartdebtflow.com" 
            className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            security@smartdebtflow.com
          </a>
        </div>
      </div>
    </div>
  );
}
