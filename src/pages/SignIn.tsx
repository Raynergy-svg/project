import React, { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Shield, ArrowLeft, Loader2, AlertCircle, KeyIcon } from "lucide-react";
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
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

// Only include dev signin in development mode
const useDevSignIn = process.env.NODE_ENV === 'development' 
  ? require('@/utils/useDevSignIn').useDevSignIn 
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

export default function SignIn() {
  return (
    <ErrorBoundary>
      <SignInContent />
    </ErrorBoundary>
  );
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

function SignInContent() {
  const { sensitiveDataHandler } = useSecurity();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const router = useRouter();
  const { redirect, needsConfirmation } = router.query;
  const redirectPath = typeof redirect === 'string' ? redirect : '/dashboard';
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
  
  // Effect to check if email needs confirmation
  useEffect(() => {
    if (needsConfirmation === 'true') {
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Switch between magic link and password login
  const toggleLoginMethod = () => {
    setUseMagicLink(prev => !prev);
    setFormErrors({});
  };

  // Show error message for a field
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName] ? (
      <p className="mt-1 text-sm text-red-500">{formErrors[fieldName]}</p>
    ) : null;
  };

  // Show placeholder loading while checking authentication status
  if (authLoading || isLoading) {
    return (
      <Layout title="Sign In | Smart Debt Flow" showNavbar={false} showFooter={false}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111] via-[#121518] to-[#101010]">
          <div className="flex flex-col items-center justify-center p-6 w-full max-w-lg md:max-w-xl">
            <Logo className="h-16 w-auto mb-6 opacity-75 animate-pulse" />
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#88B04B]/50 to-transparent mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-[#88B04B] to-transparent animate-shimmer"></div>
            </div>
            <Loader2 className="h-10 w-10 animate-spin text-[#88B04B] mb-4" />
            <p className="text-[#88B04B]/80 font-medium">Preparing your secure sign in...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Render DEV sign-in option
  const renderDevOptions = () => {
    if (process.env.NODE_ENV !== 'development' || !handleDevSignIn) {
      return null;
    }
    
    return (
      <div className="mt-8 p-4 border border-dashed border-amber-400 rounded-md bg-amber-50 dark:bg-amber-950">
        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Development Login Options</h3>
              <Button 
          variant="outline" 
          className="w-full text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-900"
          onClick={handleDevSignIn}
          disabled={devSignInLoading}
        >
          {devSignInLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Quick Dev Sign In
              </Button>
        {devSignInError && <p className="text-sm text-red-500 mt-1">{devSignInError}</p>}
        {devAccountInfo && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Using account: {devAccountInfo.email}</p>
          </div>
        )}
        </div>
    );
  };

  // Show magic link sent confirmation
  if (magicLinkSent) {
    return (
      <Layout title="Check Your Email | Smart Debt Flow" showNavbar={false} showFooter={false}>
        <div className="min-h-screen bg-gradient-to-br from-[#111] via-[#121518] to-[#101010] text-white flex flex-col items-center justify-center p-6">
          <div className="max-w-md md:max-w-lg lg:max-w-xl w-full space-y-8 bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#88B04B]/20 via-[#88B04B] to-[#88B04B]/20"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#88B04B]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#88B04B]/10 mb-4">
                <Logo className="h-10 w-auto" />
              </div>
              <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Check your email
              </h2>
              <p className="mt-3 text-gray-300">
                We've sent a magic link to <span className="font-semibold text-[#88B04B]">{formData.email}</span>
              </p>
            </div>
            
            <div className="mt-8">
              <Alert className="bg-[#0F172A]/50 border border-blue-500/30 text-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <AlertTitle className="font-semibold text-blue-300">Important</AlertTitle>
                <AlertDescription className="text-blue-200/90">
                  The link will expire in 10 minutes. If you don't see the email, please check your spam folder.
                </AlertDescription>
              </Alert>
              
              <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                  className="flex items-center border-white/20 hover:bg-white/10 hover:border-white/40 transition-all"
                onClick={() => setMagicLinkSent(false)}
              >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span>Back to sign in</span>
              </Button>
                
                <Button
                  variant="ghost"
                  className="text-[#88B04B] hover:text-[#88B04B]/80 hover:bg-[#88B04B]/10 transition-all"
                  onClick={() => handleSendMagicLink({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Resend link
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              {" • "}
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Main sign in form
  return (
    <Layout title="Sign In | Smart Debt Flow" showNavbar={false} showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-[#111] via-[#121518] to-[#101010] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md md:max-w-lg lg:max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#88B04B]/10 mb-4">
              <Logo className="h-10 w-auto" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Welcome Back
            </h1>
            <p className="mt-3 text-gray-400 md:text-lg">
              Sign in to continue your debt-free journey
            </p>
          </div>
          
          {showConfirmationAlert && (
            <Alert className="mb-6 bg-[#351F00]/50 border border-yellow-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="font-semibold text-yellow-400">Email Confirmation Required</AlertTitle>
              <AlertDescription className="text-yellow-300/80">
                Please check your email inbox for a confirmation link. You need to verify your email before signing in.
                <Link
                  href="/signup"
                  className="text-yellow-400 hover:text-yellow-300 underline mt-2 inline-block transition-colors"
                >
                  Need to resend the confirmation email?
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#88B04B]/20 via-[#88B04B] to-[#88B04B]/20"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#88B04B]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>
              
              {connectionStatus && !connectionStatus.isConnected && (
                <Alert variant="destructive" className="mb-6 rounded-lg animate-pulse">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>
                    {connectionStatus.error || "Unable to connect to authentication service. Please try again later."}
                  </AlertDescription>
                </Alert>
              )}
              
              {securityMessage && (
                <Alert className="mb-6 bg-[#2A1E00]/50 border border-amber-500/30 text-amber-200 rounded-lg">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <AlertTitle className="font-semibold text-amber-300">Security Notice</AlertTitle>
                  <AlertDescription className="text-amber-200/90">{securityMessage}</AlertDescription>
                </Alert>
              )}
              
              {formErrors.general && (
                <Alert variant="destructive" className="mb-6 bg-red-950/50 border border-red-500/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertTitle className="font-semibold text-red-300">Authentication Error</AlertTitle>
                  <AlertDescription className="text-red-200/90">{formErrors.general}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
                  <Label htmlFor="email" className="text-gray-200 font-medium inline-flex items-center gap-1 mb-1.5">
                    <svg className="h-4 w-4 text-[#88B04B]/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                Email
                  </Label>
                  <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                      required
                      className={`bg-black/50 border ${formErrors.email ? 'border-red-500' : 'border-gray-700 focus:border-[#88B04B]/70'} rounded-lg py-2 px-4 w-full text-white transition-all duration-200`}
                placeholder="you@example.com"
                value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    {formErrors.email && (
                      <div className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{formErrors.email}</span>
                      </div>
                    )}
                  </div>
            </div>
            
            {!useMagicLink && (
              <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <Label htmlFor="password" className="text-gray-200 font-medium inline-flex items-center gap-1">
                        <svg className="h-4 w-4 text-[#88B04B]/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                    Password
                      </Label>
                  <Link
                    href="/forgot-password"
                        className="text-xs text-[#88B04B] hover:text-[#88B04B]/80 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                        required
                        className={`bg-black/50 border ${formErrors.password ? 'border-red-500' : 'border-gray-700 focus:border-[#88B04B]/70'} rounded-lg py-2 px-4 w-full text-white transition-all duration-200 pr-10`}
                    placeholder="••••••••"
                    value={formData.password}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                  />
                  <button
                    type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                    ) : (
                          <Eye className="h-4 w-4" />
                    )}
                  </button>
                      {formErrors.password && (
                        <div className="mt-1 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{formErrors.password}</span>
                        </div>
                      )}
                </div>
              </div>
            )}
            
                <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                  checked={rememberMe}
                      onCheckedChange={handleRememberMeChange}
                      className="data-[state=checked]:bg-[#88B04B] border-gray-600 rounded-sm"
                />
                    <Label
                      htmlFor="remember-me"
                      className="ml-2 text-sm text-gray-300"
                    >
                  Remember me
                    </Label>
              </div>
                  
              <button
                type="button"
                onClick={toggleLoginMethod}
                    className="text-xs text-[#88B04B] hover:text-[#88B04B]/80 transition-colors font-medium"
              >
                    {useMagicLink ? "Use password" : "Use magic link"}
              </button>
            </div>
            
                <Button
                  type="submit"
                  className="w-full bg-[#88B04B] hover:bg-[#7a9d43] transition-all duration-200 py-2 text-white font-medium rounded-lg mt-6"
                  disabled={isSubmitting || (connectionStatus && !connectionStatus.isConnected)}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>{useMagicLink ? "Send Magic Link" : "Sign In"}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-gray-400">Don't have an account? </span>
                  <Link
                    href="/signup"
                    className="text-[#88B04B] hover:text-[#88B04B]/80 transition-colors font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-[#1E293B]/70 rounded-lg border border-gray-700/50 text-xs text-gray-400">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <svg className="h-4 w-4 text-[#88B04B]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.5 10a4.5 4.5 0 10-9 0 4.5 4.5 0 009 0zm1.5 0a6 6 0 11-12 0 6 6 0 0112 0zm-8-3a1 1 0 011-1h.01a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Development Mode</span>
                  </div>
                  <p className="mb-2">
                    Use <code className="bg-gray-800 px-1.5 py-0.5 rounded text-[#88B04B]">dev@example.com / password123</code> to sign in.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-gray-300 hover:text-white border-gray-700 hover:border-[#88B04B]/50 hover:bg-[#88B04B]/10 transition-all duration-200"
                    onClick={handleDevSignIn}
                    disabled={devSignInLoading}
                  >
                    {devSignInLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                    <span>Quick Dev Sign In</span>
                  </Button>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-full flex flex-col">
                <div className="mb-6">
                  <div className="rounded-full p-3 bg-[#88B04B]/10 inline-flex mb-4">
                    <Shield className="w-6 h-6 text-[#88B04B]" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Secure Authentication</h3>
                  <p className="text-gray-400 text-sm">Your account is protected with industry-leading security measures.</p>
                </div>
                
                <div className="space-y-4 flex-grow">
                  <div className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                    <div className="rounded-full p-1.5 bg-[#88B04B]/10 flex-shrink-0">
                      <Lock className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white block">256-bit SSL Encryption</span>
                      <span className="text-xs text-gray-400">Bank-level security for all your sensitive data</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                    <div className="rounded-full p-1.5 bg-[#88B04B]/10 flex-shrink-0">
                      <svg className="w-4 h-4 text-[#88B04B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white block">End-to-End Encryption</span>
                      <span className="text-xs text-gray-400">Your data is secure from unauthorized access</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                    <div className="rounded-full p-1.5 bg-[#88B04B]/10 flex-shrink-0">
                      <svg className="w-4 h-4 text-[#88B04B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white block">Data Protection</span>
                      <span className="text-xs text-gray-400">Strong security measures for your financial data</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    By signing in, you agree to our <Link href="/terms" className="text-[#88B04B] hover:text-[#88B04B]/80 transition-colors">Terms of Service</Link> and <Link href="/privacy" className="text-[#88B04B] hover:text-[#88B04B]/80 transition-colors">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            <p>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              {" • "}
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              {" • "}
              <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            </p>
            <p className="mt-2 text-gray-600">© {new Date().getFullYear()} Smart Debt Flow. All rights reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Create server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();

  // If there's a session, redirect to dashboard
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  // Otherwise, allow access to the sign-in page
  return {
    props: {},
  };
}
