'use client';

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Shield, ArrowLeft, Loader2, AlertCircle, KeyIcon, Check } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from "@/components/Logo";
import { useSecurity } from "@/contexts/SecurityContext";
import { useAuth } from "@/contexts/auth-adapter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Layout } from '@/components/layout/Layout';
import { checkSupabaseConnection, supabase } from '@/utils/supabase/client';
import { ENV } from '@/utils/env-adapter';

// Safely import the dev sign-in hook only on the client side
const useDevSignIn = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' 
  ? require('@/utils/useDevSignIn').default 
  : () => ({ handleDevSignIn: null, loading: false, error: null, devAccountInfo: null });

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface SignInClientProps {
  redirect?: string;
  needsConfirmation?: string;
}

// Add a custom error boundary component for better error handling
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      setError(error.error);
      // Log the error to your monitoring service
      console.error("Error in SignIn component:", error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-4">We encountered an error while loading this page. Please try refreshing.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// Optimize form validation with debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SignInClient({ redirect, needsConfirmation }: SignInClientProps) {
  return (
    <ErrorBoundary>
      <SignInContent redirect={redirect} needsConfirmation={needsConfirmation === 'true'} />
    </ErrorBoundary>
  );
}

function SignInContent({ redirect = '/dashboard', needsConfirmation = false }: { redirect: string, needsConfirmation: boolean }) {
  const { sensitiveDataHandler } = useSecurity();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const router = useRouter();
  const redirectPath = redirect;
  const { handleDevSignIn, loading: devSignInLoading, error: devSignInError, devAccountInfo } = useDevSignIn();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    error: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  // Add useEffect to ensure client-side only rendering for the form
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Effect to check if email needs confirmation
  useEffect(() => {
    if (needsConfirmation) {
      setShowConfirmationAlert(true);
    }
  }, [needsConfirmation]);
  
  // Show CAPTCHA after first failed attempt
  useEffect(() => {
    if (failedAttempts > 0) {
      setShowCaptcha(true);
    }
  }, [failedAttempts]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, authLoading, router, redirectPath]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const status = await checkSupabaseConnection();
        setConnectionStatus({
          isConnected: status,
          error: status ? null : "Failed to connect to authentication service"
        });
      } catch (error) {
        setConnectionStatus({
          isConnected: false,
          error: "Failed to connect to authentication service"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Add debounced form validation
  const debouncedEmail = useDebounce(formData.email, 300);
  
  useEffect(() => {
    if (debouncedEmail && !/\S+@\S+\.\S+/.test(debouncedEmail)) {
      setFormErrors(prev => ({
        ...prev,
        email: "Please enter a valid email"
      }));
    } else if (debouncedEmail) {
      setFormErrors(prev => ({
        ...prev,
        email: undefined
      }));
    }
  }, [debouncedEmail]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [formErrors]);
  
  // Handle remember me checkbox change
  const handleRememberMeChange = useCallback((checked: boolean) => {
    setRememberMe(checked);
  }, []);

  // Validate the form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate email
    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  
  // Handle magic link flow
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call Supabase magic link function
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${ENV.APP_URL}/auth/callback`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setMagicLinkSent(true);
    } catch (error: any) {
      setFormErrors({
        general: error.message || "Failed to send magic link. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optimize form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using magic link, handle that flow instead
    if (useMagicLink) {
      await handleSendMagicLink(e);
      return;
    }
    
    // Regular email/password flow
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track the sensitive operation for security
      if (sensitiveDataHandler) {
        sensitiveDataHandler.trackEvent("login_attempt", { 
          email: formData.email
        });
      }
      
      // Call login from auth context with timeout for better UX
      const loginPromise = login(formData.email, formData.password);
      
      // Add a timeout to prevent indefinite loading state
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login request timed out")), 15000);
      });
      
      const result = await Promise.race([loginPromise, timeoutPromise]);
      
      if (result?.error) {
        throw new Error(result.error.message || "Authentication failed");
      }
      
      // Reset failed attempts on success
      setFailedAttempts(0);
      
      // Log sensitive operation success
      if (sensitiveDataHandler) {
        sensitiveDataHandler.trackEvent("login_success", {
          userId: result.user?.id
        });
      }
      
      // Redirect to dashboard or specified redirect path
      router.push(redirectPath);
    } catch (error: any) {
      // Increment failed attempts counter
      setFailedAttempts(prev => prev + 1);
      
      // Log sensitive operation failure
      if (sensitiveDataHandler) {
        sensitiveDataHandler.trackEvent("login_failure", {
          email: formData.email,
          errorMessage: error.message,
          failedAttempts: failedAttempts + 1
        });
      }
      
      // Set error message with better user feedback
      setFormErrors({
        general: error.message === "Login request timed out" 
          ? "Connection is slow. Please try again." 
          : error.message || "Invalid email or password"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleLoginMethod = () => {
    setUseMagicLink(!useMagicLink);
    setFormErrors({});
  };
  
  // Render error message for a field
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName] ? (
      <div className="text-sm text-red-500 mt-1">
        {formErrors[fieldName]}
      </div>
    ) : null;
  };

  return (
    <Layout showNavbar={false}>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Brand section */}
        <div className="bg-gray-900 dark:bg-white md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 border-r border-gray-800 dark:border-gray-200">
          <div className="max-w-md mx-auto text-center">
            <Link href="/" className="inline-block mb-8 mx-auto">
              <Logo className="h-12 w-auto" isLink={false} />
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-900 mb-6">
              Welcome back
            </h1>
            
            <p className="text-lg text-gray-300 dark:text-gray-700 mb-8">
              Sign in to your Smart Debt Flow account to continue your journey to financial freedom.
            </p>
            
            <div className="mb-8">
              <div className="bg-gray-800 dark:bg-gray-100 shadow-md p-6 rounded-lg border border-gray-700 dark:border-gray-300">
                <h3 className="font-medium text-white dark:text-gray-900 mb-4">Why Smart Debt Flow?</h3>
                <ul className="space-y-3 text-gray-300 dark:text-gray-700">
                  <li className="flex items-start justify-center">
                    <Check className="h-5 w-5 text-[#1DB954] mr-2 flex-shrink-0 mt-0.5" />
                    <span>AI-powered debt reduction strategies</span>
                  </li>
                  <li className="flex items-start justify-center">
                    <Check className="h-5 w-5 text-[#1DB954] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Visual debt payoff tracking</span>
                  </li>
                  <li className="flex items-start justify-center">
                    <Check className="h-5 w-5 text-[#1DB954] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Personalized financial insights</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* News section */}
            <div className="bg-gray-800/70 dark:bg-gray-100/70 p-4 rounded-lg border border-[#1DB954]/30 shadow-inner">
              <div className="inline-block bg-[#1DB954] text-white text-xs font-bold px-2 py-1 rounded mb-2">
                COMING SOON
              </div>
              <h3 className="text-lg font-semibold text-white dark:text-gray-900 mb-2">
                Mobile App Launch
              </h3>
              <p className="text-gray-300 dark:text-gray-700 text-sm">
                Take Smart Debt Flow with you everywhere. Our mobile app is launching next month with exclusive features.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Form section */}
        <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white dark:bg-background">
          <div className="max-w-md mx-auto md:mx-0 md:mr-auto w-full">
            <div className="flex flex-col mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground mb-2">
                {useMagicLink 
                  ? magicLinkSent 
                    ? "Check your email" 
                    : "Sign in with magic link"
                  : "Sign in to your account"}
              </h2>
            </div>
            
            {/* Display connection error if any */}
            {connectionStatus?.error && (
              <Alert variant="destructive" className="mb-6 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  {connectionStatus.error}. Please try again later or contact support.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Display confirmation alert if needed */}
            {showConfirmationAlert && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-500 border-green-200 dark:border-green-500/20">
                <Check className="h-4 w-4" />
                <AlertTitle>Email Confirmation Required</AlertTitle>
                <AlertDescription>
                  Please check your email to confirm your account before signing in.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Display security message if any */}
            {securityMessage && (
              <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20">
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  {securityMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Wrap the conditional rendering in a client-side only div */}
            <div className="space-y-6">
              {isClient ? (
                <>
                  {/* Developer sign-in (only in development) - moved inside client-side rendering */}
                  {process.env.NODE_ENV === 'development' && handleDevSignIn && (
                    <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-border">
                      <h3 className="font-medium text-gray-900 dark:text-foreground">Developer Testing Options</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          onClick={() => handleDevSignIn('admin')}
                          disabled={devSignInLoading}
                          variant="outline"
                          className="justify-start border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground"
                        >
                          {devSignInLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Lock className="mr-2 h-4 w-4" />
                          )}
                          Sign in as Admin
                        </Button>
                        <Button
                          onClick={() => handleDevSignIn('user')}
                          disabled={devSignInLoading}
                          variant="outline"
                          className="justify-start border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground"
                        >
                          {devSignInLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Lock className="mr-2 h-4 w-4" />
                          )}
                          Sign in as Regular User
                        </Button>
                      </div>
                      {devSignInError && (
                        <Alert variant="destructive" className="border border-red-200 dark:border-red-900/50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{devSignInError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  
                  {magicLinkSent ? (
                    <div className="space-y-4">
                      <Alert className="bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-500 border-green-200 dark:border-green-500/20">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Check Your Email</AlertTitle>
                        <AlertDescription>
                          We've sent a magic link to <strong>{formData.email}</strong>. 
                          Click the link in the email to sign in.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-col space-y-4">
                        <Button 
                          onClick={() => {
                            setMagicLinkSent(false);
                            setFormData({ ...formData, email: "" });
                          }}
                          variant="outline"
                          className="border-gray-300 dark:border-border"
                        >
                          Use a different email
                        </Button>
                        <Button 
                          onClick={() => {
                            setUseMagicLink(false);
                            setMagicLinkSent(false);
                          }}
                          variant="link"
                          className="text-[#1DB954] hover:text-[#1DB954]/90"
                        >
                          Sign in with password instead
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Login Form */
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      {/* Email field */}
                      <div>
                        <Label htmlFor="email" className="text-gray-900 dark:text-foreground">Email address</Label>
                        <div className="mt-1">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`bg-white dark:bg-card border-gray-300 dark:border-border ${formErrors.email ? "border-red-500" : ""}`}
                          />
                          {renderErrorMessage('email')}
                        </div>
                      </div>

                      {/* Password field */}
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-gray-900 dark:text-foreground">Password</Label>
                          <Link href="/forgot-password" className="text-sm font-medium text-[#1DB954] hover:text-[#1DB954]/90 transition-colors">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="mt-1 relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`bg-white dark:bg-card border-gray-300 dark:border-border pr-10 ${formErrors.password ? "border-red-500" : ""}`}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                            )}
                          </button>
                          {renderErrorMessage('password')}
                        </div>
                      </div>

                      {/* Remember me checkbox */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox
                            id="remember-me"
                            checked={rememberMe}
                            onCheckedChange={(checked) => handleRememberMeChange(checked as boolean)}
                            className="border-gray-300 dark:border-border text-[#1DB954] focus:ring-[#1DB954]"
                          />
                          <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-muted-foreground">
                            Remember me
                          </Label>
                        </div>
                        
                        <div className="text-sm">
                          <button
                            type="button"
                            onClick={toggleLoginMethod}
                            className="font-medium text-[#1DB954] hover:text-[#1DB954]/90 transition-colors"
                          >
                            {useMagicLink ? "Use password" : "Use magic link"}
                          </button>
                        </div>
                      </div>

                      {/* General error message */}
                      {formErrors.general && (
                        <Alert variant="destructive" className="border border-red-200 dark:border-red-900/50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{formErrors.general}</AlertDescription>
                        </Alert>
                      )}

                      <div>
                        <Button
                          type="submit"
                          className="w-full flex justify-center py-2 bg-[#1DB954] hover:bg-[#1DB954]/90 text-white"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign in
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Create account link - moved below sign in button */}
                      <div className="text-center pt-4 border-t border-gray-200 dark:border-border mt-6">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-700 dark:text-muted-foreground mb-2">New to Smart Debt Flow?</span>
                          <Link href="/signup" className="font-medium text-[#1DB954] hover:text-[#1DB954]/90 transition-colors">
                            Create an account
                          </Link>
                        </div>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                // Server-side placeholder with the same structure
                <div className="space-y-6">
                  {/* This will be replaced by the client-side content after hydration */}
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-[#1DB954]/30 rounded"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 