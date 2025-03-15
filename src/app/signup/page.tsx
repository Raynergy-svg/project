import { Metadata } from "next";
import dynamic from "next/dynamic";

// Import client component with dynamic import
const SignUpClient = dynamic(() => import("@/components/auth/SignUpClient"), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

// Enhanced metadata for this specific page
export const metadata: Metadata = {
  title: "Sign Up | Smart Debt Flow",
  description:
    "Create your account on Smart Debt Flow to start your journey to financial freedom and manage your debt effectively.",
  robots: {
    index: false,
    follow: true,
  },
};

// This is a Server Component that correctly handles searchParams
export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Properly await searchParams before accessing its properties - similar to signin page
  const params = searchParams ? await Promise.resolve(searchParams) : {};
  const plan = params.plan as string | undefined;
  const feature = params.feature as string | undefined;

  // Return the client component with the extracted values
  return <SignUpClient plan={plan} feature={feature} />;
}
