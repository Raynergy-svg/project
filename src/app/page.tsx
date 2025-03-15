import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Static loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Error fallback
const ErrorFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
    <p className="text-center mb-4">We're having trouble loading this page. Please try refreshing.</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
    >
      Refresh Page
    </button>
  </div>
);

// Import client component with dynamic import - Adding error boundary and simplified loading
const LandingPageClient = dynamic(
  () => import('@/components/landing/LandingPageClient')
    .then(mod => {
      // Successfully loaded the module
      return mod;
    })
    .catch(err => {
      // Log the error but don't throw - return a fallback component instead
      console.error("Error loading LandingPageClient:", err);
      return { 
        default: () => <ErrorFallback /> 
      };
    }),
  {
    loading: () => <LoadingFallback />,
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
  try {
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
  } catch (error) {
    console.error("Error fetching data:", error);
    return { pageMetadata: {} };
  }
}

// Server Component that renders the client component with data
export default async function LandingPage() {
  try {
    const data = await getData();
    
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPageClient initialData={data} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error rendering LandingPage:", error);
    return <ErrorFallback />;
  }
} 