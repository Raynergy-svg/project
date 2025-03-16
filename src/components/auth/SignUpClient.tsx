"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useSecurity } from "@/contexts/SecurityContext";
import { useAuth } from "@/contexts/auth-adapter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  checkSupabaseConnection,
  supabase,
  devSignIn,
} from "@/utils/supabase/client";
import { IS_DEV } from "@/utils/environment";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
  acceptTerms?: string;
}

interface SignUpClientProps {
  plan?: string;
  feature?: string;
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
      console.error("Error in SignUp component:", error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-4">
          We encountered an error while loading this page. Please try
          refreshing.
        </p>
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

export default function SignUpClient({ plan, feature }: SignUpClientProps) {
  return (
    <ErrorBoundary>
      <SignUpContent plan={plan} feature={feature} />
    </ErrorBoundary>
  );
}

function SignUpContent({ plan, feature }: SignUpClientProps) {
  const { sensitiveDataHandler } = useSecurity();
  const { isAuthenticated, isLoading: authLoading, signup } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    acceptTerms: false,
    marketingConsent: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    error: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Add client-side only state
  const [isClient, setIsClient] = useState(false);
  
  const [isDevSigningIn, setIsDevSigningIn] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const status = await checkSupabaseConnection();
        setConnectionStatus({
          isConnected: status.connected,
          error: status.error,
        });
      } catch (error) {
        setConnectionStatus({
          isConnected: false,
          error: "Failed to connect to authentication service",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Add debounced form validation
  const debouncedEmail = useDebounce(formData.email, 300);
  const debouncedPassword = useDebounce(formData.password, 300);
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 300);
  
  useEffect(() => {
    if (debouncedEmail && !/\S+@\S+\.\S+/.test(debouncedEmail)) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email",
      }));
    } else if (debouncedEmail) {
      setFormErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  }, [debouncedEmail]);
  
