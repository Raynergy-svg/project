import type { Metadata } from 'next';

// Metadata for the page (replaces Head in Pages Router)
export const metadata: Metadata = {
  title: 'System Status - Smart Debt Flow',
  description: 'Check the current operational status of Smart Debt Flow services and systems.',
  openGraph: {
    title: 'System Status - Smart Debt Flow',
    description: 'View real-time status of Smart Debt Flow services and systems.',
    type: 'website',
    url: 'https://smartdebtflow.com/status',
  },
};

// Server Component - Main page 
export default function StatusPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 relative">
        <StatusClient />
      </div>
    </div>
  );
}

// Client Component - Import at bottom of file to avoid circular references
import { StatusClient } from './StatusClient';

