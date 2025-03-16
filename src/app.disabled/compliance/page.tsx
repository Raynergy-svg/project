// We're switching from client to server component for proper redirects
import { redirect } from 'next/navigation';

export default function CompliancePage() {
  // Redirect to the Security page
  redirect('/security');
} 