  useEffect(() => {
    if (debouncedPassword && debouncedPassword.length < 8) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters",
      }));
    } else if (debouncedPassword) {
      setFormErrors((prev) => ({
        ...prev,
        password: undefined,
      }));
    }
    
    if (
      debouncedConfirmPassword &&
      debouncedPassword !== debouncedConfirmPassword
    ) {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else if (debouncedConfirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword: undefined,
      }));
    }
  }, [debouncedPassword, debouncedConfirmPassword]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
      setFormData((prev) => ({
      ...prev,
        [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear errors for this field when user types
    if (formErrors[name as keyof FormErrors]) {
        setFormErrors((prev) => ({
        ...prev,
          [name]: undefined,
      }));
    }
    },
    [formErrors]
  );

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
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    
    // Validate name
    if (!formData.name) {
      errors.name = "Name is required";
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = "You must accept the terms and conditions";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Call the signup function from auth context with the correct signature
      const result = await signup(
        formData.email, 
        formData.password,
        formData.name,
        {
          // Pass additional options as the 4th parameter
          metadata: {
            marketingConsent: formData.marketingConsent || false,
            plan: plan || "free",
            referredBy: feature || "direct",
          },
        }
      );
      
      if (result?.error) {
        console.error("Signup error:", result.error);
        
        // Handle specific error cases - properly check for string
        const errorMessage = String(result.error);
          
        if (errorMessage.includes("email")) {
          setFormErrors({
            email: "This email is already in use",
          });
        } else {
          setFormErrors({
            general: errorMessage || "Failed to create account",
          });
        }
        
        setIsSubmitting(false);
        return;
      }
      
      // Success! Show confirmation message
      setRegistrationSuccess(true);
      
      // Clear form data
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        acceptTerms: false,
        marketingConsent: false,
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/signin?needsConfirmation=true");
      }, 3000);
    } catch (error) {
      console.error("Error during signup:", error);
      setFormErrors({
        general: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Render error message for a field
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName] ? (
      <div className="text-sm text-red-500 mt-1">{formErrors[fieldName]}</div>
    ) : null;
  };

  // Add dev sign-in helper function
  const handleDevSignUp = async (role: "admin" | "user") => {
    if (!IS_DEV) {
      console.warn("Dev sign-up attempted in production mode");
      setFormErrors({
        general: "Development sign-up is not available in production",
      });
      return;
    }

    setIsDevSigningIn(true);
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Use email based on role
      const email = role === "admin" ? "admin@example.com" : "user@example.com";
      const password = "password123"; // Safe to expose as it's only for development

      console.log(`🔑 Dev sign-up: Using role ${role} with email ${email}`);
      
      // Use our enhanced development sign-in utility
      const result = await devSignIn(email, password);
      
      if (!result.error) {
        console.log("🎉 Dev sign-up successful");
        router.push("/dashboard");
      } else {
        console.error("❌ Dev sign-up failed:", result.error);
        setFormErrors({ 
          general: `Dev sign-up failed: ${
            result.error instanceof Error
              ? result.error.message
              : String(result.error)
          }`,
        });
      }
    } catch (error) {
      console.error("❌ Error during dev sign-up:", error);
      setFormErrors({ 
        general:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
      setIsDevSigningIn(false);
    }
  };

  return (
      <div className="min-h-screen flex flex-col md:flex-row">
      {/* Back button */}
      <motion.div
        className="fixed top-4 left-4 z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link href="/">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] shadow-md cursor-pointer">
            <ArrowLeft className="h-5 w-5 text-white" />
          </div>
        </Link>
      </motion.div>

        {/* Left side - Brand section */}
        <div className="bg-gray-900 dark:bg-white md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 border-r border-gray-800 dark:border-gray-200">
          <div className="max-w-md mx-auto text-center">
            <Link href="/" className="inline-block mb-8 mx-auto">
              <Logo className="h-12 w-auto" isLink={false} />
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-900 mb-6">
              Start your journey
            </h1>
            
            <p className="text-lg text-gray-300 dark:text-gray-700 mb-8">
            Create your Smart Debt Flow account and take the first step toward
            financial freedom.
            </p>
            
            <div className="mb-8">
              <div className="bg-gray-800 dark:bg-gray-100 shadow-md p-6 rounded-lg border border-gray-700 dark:border-gray-300">
              <h3 className="font-medium text-white dark:text-gray-900 mb-4">
                What you'll get:
              </h3>
                <ul className="space-y-3 text-gray-300 dark:text-gray-700">
                  <li className="flex items-start justify-center">
                    <Check className="h-5 w-5 text-[#1DB954] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Personalized debt reduction plan</span>
                  </li>
                  <li className="flex items-start justify-center">
                    <Check className="h-5 w-5 text-[#1DB954] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Interactive debt payoff dashboard</span>
                  </li>
                  <li className="flex items-start justify-center">
                    <Check className="h-5 w-5 text-[#1DB954] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Financial goal tracking tools</span>
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
              Take Smart Debt Flow with you everywhere. Our mobile app is
              launching next month with exclusive features.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Form section */}
        <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white dark:bg-background">
          <div className="max-w-md mx-auto md:mx-0 md:mr-auto w-full">
            <div className="flex flex-col mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground mb-2">
                Create your account
              </h2>
            </div>
            
            {/* Display connection error if any */}
            {connectionStatus?.error && (
            <Alert
              variant="destructive"
              className="mb-6 border border-red-200 dark:border-red-900/50"
            >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                {connectionStatus.error}. Please try again later or contact
                support.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Display security message if any */}
            {securityMessage && (
              <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20">
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>{securityMessage}</AlertDescription>
              </Alert>
            )}
            
            {/* Developer sign-up (only in development) */}
            {IS_DEV && (
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-border">
              <h3 className="font-medium text-gray-900 dark:text-foreground">
                Developer Testing
              </h3>
                <div className="flex flex-row gap-4">
                  <Button
                  onClick={() => handleDevSignUp("admin")}
                    disabled={isDevSigningIn}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground"
                  >
                    Quick Admin Setup
                  </Button>
                  <Button
                  onClick={() => handleDevSignUp("user")}
                    disabled={isDevSigningIn}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground"
                  >
                    Quick User Setup
                  </Button>
                </div>
                {isDevSigningIn && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Setting up test account...
                  </div>
                )}
              </div>
            )}
            
            {/* Wrap all conditional rendering in a client-side only div */}
            <div className="space-y-6">
              {isClient ? (
                registrationSuccess ? (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-500 border-green-200 dark:border-green-500/20">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Registration Successful!</AlertTitle>
                      <AlertDescription>
                      We've sent a confirmation email to{" "}
                      <strong>{formData.email}</strong>. Please check your inbox
                      and confirm your email address to complete your
                      registration.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-col space-y-4">
                      <Button 
                      onClick={() => router.push("/signin")}
                        variant="outline"
                        className="border-gray-300 dark:border-border"
                      >
                        Go to Sign In
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* General error message */}
                    {formErrors.general && (
                    <Alert
                      variant="destructive"
                      className="border border-red-200 dark:border-red-900/50"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formErrors.general}</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Name field */}
                    <div>
                    <Label
                      htmlFor="name"
                      className="text-gray-900 dark:text-foreground"
                    >
                      Name
                    </Label>
                      <div className="mt-1">
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                        className={`bg-white dark:bg-card border-gray-300 dark:border-border ${
                          formErrors.name ? "border-red-500" : ""
                        }`}
                        />
                      {renderErrorMessage("name")}
                    </div>
                    </div>
                    
                    {/* Email field */}
                    <div>
                    <Label
                      htmlFor="email"
                      className="text-gray-900 dark:text-foreground"
                    >
                      Email address
                    </Label>
                      <div className="mt-1">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                        className={`bg-white dark:bg-card border-gray-300 dark:border-border ${
                          formErrors.email ? "border-red-500" : ""
                        }`}
                        />
                      {renderErrorMessage("email")}
                    </div>
                    </div>

                    {/* Password field */}
                    <div>
                    <Label
                      htmlFor="password"
                      className="text-gray-900 dark:text-foreground"
                    >
                      Password
                    </Label>
                      <div className="mt-1 relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                        className={`bg-white dark:bg-card border-gray-300 dark:border-border pr-10 ${
                          formErrors.password ? "border-red-500" : ""
                        }`}
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
                      {renderErrorMessage("password")}
                    </div>
                    </div>
                    
                    {/* Confirm Password field */}
                    <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-900 dark:text-foreground"
                    >
                      Confirm Password
                    </Label>
                      <div className="mt-1 relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        className={`bg-white dark:bg-card border-gray-300 dark:border-border pr-10 ${
                          formErrors.confirmPassword ? "border-red-500" : ""
                        }`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                          )}
                        </button>
                      {renderErrorMessage("confirmPassword")}
                    </div>
                    </div>

                    {/* Terms and conditions */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <Checkbox
                          id="acceptTerms"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => 
                          setFormData((prev) => ({
                            ...prev,
                            acceptTerms: checked === true,
                          }))
                          }
                          className="border-gray-300 dark:border-border text-[#1DB954] focus:ring-[#1DB954]"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <Label 
                          htmlFor="acceptTerms" 
                        className={`font-medium text-gray-700 dark:text-muted-foreground ${
                          formErrors.acceptTerms ? "text-red-500" : ""
                        }`}
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-[#1DB954] hover:text-[#1DB954]/90"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-[#1DB954] hover:text-[#1DB954]/90"
                        >
                          Privacy Policy
                        </Link>
                        </Label>
                      {renderErrorMessage("acceptTerms")}
                    </div>
                    </div>
                    
                    {/* Marketing consent */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <Checkbox
                          id="marketingConsent"
                          name="marketingConsent"
                          checked={formData.marketingConsent}
                          onCheckedChange={(checked) => 
                          setFormData((prev) => ({
                            ...prev,
                            marketingConsent: checked === true,
                          }))
                          }
                          className="border-gray-300 dark:border-border text-[#1DB954] focus:ring-[#1DB954]"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                      <Label
                        htmlFor="marketingConsent"
                        className="font-medium text-gray-700 dark:text-muted-foreground"
                      >
                        I'd like to receive updates about new features and
                        promotions
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Button
                        type="submit"
                        className="w-full flex justify-center py-2 bg-[#1DB954] hover:bg-[#1DB954]/90 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Sign in link - moved below create account button */}
                    <div className="text-center pt-4 border-t border-gray-200 dark:border-border mt-6">
                      <div className="flex flex-col items-center">
                      <span className="text-gray-700 dark:text-muted-foreground mb-2">
                        Already have an account?
                      </span>
                      <Link
                        href="/signin"
                        className="font-medium text-[#1DB954] hover:text-[#1DB954]/90 transition-colors"
                      >
                          Sign in
                        </Link>
                      </div>
                    </div>
                  </form>
                )
              ) : (
                // Server-side placeholder with the same structure
                <div className="space-y-6">
                  {/* This will be replaced by the client-side content after hydration */}
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-muted rounded mb-4"></div>
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
  );
} 
