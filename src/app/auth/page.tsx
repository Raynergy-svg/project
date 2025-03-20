import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Smart Debt Flow',
  description: 'Sign in or create an account to access Smart Debt Flow',
  openGraph: {
    title: 'Sign In - Smart Debt Flow',
    description: 'Access your Smart Debt Flow account or create a new one',
    type: 'website',
    url: 'https://smartdebtflow.com/auth',
  },
};

/**
 * Redirect the main /auth page to the dedicated /auth/signin page
 * This maintains backward compatibility with any links that point to /auth
 * while using the updated auth flow components in the signin directory.
 */
export default function AuthPage() {
  redirect('/auth/signin');
}
