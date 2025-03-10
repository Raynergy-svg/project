import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Import client component with dynamic import
const SignUpClient = dynamic(
  () => import('@/components/auth/SignUpClient'),
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
  title: 'Sign Up | Smart Debt Flow',
  description: 'Create your account on Smart Debt Flow to start your journey to financial freedom and manage your debt effectively.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const plan = searchParams?.plan as string | undefined;
  const feature = searchParams?.feature as string | undefined;
  
  return <SignUpClient plan={plan} feature={feature} />;
} 