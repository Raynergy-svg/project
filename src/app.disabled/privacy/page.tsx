// We're switching from client to server component for proper redirects
import { redirect } from 'next/navigation';

export default function PrivacyPage() {
  // Using Next.js App Router's server-side redirect
  // This happens during server rendering, not on the client
  redirect('/Privacy');
} 