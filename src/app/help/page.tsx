import { Metadata } from 'next';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Help & Support - Smart Debt Flow',
  description: 'Get help and find answers to common questions about Smart Debt Flow.',
  openGraph: {
    title: 'Help & Support Center - Smart Debt Flow',
    description: 'Find answers, tips, and resources to help you get the most out of Smart Debt Flow.',
    type: 'website',
    url: 'https://smartdebtflow.com/help',
  },
};

export default function HelpPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Help & Support Center</h1>
        
        <p className="text-lg mb-8">Find answers to common questions or reach out to our support team.</p>
        
        <Tabs defaultValue="faq" className="mb-10">
          <TabsList className="mb-6">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I add a new account?</AccordionTrigger>
                    <AccordionContent>
                      To add a new account, navigate to your Dashboard and click on the "Add Account" button 
                      in the top right corner. Follow the instructions to connect your financial institution 
                      or manually enter your account details.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is my financial information secure?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we take security very seriously. We use bank-level encryption to protect your data, 
                      and we never store your banking credentials. All connections to financial institutions 
                      are handled through secure, trusted partners. You can learn more in our 
                      <Link href="/security" className="text-primary hover:underline ml-1">Security Policy</Link>.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What debt payoff methods do you support?</AccordionTrigger>
                    <AccordionContent>
                      We support multiple debt payoff strategies including the Debt Avalanche method (paying highest 
                      interest rate first) and the Debt Snowball method (paying smallest balance first). You can 
                      select your preferred method in your account settings, and our system will calculate 
                      the optimal payment plan based on your choice.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I update my payment information?</AccordionTrigger>
                    <AccordionContent>
                      You can update your payment information by going to "Account Settings" and selecting 
                      "Payment Methods." From there, you can add, edit, or remove payment methods as needed.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you can cancel your subscription at any time. Go to "Account Settings," select 
                      "Subscription," and click on "Cancel Subscription." Your account will remain active 
                      until the end of your current billing period.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>How do I export my financial data?</AccordionTrigger>
                    <AccordionContent>
                      To export your financial data, go to the Reports section on your Dashboard. 
                      You can generate reports in various formats (PDF, CSV, Excel) and download them 
                      for your records or tax purposes.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guides">
            <Card>
              <CardHeader>
                <CardTitle>Help Guides</CardTitle>
                <CardDescription>Step-by-step instructions for common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href="/help/guides/getting-started" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium mb-2">Getting Started Guide</h3>
                    <p className="text-sm text-muted-foreground">Learn how to set up your account and start your debt-free journey</p>
                  </Link>
                  
                  <Link href="/help/guides/connecting-accounts" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium mb-2">Connecting Financial Accounts</h3>
                    <p className="text-sm text-muted-foreground">How to securely link your bank and credit accounts</p>
                  </Link>
                  
                  <Link href="/help/guides/debt-strategies" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium mb-2">Debt Payoff Strategies</h3>
                    <p className="text-sm text-muted-foreground">Understanding different methods to eliminate debt efficiently</p>
                  </Link>
                  
                  <Link href="/help/guides/budgeting" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium mb-2">Creating a Budget</h3>
                    <p className="text-sm text-muted-foreground">Tips for effective budgeting to accelerate debt payoff</p>
                  </Link>
                  
                  <Link href="/help/guides/mobile-app" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium mb-2">Using the Mobile App</h3>
                    <p className="text-sm text-muted-foreground">Get the most from Smart Debt Flow on your mobile device</p>
                  </Link>
                  
                  <Link href="/help/guides/reports" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium mb-2">Reports and Analytics</h3>
                    <p className="text-sm text-muted-foreground">How to generate and interpret financial reports</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>We're here to help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Email Support</h3>
                    <p className="text-sm mb-3">Send us a message and we'll get back to you within 24 hours.</p>
                    <Link href="mailto:support@smartdebtflow.com" className="text-primary hover:underline">support@smartdebtflow.com</Link>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Live Chat</h3>
                    <p className="text-sm mb-3">Chat with our support team in real-time during business hours.</p>
                    <button className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      Start Chat
                    </button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Phone Support</h3>
                    <p className="text-sm mb-3">Call us Monday-Friday, 9am-5pm EST.</p>
                    <Link href="tel:+18005551234" className="text-primary hover:underline">(800) 555-1234</Link>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Community Forum</h3>
                    <p className="text-sm mb-3">Connect with other users and get advice from our community.</p>
                    <Link href="/community" className="text-primary hover:underline">Visit Forum</Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Common Topics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/help/topics/debt-consolidation" className="text-primary hover:underline">Debt Consolidation</Link>
            <Link href="/help/topics/credit-score" className="text-primary hover:underline">Improving Credit Score</Link>
            <Link href="/help/topics/interest-rates" className="text-primary hover:underline">Understanding Interest Rates</Link>
            <Link href="/help/topics/emergency-fund" className="text-primary hover:underline">Building Emergency Fund</Link>
            <Link href="/help/topics/budgeting" className="text-primary hover:underline">Effective Budgeting</Link>
            <Link href="/help/topics/saving" className="text-primary hover:underline">Saving Strategies</Link>
            <Link href="/help/topics/retirement" className="text-primary hover:underline">Retirement Planning</Link>
            <Link href="/help/topics/student-loans" className="text-primary hover:underline">Student Loan Repayment</Link>
            <Link href="/help/topics/mortgage" className="text-primary hover:underline">Mortgage Management</Link>
          </div>
        </div>
      </div>
    </div>
  );
}