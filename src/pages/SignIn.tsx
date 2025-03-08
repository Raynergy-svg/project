import { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Shield, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useSecurity } from "@/contexts/SecurityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDevSignIn } from "@/utils/useDevSignIn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IS_DEV } from '@/utils/environment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkSupabaseConnection, supabase } from '@/utils/supabase/client';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignIn() {
  const { sensitiveDataHandler } = useSecurity();
  const auth = useAuth();
  const { isAuthenticated, isLoading: authLoading, login } = auth || {};
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

  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse the redirect URL from search params
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('from') || '/dashboard';
  const sessionExpired = searchParams.get('session') === 'expired';
  
  // Check Supabase connection to help diagnose auth issues
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        // Local development detection without relying on environment flags
        const isLocalDevelopment = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1');
        
        // Use our connection check method
        const connectionCheck = await checkSupabaseConnection();
        
        // Special handling for local development
        if (isLocalDevelopment) {
          console.log('Local development: Connection check simplified');
          setConnectionStatus({
            isConnected: true,
            error: null
          });
          return;
        }
        
        // For production, properly handle the connection status
        setConnectionStatus({
          isConnected: connectionCheck.success,
          error: connectionCheck.message || null
        });
        
        if (!connectionCheck.success) {
          console.error('Supabase connection failed:', connectionCheck.message);
          setSecurityMessage('We\'re having trouble connecting to our servers. Please try again later.');
        } else {
          console.log('Supabase connection verified successfully:', connectionCheck.status);
        }
      } catch (err) {
        console.error('Error checking Supabase connection:', err);
        
        // In local development, don't show connection errors
        const isLocalDevelopment = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1');
        
        if (isLocalDevelopment) {
          setConnectionStatus({
            isConnected: true,
            error: null
          });
          return;
        }
        
        // In production, show connection errors
        setConnectionStatus({
          isConnected: false,
          error: err instanceof Error ? err.message : 'Connection check failed'
        });
        setSecurityMessage('We\'re having trouble connecting to our servers. Please try again later.');
      }
    };
    
    verifyConnection();
  }, []);
  
  useEffect(() => {
    // Try to get saved email from localStorage if exists
    const getSavedEmail = async () => {
      try {
        const savedEmail = localStorage.getItem('lastUsedEmail');
        const emailIv = localStorage.getItem('lastUsedEmail_iv');
        
        if (savedEmail && emailIv && 
            sensitiveDataHandler && 
            typeof sensitiveDataHandler.decryptSensitiveData === 'function') {
          try {
            const decryptedEmail = await sensitiveDataHandler.decryptSensitiveData(
              savedEmail,
              emailIv
            );
            setFormData(prev => ({ ...prev, email: decryptedEmail }));
            setRememberMe(true);
          } catch (decryptError) {
            console.error('Error decrypting saved email:', decryptError);
            // Clear potentially corrupted data
            localStorage.removeItem('lastUsedEmail');
            localStorage.removeItem('lastUsedEmail_iv');
          }
        }
      } catch (error) {
        console.error('Error loading saved email:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('lastUsedEmail');
        localStorage.removeItem('lastUsedEmail_iv');
      }
    };
    
    getSavedEmail();
  }, [sensitiveDataHandler]);

  // Reset error when user types
  useEffect(() => {
    setFormErrors({});
  }, [formData]);

  // Handle rate limiting
  useEffect(() => {
    if (failedAttempts >= 3) {
      const timer = setTimeout(() => setFailedAttempts(0), 30000);
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  // Check for email confirmation error in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('needsConfirmation') === 'true') {
      setShowConfirmationAlert(true);
    }
  }, [location]);

  // Check for session expiration
  useEffect(() => {
    if (sessionExpired) {
      setSecurityMessage('Your session has expired due to inactivity. Please sign in again.');
    }
  }, [sessionExpired]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, authLoading, navigate, redirectTo]);
  
  useEffect(() => {
    // Check if we have cached login validation errors
    const errors = sessionStorage.getItem('login_errors');
    if (errors) {
      try {
        const parsedErrors = JSON.parse(errors);
        setFormErrors(parsedErrors);
        sessionStorage.removeItem('login_errors'); // Clear after using
      } catch (e) {
        console.error('Error parsing login errors from session storage:', e);
        sessionStorage.removeItem('login_errors');
      }
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (sensitiveDataHandler && typeof sensitiveDataHandler.validateSensitiveData === 'function') {
      if (!sensitiveDataHandler.validateSensitiveData(formData.email, 'email')) {
        newErrors.email = "Please enter a valid email address";
      }
    } else {
      // Basic email validation fallback if sensitiveDataHandler is not available
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, sensitiveDataHandler]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when field is edited
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // Helper function to handle sign in errors
  const handleSignInError = (error: unknown) => {
    // Reset submitting state
    setIsSubmitting(false);
    
    console.log('Processing sign-in error:', error);
    
    // Check for network connectivity issues first
    if (!navigator.onLine) {
      setFormErrors({
        general: 'You appear to be offline. Please check your internet connection and try again.'
      });
      return;
    }
    
    // Format the error message based on the type of error
    if (error instanceof Error) {
      // Handle specific error messages with user-friendly text
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('invalid') && 
          (errorMessage.includes('email') || errorMessage.includes('password') || errorMessage.includes('credentials'))) {
        // Invalid credentials
        setFormErrors({
          general: 'Invalid email or password. Please check your credentials and try again.'
        });
      } else if (errorMessage.includes('confirm') && errorMessage.includes('email')) {
        // Email not confirmed
        setFormErrors({
          general: 'Your email address has not been confirmed. Please check your inbox for a confirmation link.'
        });
      } else if (errorMessage.includes('too many') || errorMessage.includes('rate limit')) {
        // Rate limiting
        setFormErrors({
          general: 'Too many sign-in attempts. Please wait a moment and try again later.'
        });
      } else if (errorMessage.includes('server') && errorMessage.includes('issues')) {
        // Server issues
        setFormErrors({
          general: 'Our servers are experiencing issues. Please try again later.'
        });
      } else {
        // Generic error with the exact message
        setFormErrors({
          general: error.message
        });
      }
    } else {
      // Unknown error type
      setFormErrors({
        general: 'An unexpected error occurred during sign-in. Please try again.'
      });
    }
    
    // When there's an error, make sure the form doesn't stay in loading state
    setIsSubmitting(false);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // Validate form data
      const validationResult = validateForm();
      if (!validationResult) {
        setFormErrors(formErrors);
        return;
      }
      
      // Clear previous errors
      setFormErrors({});
      setIsSubmitting(true);
      
      try {
        const { email, password } = formData;
        // Sanitize inputs for extra security
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password;
        
        console.log('Attempting to sign in with standard auth flow:', sanitizedEmail);
        
        // For development, we use the special dev account flow
        if (IS_DEV && sanitizedEmail === 'dev@example.com') {
          try {
            // Call the development sign-in function
            const devResult = await handleDevSignIn(sanitizedEmail, sanitizedPassword);
            
            if (!devResult.success) {
              throw new Error(devResult.message || 'Development authentication failed');
            }
            
            // If no error is thrown, login was successful
            handleSuccessfulLogin(sanitizedEmail);
            console.log('Development login successful');
          } catch (devError) {
            console.error('Development login failed:', devError);
            throw devError; // Re-throw to handle in the catch block
          }
        } else {
          // Standard authentication flow using Supabase client
          console.log('Using standard Supabase auth');
          
          // Check if login function is available from AuthContext
          if (!auth || !login) {
            throw new Error('Authentication service is not available');
          }
          
          // Use the standard login function
          await login(sanitizedEmail, sanitizedPassword);
          
          // Handle successful login
          handleSuccessfulLogin(sanitizedEmail);
          console.log('Login successful');
        }
      } catch (error) {
        console.error('Sign-in error:', error);
        handleSignInError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, formErrors, auth, login, handleDevSignIn, handleSignInError]
  );
  
  // Function to handle successful login actions
  const handleSuccessfulLogin = async (email: string) => {
    // Save email if remember me is checked
    if (rememberMe && sensitiveDataHandler && typeof sensitiveDataHandler.encryptSensitiveData === 'function') {
      try {
        const { encryptedData: encryptedEmail, iv: emailIv } = await sensitiveDataHandler.encryptSensitiveData(email);
        localStorage.setItem('lastUsedEmail', encryptedEmail);
        localStorage.setItem('lastUsedEmail_iv', emailIv);
      } catch (encryptError) {
        console.error('Failed to encrypt email for storage:', encryptError);
        // Still continue with login even if saving email fails
      }
    } else if (!rememberMe) {
      localStorage.removeItem('lastUsedEmail');
      localStorage.removeItem('lastUsedEmail_iv');
    }
    
    // The useEffect hook will handle navigation if isAuthenticated becomes true
  };

  // Update form errors if there are errors from the useDevSignIn hook
  useEffect(() => {
    if (devSignInError) {
      setFormErrors(prev => ({ ...prev, general: devSignInError }));
    }
  }, [devSignInError]);

  // Calculate if button should be disabled
  const isButtonDisabled = isSubmitting || authLoading || devSignInLoading || failedAttempts >= 3;

  // Function to handle magic link button click
  const handleMagicLinkButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!formData.email) {
      setFormErrors({
        email: "Email is required for magic link sign in"
      });
      return;
    }
    
    // Find the form and submit it
    const form = document.getElementById('signin-form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  // Function to handle magic link form submission
  const handleMagicLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.email) {
      setFormErrors({
        email: "Email is required for magic link sign in"
      });
      return;
    }
    
    const sanitizedEmail = formData.email.trim().toLowerCase();
    setIsSubmitting(true);
    
    try {
      console.log('Sending magic link to:', sanitizedEmail);
      
      // Use standard Supabase auth for magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: sanitizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      // If no error, magic link was sent successfully
      setMagicLinkSent(true);
      console.log('Magic link sent successfully');
    } catch (error) {
      console.error('Error sending magic link:', error);
      
      setFormErrors({
        general: error instanceof Error 
          ? error.message 
          : 'Failed to send magic link. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated, don't render the form
  if (isAuthenticated && !authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white py-4 px-4">
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:text-[#88B04B] transition-colors group"
          aria-label="Return to home page"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <Logo size="sm" showText={false} isLink={false} />
        </Link>
      </div>
        
      <div className="max-w-md mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#88B04B]">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue your debt-free journey</p>
        </div>
        
        {showConfirmationAlert && (
         <Alert variant="warning" className="mb-6 bg-yellow-900/20 border-yellow-700">
           <AlertCircle className="h-4 w-4 text-yellow-500" />
           <AlertTitle>Email Confirmation Required</AlertTitle>
           <AlertDescription>
             Please check your email inbox for a confirmation link. You need to verify your email before signing in.
             <button 
               onClick={() => navigate('/signup')} 
               className="text-yellow-400 hover:text-yellow-300 underline mt-1 block"
             >
               Need to resend the confirmation email?
             </button>
           </AlertDescription>
          </Alert>
        )}
        
        {securityMessage && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-700">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription className="text-blue-300">
              {securityMessage}
              <Button 
                variant="link" 
                className="pl-0 text-blue-400 hover:text-blue-300"
                onClick={() => setSecurityMessage(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus && !connectionStatus.isConnected && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="text-red-300">
              We're having trouble connecting to our authentication servers. 
              This may be why you can't sign in. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="text-sm font-medium">{formErrors.general}</p>
                {formErrors.general.includes('servers are experiencing issues') && (
                  <p className="text-xs mt-1">We're working on fixing this. Please try again in a few moments.</p>
                )}
                {formErrors.general.includes('temporarily unavailable') && (
                  <p className="text-xs mt-1">Our authentication service is being updated. Please try again soon.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#88B04B]/10 flex items-center justify-center rounded-full">
              <Lock className="text-[#88B04B] w-6 h-6" />
            </div>
          </div>

          {!useMagicLink ? (
            <form 
              id="signin-form"
              onSubmit={handleSubmit} 
              className="space-y-6 w-full max-w-sm mx-auto"
            >
              <div className="hidden">
                <input 
                  type="text" 
                  name="honeypot" 
                  id="honeypot"
                  tabIndex={-1} 
                  autoComplete="off" 
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="email"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    className="w-full"
                    placeholder="email@example.com"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <div className="text-sm">
                      <Link to="/forgot-password" className="text-white hover:text-gray-300 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      className="w-full pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    name="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                
                <Button
                  type="submit"
                  id="sign-in-button"
                  name="sign-in-button"
                  className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  disabled={isButtonDisabled}
                >
                  {isSubmitting || authLoading || devSignInLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setUseMagicLink(true)}
                  className="text-white hover:text-gray-300 text-sm font-medium hover:underline"
                >
                  Or sign in with a magic link instead
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {magicLinkSent ? (
                <div className="bg-green-50 border border-green-400 p-4 rounded-md">
                  <h3 className="font-medium text-green-800">Magic Link Sent!</h3>
                  <p className="text-green-700 mt-1">
                    We've sent a sign-in link to <span className="font-medium">{formData.email}</span>. 
                    Please check your email to continue.
                  </p>
                  <p className="text-green-700 mt-3 text-sm">
                    Don't see it? Check your spam folder or 
                    <button 
                      type="button"
                      onClick={handleMagicLinkButtonClick}
                      className="text-green-800 font-medium hover:underline ml-1"
                    >
                      try again
                    </button>.
                  </p>
                </div>
              ) : (
                <form 
                  id="signin-form"
                  onSubmit={handleMagicLinkSubmit}
                >
                  <div className="space-y-4">
                    <div>
                      <label 
                        htmlFor="email-magic"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Email Address
                      </label>
                      <Input
                        type="email"
                        id="email-magic"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        className="w-full"
                        placeholder="email@example.com"
                        required
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm">
                      We'll email you a magic link that will sign you in instantly. No password needed!
                    </p>
                    
                    <Button
                      type="submit"
                      className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Magic Link
                          <ArrowRight size={20} />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseMagicLink(false);
                    setMagicLinkSent(false);
                  }}
                  className="text-white hover:text-gray-300 text-sm font-medium hover:underline"
                >
                  Or sign in with password instead
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-gray-300 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#88B04B] hover:text-[#7a9d43] transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer with security info and links */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <Lock className="w-4 h-4 text-[#88B04B]" />
            <span className="text-sm">Your information is secured with 256-bit SSL encryption</span>
          </div>
          
          <div className="text-sm text-gray-500">
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <span className="mx-2">•</span>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
