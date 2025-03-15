'use client';

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Shield, ArrowLeft, Loader2, AlertCircle, KeyIcon, Check } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from "@/components/Logo";
import { useSecurity } from "@/contexts/SecurityContext";
import { useAuth } from "@/components/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { checkSupabaseConnection, devSignIn } from '@/utils/supabase/client';
import { ENV } from '@/utils/env-adapter';
import { IS_DEV } from '@/utils/environment';
import { useTurnstile } from '@/components/TurnstileProvider';
import { clearTurnstileWidgets } from '@/components/auth/TurnstileWidget';

// Safely check for development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Simple placeholder for development mode functions
const devHelpers = {
  setDevEnvironmentVariables: () => {
    console.log('Development environment variables initialized');
  },
  checkDevAuthEnvironment: () => {
    console.log('Development environment checked');
    return { isValid: true };
  }
};

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
  
  // Use our Turnstile hook
  const { token: captchaToken, resetToken: resetCaptchaToken, TurnstileWidget } = useTurnstile();
  
  // Create a simple function to reset captcha
  const resetCaptcha = () => {
    if (typeof window !== 'undefined' && window.turnstile) {
      try {
        clearTurnstileWidgets();
        window.turnstile.reset();
      } catch (error) {
        console.error('Error resetting captcha:', error);
      }
    }
  };

  // Handle captcha token verification
  const onVerify = (token: string) => {
    console.log('Captcha verified, token available');
  };
  
  // Show CAPTCHA after first failed attempt or in production
  const [showCaptcha, setShowCaptcha] = useState(true);
  
  // Add useEffect to ensure client-side only rendering for the form
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Development mode bypass for CAPTCHA
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !captchaToken && showCaptcha) {
      // Simulate a successful verification with a bypass token in development mode
      const timer = setTimeout(() => {
        console.log('🔒 Turnstile: Development mode verification token set');
        if (resetCaptchaToken) {
          resetCaptchaToken('1x00000000000000000000AA');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [captchaToken, showCaptcha, resetCaptchaToken]);
  
  // Effect to check if email needs confirmation
  useEffect(() => {
    if (needsConfirmation) {
      setShowConfirmationAlert(true);
    }
  }, [needsConfirmation]);
  
  // In development mode, set environment variables and run diagnostics
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('🔑 SIGN IN: Running in development mode, setting up dev environment');
      
      try {
        // Ensure captcha is disabled for development mode
        if (typeof window !== 'undefined') {
          // These global variables might help bypass captcha in some Supabase versions
          (window as any).SUPABASE_AUTH_CAPTCHA_DISABLE = true;
          (window as any).SKIP_AUTH_CAPTCHA = true;
          (window as any).NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE = true;
          
          // Import our environment utility
          import('@/utils/env').then(module => {
            // Inject environment variables to window
            if (module.injectEnvToWindow) {
              module.injectEnvToWindow();
            }
            
            // Get the environment values 
            const supabaseUrl = module.ENV.SUPABASE_URL;
            const supabaseAnonKey = module.ENV.SUPABASE_ANON_KEY;
            
            // Explicitly set Supabase URL and Anon Key
            if (!window.NEXT_PUBLIC_SUPABASE_URL) {
              console.log('🔑 SIGN IN: Setting NEXT_PUBLIC_SUPABASE_URL explicitly', supabaseUrl ? '✅' : '❌');
              window.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
            }
            
            if (!window.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
              console.log('🔑 SIGN IN: Setting NEXT_PUBLIC_SUPABASE_ANON_KEY explicitly', supabaseAnonKey ? '✅' : '❌');
              window.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey;
            }
          }).catch(error => {
            console.warn('🔑 SIGN IN: Error importing env module:', error);
          });
        }
        
        // Import the devAuth functions dynamically to avoid circular dependencies
        import('@/utils/devAuth').then((module) => {
          // Set development environment variables
          if (module.setDevEnvironmentVariables) {
            module.setDevEnvironmentVariables();
          }
          
          // Run diagnostics
          try {
            if (module.checkDevAuthEnvironment) {
              module.checkDevAuthEnvironment();
            }
          } catch (error) {
            console.warn('🔑 SIGN IN: Error running dev auth diagnostics:', error);
            // Continue anyway, as this is not critical
          }
        }).catch(error => {
          console.warn('🔑 SIGN IN: Error importing devAuth module:', error);
        });
      } catch (error) {
        console.warn('🔑 SIGN IN: Error setting up dev environment:', error);
        // Continue anyway, as this is not critical for the sign-in page to function
      }
    }
  }, []);
  
  // Store the intended redirect path in session storage when the component mounts
  // This ensures that if auth is interrupted, we can still redirect correctly afterward
  useEffect(() => {
    if (typeof window !== 'undefined' && redirectPath) {
      try {
        sessionStorage.setItem('auth_redirect_path', redirectPath);
      } catch (e) {
        console.warn('Failed to store redirect path in session storage', e);
      }
    }
  }, [redirectPath]);
  
  // Enhanced redirect handling after successful authentication
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Get the stored redirect path or use the current one
      let finalRedirectPath = redirectPath;
      try {
        const storedPath = sessionStorage.getItem('auth_redirect_path');
        if (storedPath) {
          finalRedirectPath = storedPath;
          // Clear the stored path after using it
          sessionStorage.removeItem('auth_redirect_path');
        }
      } catch (e) {
        console.warn('Failed to retrieve redirect path from session storage', e);
      }

      // Show loading state during redirection
      setIsSubmitting(true);
      
      // Use a timeout to show a loading state briefly before redirecting
      // This helps users understand that something is happening
      setTimeout(() => {
        router.push(finalRedirectPath || '/dashboard');
      }, 800);
    }
  }, [isAuthenticated, authLoading, router, redirectPath]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        // Use the auth context to check if we're connected
        // This avoids creating another supabase client instance
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus({
          isConnected,
          error: isConnected ? null : "Failed to connect to authentication service"
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      // Reset errors after a delay
      const timer = setTimeout(() => {
        setFormErrors((prev) => ({
          ...prev,
          email: undefined,
          password: undefined
        }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [formErrors]);
  
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
  
  // Handle form submission with improved security and user feedback
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFormErrors({});
    
    try {
      // Clear any previous captcha widgets
      if (typeof window !== 'undefined' && window.turnstile) {
        clearTurnstileWidgets();
      }
      
      // Get the captcha token if available
      let captchaToken = captchaToken;
      
      // Log authentication attempt
      console.log('Login attempt:', { 
        email: formData.email,
        hasCaptchaToken: !!captchaToken,
        isDev: IS_DEV
      });
      
      // Pass captcha token to login function, when available
      const loginOptions = captchaToken ? { captchaToken } : {};
      
      // Call login from the useAuth hook
      const result = await login(formData.email, formData.password, loginOptions);
      
      if (result.success) {
        // Store successful email in local storage for future convenience
        if (rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('remembered_email', formData.email);
        }
        
        // Success notification
        console.log('Login successful, redirecting...');
        
        // Navigate to the redirect path or dashboard
        router.push(redirectPath || '/dashboard');
      } else {
        // Handle login error
        console.error('Login failed:', result.error);
        
        let errorMessage = result.error || 'Authentication failed';
        
        // Special handling for common errors
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('captcha')) {
            errorMessage = 'Security verification failed. Please try again or refresh the page.';
            // Reset captcha on captcha errors
            resetCaptcha();
          } else if (errorMessage.includes('credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          }
        }
        
        setFormErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      
      // Format error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setFormErrors({ general: errorMessage });
      
      // Reset captcha on errors
      resetCaptcha();
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Render error message for a field
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName] ? (
      <div className="text-sm text-red-500 mt-1">
        {formErrors[fieldName]}
      </div>
    ) : null;
  };

  // Keep our local implementation of handleDevSignIn
  const [isDevSigningIn, setIsDevSigningIn] = useState(false);
  
  const handleDevSignIn = async (role: 'admin' | 'user') => {
    if (!IS_DEV) {
      console.warn('Dev sign-in attempted in production mode');
      setFormErrors({ general: 'Development sign-in is not available in production' });
      return;
    }

    setIsDevSigningIn(true);
    setIsLoading(true);
    setFormErrors({});

    try {
      // Use email based on role
      const email = role === 'admin' ? 'admin@example.com' : 'user@example.com';
      const password = 'password123';  // Safe to expose as it's only for development

      console.log(`🔑 Dev sign-in: Using role ${role} with email ${email}`);
      
      // Use our enhanced development sign-in utility to bypass captcha
      const result = await devSignIn(email, password);
      
      if (!result.error) {
        console.log('🎉 Dev sign-in successful');
        router.push(redirectPath || '/dashboard');
      } else {
        console.error('❌ Dev sign-in failed:', result.error);
        setFormErrors({ general: `Dev login failed: ${result.error.message || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('❌ Error during dev sign-in:', error);
      setFormErrors({ 
        general: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setIsLoading(false);
      setIsDevSigningIn(false);
    }
  };

  // Add this effect to clean up Turnstile widgets when the component mounts/unmounts
  useEffect(() => {
    // Clear any existing Turnstile widgets when this component mounts
    clearTurnstileWidgets();
    
    // Create a key to force re-render of Turnstile only when actually needed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && showCaptcha) {
        // If page becomes visible and captcha should be shown, force cleanup and refresh
        clearTurnstileWidgets();
      }
    };
    
    // Handle visibility changes (switching tabs, etc.)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Clean up when component unmounts
      clearTurnstileWidgets();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showCaptcha]);

  // Check if we have a remembered email and pre-fill it
  useEffect(() => {
    if (typeof window !== 'undefined' && !formData.email) {
      try {
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail) {
          setFormData(prev => ({ ...prev, email: rememberedEmail }));
          setRememberMe(true);
        }
      } catch (e) {
        console.warn('Failed to retrieve remembered email', e);
      }
    }
  }, [formData.email]);

  // Simplify captcha rendering
  const renderCaptcha = () => {
    // Only render captcha in production or if explicitly enabled in development
    if (process.env.NODE_ENV === 'production' || 
        (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA_IN_DEV === 'true')) {
      return (
        <div className="my-4">
          <div id="turnstile-container" className="flex justify-center"></div>
          {TurnstileWidget}
        </div>
      );
    }
    return null;
  };

  const renderLogo = () => (
    <div className="mb-6 flex flex-col items-center">
      <Link href="/" className="inline-block">
        <Logo className="h-12 w-auto" isLink={false} />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
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
          {/* Mobile logo only visible on small screens */}
          <div className="md:hidden mb-6">
            {renderLogo()}
          </div>
          
          <div className="flex flex-col mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground mb-2">
              Sign in to your account
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
                {process.env.NODE_ENV === 'development' && (
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-border">
                    <h3 className="font-medium text-gray-900 dark:text-foreground">Developer Testing</h3>
                    <div className="flex flex-row gap-4">
                      <Button
                        onClick={() => handleDevSignIn('admin')}
                        disabled={isDevSigningIn}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground"
                      >
                        Admin Login
                      </Button>
                      <Button
                        onClick={() => handleDevSignIn('user')}
                        disabled={isDevSigningIn}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground"
                      >
                        User Login
                      </Button>
                    </div>
                    {isDevSigningIn && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Signing in...
                      </div>
                    )}
                  </div>
                )}
                
                {/* Login Form */}
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
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            setRememberMe(checked);
                          }
                        }}
                        className="border-gray-300 dark:border-border text-[#1DB954] focus:ring-[#1DB954]"
                      />
                      <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                  </div>

                  {/* General error message */}
                  {formErrors.general && (
                    <Alert variant="destructive" className="border border-red-200 dark:border-red-900/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {typeof formErrors.general === 'object' ? 
                          (formErrors.general instanceof Error ? 
                            formErrors.general.message : 
                            JSON.stringify(formErrors.general)) : 
                          formErrors.general}
                      </AlertDescription>
                    </Alert>
                  )}

                  {renderCaptcha()}

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
  );
} 