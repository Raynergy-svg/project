import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/auth-adapter';
import { useSecurity } from '@/contexts/SecurityContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ENV } from '@/utils/env-adapter';

// Error boundary for catching rendering errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in SignUp component:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
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
    
    return this.props.children;
  }
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
  dataProcessingConsent?: boolean;
  ageVerification?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
  acceptTerms?: string;
  ageVerification?: string;
}

// Implement a custom hook for form validation with debounce
function useFormValidation(formData: FormData, setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>) {
  const debouncedEmail = useDebounce(formData.email, 300);
  const debouncedPassword = useDebounce(formData.password, 300);
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 300);
  
  // Validate email when debounced value changes
  useEffect(() => {
    if (debouncedEmail && !/\S+@\S+\.\S+/.test(debouncedEmail)) {
      setFormErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
    } else if (debouncedEmail) {
      setFormErrors(prev => ({
        ...prev,
        email: undefined
      }));
    }
  }, [debouncedEmail, setFormErrors]);
  
  // Validate password strength when debounced value changes
  useEffect(() => {
    if (debouncedPassword && debouncedPassword.length < 8) {
      setFormErrors(prev => ({
        ...prev,
        password: "Password must be at least 8 characters"
      }));
    } else if (debouncedPassword) {
      setFormErrors(prev => ({
        ...prev,
        password: undefined
      }));
    }
  }, [debouncedPassword, setFormErrors]);
  
  // Validate password confirmation when either password changes
  useEffect(() => {
    if (debouncedConfirmPassword && debouncedPassword !== debouncedConfirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords do not match"
      }));
    } else if (debouncedConfirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }));
    }
  }, [debouncedPassword, debouncedConfirmPassword, setFormErrors]);
}

// Implement debounce hook
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

export default function SignUp() {
  return (
    <ErrorBoundary>
      <SignUpContent />
    </ErrorBoundary>
  );
}

function SignUpContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, signup } = useAuth();
  const { sensitiveDataHandler } = useSecurity();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false,
    marketingConsent: false,
    dataProcessingConsent: true,
    ageVerification: false
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors for this field when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [formErrors]);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };
  
  // Get password strength
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) {
      return { score: 0, label: 'None', color: 'gray' };
    }
    
    // At least 8 characters
    const lengthValid = password.length >= 8;
    
    // Contains uppercase
    const hasUppercase = /[A-Z]/.test(password);
    
    // Contains lowercase
    const hasLowercase = /[a-z]/.test(password);
    
    // Contains number
    const hasNumber = /[0-9]/.test(password);
    
    // Contains special character
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    // Calculate score
    let score = 0;
    if (lengthValid) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    
    // Determine label and color based on score
    let label = 'Weak';
    let color = 'red';
    
    if (score >= 5) {
      label = 'Strong';
      color = 'green';
    } else if (score >= 3) {
      label = 'Medium';
      color = 'orange';
    }
    
    return { score, label, color };
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate name
    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else {
      const strength = getPasswordStrength(formData.password);
      if (strength.score < 3) {
        errors.password = 'Password is too weak. Please use a stronger password.';
        isValid = false;
      }
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms of service';
      isValid = false;
    }
    
    // Validate age verification
    if (!formData.ageVerification) {
      errors.ageVerification = 'You must confirm that you are 18 years or older';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Use the form validation hook
  useFormValidation(formData, setFormErrors);
  
  // Add performance optimizations to handleSubmit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track sensitive operation for security
      if (sensitiveDataHandler) {
        sensitiveDataHandler.trackEvent("signup_attempt", { 
          email: formData.email 
        });
      }
      
      // Add timeout to prevent indefinite loading
      const signupPromise = signup(formData.email, formData.password, {
        metadata: {
          name: formData.name,
          marketingConsent: formData.marketingConsent,
          dataProcessingConsent: formData.dataProcessingConsent,
          registeredAt: new Date().toISOString()
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Sign-up request timed out")), 15000);
      });
      
      const result = await Promise.race([signupPromise, timeoutPromise]);
      
      if (result?.error) {
        throw new Error(result.error.message || "Registration failed");
      }
      
      // Log sensitive operation success
      if (sensitiveDataHandler) {
        sensitiveDataHandler.trackEvent("signup_success", {
          userId: result.user?.id
        });
      }
      
      setRegistrationComplete(true);
      setEmailSent(true);
      
    } catch (error: any) {
      // Log sensitive operation failure
      if (sensitiveDataHandler) {
        sensitiveDataHandler.trackEvent("signup_failure", {
          email: formData.email,
          errorMessage: error.message
        });
      }
      
      // Provide better error messaging based on error type
      if (error.message.includes("Email already registered")) {
        setFormErrors({
          email: "This email is already registered. Try signing in instead.",
          general: undefined
        });
      } else if (error.message === "Sign-up request timed out") {
        setFormErrors({
          general: "Connection is slow. Please try again."
        });
      } else {
        setFormErrors({
          general: error.message || "Failed to register. Please try again."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, sensitiveDataHandler, signup]);
  
  // Show error message for a field
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName] ? (
      <p className="text-sm text-red-500 mt-1">{formErrors[fieldName]}</p>
    ) : null;
  };
  
  // Optimize password strength indicator with memoization
  const passwordStrength = useMemo(() => {
    if (!formData.password) return 0;
    
    let strength = 0;
    // Length check
    if (formData.password.length >= 8) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(formData.password)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(formData.password)) strength += 1;
    // Contains number
    if (/[0-9]/.test(formData.password)) strength += 1;
    // Contains special char
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    return Math.min(strength, 4);
  }, [formData.password]);
  
  // Render the password strength indicator
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    
    return (
      <div className="mt-1">
        <div className="flex h-1 overflow-hidden rounded bg-gray-200">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`h-full ${i < passwordStrength ? strengthColors[i] : 'bg-gray-200'}`}
              style={{ width: '20%' }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Password strength: {strengthLabels[passwordStrength - 1] || 'Weak'}
        </span>
      </div>
    );
  };
  
  // Registration success UI
  if (registrationComplete) {
    return (
      <Layout
        title="Sign Up Complete | Smart Debt Flow"
        showNavbar={false}
        showFooter={false}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-xl">
            <div className="flex justify-center mb-6">
              <Logo className="h-10" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-2">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-4">Registration Complete!</h1>
            
            {emailSent ? (
              <>
                <p className="text-center mb-6">
                  Please check your email at <strong>{formData.email}</strong> to verify your account.
                </p>
                <p className="text-sm text-center text-muted-foreground mb-6">
                  You will need to verify your email before you can sign in.
                </p>
              </>
            ) : (
              <p className="text-center mb-6">
                Your account has been created successfully. You can now sign in.
              </p>
            )}
            
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
  
  // Main signup form
  return (
    <Layout
      title="Create Account | Smart Debt Flow"
      showNavbar={false}
      showFooter={false}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Logo className="h-10 mb-4" />
            <h1 className="text-2xl font-bold">Create Your Account</h1>
            <p className="text-center text-muted-foreground mt-2">
              Join Smart Debt Flow to start your journey to financial freedom.
            </p>
          </div>
          
          {/* General error message */}
          {formErrors.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}
          
          {/* Sign up form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
                className={formErrors.name ? "border-red-500" : ""}
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {renderErrorMessage('name')}
            </div>
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? "border-red-500" : ""}
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? "email-error" : undefined}
              />
              {renderErrorMessage('email')}
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
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
                  aria-describedby={formErrors.password ? "password-error" : undefined}
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
              {renderErrorMessage('password')}
              
              {/* Password strength indicator */}
              {renderPasswordStrength()}
              
              {/* Password requirements */}
              <div className="mt-2 text-xs text-muted-foreground">
                Password must:
                <ul className="mt-1 space-y-1">
                  <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-500' : ''}`}>
                    <Check className={`h-3 w-3 mr-1 ${formData.password.length >= 8 ? 'opacity-100' : 'opacity-0'}`} />
                    Be at least 8 characters long
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}`}>
                    <Check className={`h-3 w-3 mr-1 ${/[A-Z]/.test(formData.password) ? 'opacity-100' : 'opacity-0'}`} />
                    Include an uppercase letter
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-500' : ''}`}>
                    <Check className={`h-3 w-3 mr-1 ${/[0-9]/.test(formData.password) ? 'opacity-100' : 'opacity-0'}`} />
                    Include a number
                  </li>
                  <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : ''}`}>
                    <Check className={`h-3 w-3 mr-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'opacity-100' : 'opacity-0'}`} />
                    Include a special character
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
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
                  aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
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
              {renderErrorMessage('confirmPassword')}
            </div>
            
            {/* Terms of Service */}
            <div className="space-y-4">
              <div className="flex items-start">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
                  }
                  className="mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm">
                  I accept the {' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {' '} and {' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {renderErrorMessage('acceptTerms')}
              
              {/* Age verification */}
              <div className="flex items-start">
                <Checkbox
                  id="ageVerification"
                  name="ageVerification"
                  checked={formData.ageVerification}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ageVerification: checked === true }))
                  }
                  className="mt-1"
                />
                <label htmlFor="ageVerification" className="ml-2 block text-sm">
                  I confirm that I am 18 years or older
                </label>
              </div>
              {renderErrorMessage('ageVerification')}
              
              {/* Marketing consent (optional) */}
              <div className="flex items-start">
                <Checkbox
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, marketingConsent: checked === true }))
                  }
                  className="mt-1"
                />
                <label htmlFor="marketingConsent" className="ml-2 block text-sm">
                  I'd like to receive product updates and marketing communications (optional)
                </label>
              </div>
            </div>
            
            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          {/* Sign in link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          
          {/* Security info */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-xs">Your information is secured with 256-bit SSL encryption</span>
            </div>
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