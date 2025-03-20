import { Metadata } from 'next';

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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">This page is under construction.</h1>
    </div>
  );
}