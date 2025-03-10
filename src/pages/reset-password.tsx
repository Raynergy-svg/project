import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Logo } from '@/components/Logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPassword() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidResetFlow, setIsValidResetFlow] = useState(true);
  
  // Check if this is a valid reset flow
  useEffect(() => {
    const checkResetFlow = async () => {
      // Supabase handles the query params internally
      // We just need to check if we're in a valid reset flow
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        setIsValidResetFlow(false);
      }
    };
    
    checkResetFlow();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setIsSuccess(true);
    } catch (error: any) {
      setFormErrors({
        general: error.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };
  
  // If not a valid reset flow
  if (!isValidResetFlow) {
    return (
      <Layout
        title="Invalid Reset Link | Smart Debt Flow"
        showNavbar={false}
        showFooter={false}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-xl">
            <div className="flex justify-center mb-6">
              <Logo className="h-10" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-4">Invalid Reset Link</h1>
            <p className="text-center mb-6">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => router.push('/forgot-password')}
                className="bg-primary hover:bg-primary/90"
              >
                Request New Link
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If password reset was successful
  if (isSuccess) {
    return (
      <Layout
        title="Password Reset Success | Smart Debt Flow"
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
            <h1 className="text-2xl font-bold text-center mb-4">Password Reset Successful</h1>
            <p className="text-center mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => router.push('/signin')}
                className="bg-primary hover:bg-primary/90"
              >
                Go to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
          <div className="flex flex-col items-center mb-8">
            <Logo className="h-10 mb-4" />
            <h1 className="text-2xl font-bold">Reset Your Password</h1>
            <p className="text-center text-muted-foreground mt-2">
              Create a new password for your account.
            </p>
          </div>
          
          {formErrors.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={formErrors.password ? "border-red-500 pr-10" : "pr-10"}
                  aria-invalid={!!formErrors.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>
            
            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={formErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  aria-invalid={!!formErrors.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
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

// No getServerSideProps since we need to check the session in the client
// Supabase handles auth state retrieval and token exchange 