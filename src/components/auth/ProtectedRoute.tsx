'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-adapter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isSubscribed, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to sign in
      if (!isAuthenticated) {
        router.push(`/signin?redirect=${encodeURIComponent(currentPath)}&reason=auth_required`);
        return;
      }
      
      // If subscription is required but user doesn't have one
      if (requireSubscription && !isSubscribed) {
        router.push(`/settings/subscription?required=true&redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      
      setIsChecking(false);
    }
  }, [isAuthenticated, isLoading, isSubscribed, requireSubscription, router, currentPath]);
  
  if (isLoading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Verifying your access...</p>
      </div>
    );
  }
  
  // Additional permission check if needed (based on user roles, etc.)
  const hasPermission = true; // Replace with actual permission check
  
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this resource.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return <>{children}</>;
}
