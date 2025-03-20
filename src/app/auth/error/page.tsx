'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Error messages mapped by error code
 */
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  verification_failed: {
    title: 'Verification Failed',
    description: 'We couldn\'t verify your email. The link may have expired or is invalid.'
  },
  invalid_token: {
    title: 'Invalid Link',
    description: 'The authentication link you used is invalid or has expired.'
  },
  unauthorized: {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.'
  },
  default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try again or contact support.'
  }
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get('error') || 'default';
  const errorDetails = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;

  return (
    <div className="container flex items-center justify-center h-screen">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem with your authentication request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{errorDetails.title}</AlertTitle>
              <AlertDescription>
                {errorDetails.description}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
