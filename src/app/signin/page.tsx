import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Import client component with dynamic import
const SignInClient = dynamic(
  () => import('@/components/auth/SignInClient'),
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
  title: 'Sign In | Smart Debt Flow',
  description: 'Sign in to your Smart Debt Flow account to manage your finances and track your debt payoff journey.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const redirect = searchParams?.redirect as string | undefined;
  const needsConfirmation = searchParams?.needsConfirmation as string | undefined;
  
  return <SignInClient redirect={redirect} needsConfirmation={needsConfirmation} />;
} 