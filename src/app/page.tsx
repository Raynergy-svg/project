import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Import client component with dynamic import
const LandingPageClient = dynamic(
  () => import('@/components/landing/LandingPageClient'),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

// Enhanced metadata for this specific page
export const metadata: Metadata = {
  title: 'Smart Debt Flow | Break Free From The Weight of Debt',
  description: 'Transform your financial burden into a clear path to freedom with AI-powered guidance. Smart Debt Flow helps you manage and eliminate debt faster.',
  openGraph: {
    images: [
      {
        url: 'https://yourdomain.com/landing-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Smart Debt Flow Landing Page',
      },
    ],
  },
};

// Fetch data at build time or request time depending on your needs
async function getData() {
  // This could fetch from an API, CMS, or other data source
  return {
    pageMetadata: {
      title: 'Smart Debt Flow | Break Free From The Weight of Debt',
      description: 'Transform your financial burden into a clear path to freedom with AI-powered guidance. Smart Debt Flow helps you manage and eliminate debt faster.',
      ogImage: 'https://yourdomain.com/landing-og-image.jpg',
      ogUrl: 'https://yourdomain.com',
    },
    // Add any other data needed by the landing page
  };
}

// Server Component that renders the client component with data
export default async function LandingPage() {
  const data = await getData();
  
  return <LandingPageClient initialData={data} />;
} 