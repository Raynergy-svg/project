import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Logo } from '@/components/Logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ENV } from '@/utils/env-adapter';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${ENV.APP_URL}/reset-password`,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send reset password email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If the password reset email was sent successfully
  if (isSuccess) {
    return (
      <Layout
        title="Check Your Email | Smart Debt Flow"
        showNavbar={false}
        showFooter={false}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-xl">
            <div className="flex justify-center mb-6">
              <Logo className="h-10" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-4">Check Your Email</h1>
            <p className="text-center mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                Try another email
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Didn't receive an email? Check your spam folder or{" "}
                <button 
                  onClick={handleSubmit}
                  className="text-primary hover:underline"
                >
                  send another link
                </button>
              </p>
              <div className="text-center">
                <Link href="/signin" className="text-primary hover:underline text-sm">
                  Return to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Reset Password | Smart Debt Flow"
      showNavbar={false}
      showFooter={false}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <Link 
              href="/signin"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
          
          <div className="flex flex-col items-center mb-8">
            <Logo className="h-10 mb-4" />
            <h1 className="text-2xl font-bold">Reset Your Password</h1>
            <p className="text-center text-muted-foreground mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Server-side props for authentication check
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return context.req.cookies[name];
        },
        set(name, value, options) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
        remove(name, options) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If already logged in, redirect to dashboard
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // No props needed
  };
} 