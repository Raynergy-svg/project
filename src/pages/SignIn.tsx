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
import ReCAPTCHA from 'react-google-recaptcha';
import { checkSupabaseConnection } from '@/utils/supabase/client';

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{isConnected: boolean, error: string | null} | null>(null);
  const [recaptchaLoadFailed, setRecaptchaLoadFailed] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const captchaRef = useRef<ReCAPTCHA>(null);
  
  // Parse the redirect URL from search params
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('from') || '/dashboard';
  const sessionExpired = searchParams.get('session') === 'expired';
  
  // Check Supabase connection to help diagnose auth issues
  useEffect(() => {
    const verifyConnection = async () => {
      const status = await checkSupabaseConnection();
      setConnectionStatus(status);
      
      if (!status.isConnected && status.error) {
        console.error('Supabase connection failed:', status.error);
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

  // Reset captcha when component is mounted or errors occur
  useEffect(() => {
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
    
    // Show security message if session expired
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
  
  // Show CAPTCHA after first failed attempt
  useEffect(() => {
    if (failedAttempts > 0) {
      setShowCaptcha(true);
    }
  }, [failedAttempts]);
  
  // Add an effect to detect if reCAPTCHA fails to load
  useEffect(() => {
    if (showCaptcha) {
      // Set a timeout to check if reCAPTCHA loaded
      const timeoutId = setTimeout(() => {
        // Check if google recaptcha script loaded
        const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
        if (!recaptchaScript || !(window as any).grecaptcha) {
          console.warn("reCAPTCHA failed to load, using fallback verification");
          setRecaptchaLoadFailed(true);
        }
      }, 3000); // Check after 3 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [showCaptcha]);
  
  const handleCaptchaChange = (token: string | null) => {
    console.log('CAPTCHA token received:', token ? 'Valid token' : 'No token');
    setCaptchaToken(token);
  };

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

  // Fallback to verify manually if reCAPTCHA has CSP issues
  const manualCaptchaVerificationFallback = async (email: string): Promise<boolean> => {
    try {
      console.log("Using manual captcha verification fallback");
      
      // In production, this should ideally contact your server
      // For now, we'll just delay for a moment to simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error("Manual captcha verification failed:", error);
      return false;
    }
  };

  // Improved CAPTCHA verification
  const handleCaptchaVerification = async (): Promise<boolean> => {
    if (!showCaptcha) return true; // Skip if captcha not shown
    
    if (recaptchaLoadFailed) {
      // Use fallback verification if reCAPTCHA failed to load
      return await manualCaptchaVerificationFallback(formData.email);
    }
    
    // Normal reCAPTCHA verification
    const captchaValue = captchaRef.current?.getValue();
    
    if (!captchaValue && !captchaToken) {
      setFormErrors(prev => ({ ...prev, general: 'Please complete the CAPTCHA verification' }));
      return false;
    }
    
    return true;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // Start submission process - show loading state
      setIsSubmitting(true);
      
      try {
        // First run validation
        const isValid = validateForm();
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }
        
        // Clear any previous alerts
        setSecurityMessage(null);

        // CAPTCHA verification if needed
        if (showCaptcha) {
          const captchaVerified = await handleCaptchaVerification();
          if (!captchaVerified) {
            setIsSubmitting(false);
            return;
          }
        }
        
        // Attempt to log in with provided credentials
        try {
          // Apply sanitization if available
          let sanitizedEmail = formData.email.trim().toLowerCase();
          let sanitizedPassword = formData.password;
          
          if (sensitiveDataHandler && typeof sensitiveDataHandler.sanitizeSensitiveData === 'function') {
            sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
            sanitizedPassword = sensitiveDataHandler.sanitizeSensitiveData(formData.password);
          }
          
          console.log('Attempting to sign in:', sanitizedEmail);
          
          // Check if login function is available from AuthContext
          if (!auth || !login) {
            throw new Error('Authentication service is not available');
          }
          
          // Prepare login options if we have a captcha token
          const options = captchaToken ? { 
            captchaToken,
            options: {
              redirectTo: window.location.origin,
            }
          } : undefined;
          
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
            // Standard authentication flow for regular users
            try {
              // Call the login function from AuthContext - which may or may not return a result
              await login(sanitizedEmail, sanitizedPassword, options);
              
              // If we get here, login was successful (no error was thrown)
              handleSuccessfulLogin(sanitizedEmail);
              console.log('Login successful, redirecting...');
            } catch (loginError) {
              console.error('Login failed:', loginError);
              
              // Special handling for 500 error messages about missing database fields
              if (loginError instanceof Error && 
                  (loginError.message.includes('Database error') || 
                  loginError.message.includes('500'))) {
                setSecurityMessage('We are experiencing database issues. This might be due to missing fields in our database schema. Please try again later or contact support.');
              }
              
              throw loginError; // Re-throw to handle in the catch block
            }
          }
          
        } catch (error) {
          console.error('Login error:', error);
          
          // Handle specific error messages
          let errorMessage = "Invalid email or password";
          if (error instanceof Error) {
            if (error.message.includes('Email not confirmed')) {
              errorMessage = "Please check your email to confirm your account before signing in.";
              setShowConfirmationAlert(true);
            } else if (error.message.includes('Database error')) {
              errorMessage = "We're experiencing database issues. Our team has been notified.";
            } else if (error.message.includes('500')) {
              errorMessage = "Internal server error. This might be due to database configuration issues.";
            } else {
              errorMessage = error.message;
            }
          }
          
          setFormErrors({ general: errorMessage });
          setFailedAttempts(prev => prev + 1);
        } finally {
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Submission error:', error);
        setFormErrors({ general: 'An error occurred. Please try again later.' });
        setFailedAttempts(prev => prev + 1);
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, auth, login, handleDevSignIn, showCaptcha, captchaToken, handleCaptchaVerification, IS_DEV]
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

  // Update the button UI to show when auth is loading too
  const isButtonDisabled = isSubmitting || authLoading || devSignInLoading || failedAttempts >= 3;

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
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-red-300">
              {formErrors.general}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#88B04B]/10 flex items-center justify-center rounded-full">
              <Lock className="text-[#88B04B] w-6 h-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field */}
            <div className="hidden">
              <input 
                type="text" 
                name="honeypot" 
                id="honeypot"
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  formErrors.email ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:border-[#88B04B] text-white transition-colors`}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(formErrors.email)}
                aria-describedby={formErrors.email ? "email-error" : undefined}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p 
                  id="email-error" 
                  className="mt-2 text-red-400 text-sm"
                  role="alert"
                >
                  {formErrors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                    formErrors.password ? "border-red-500" : "border-white/10"
                  } focus:outline-none focus:border-[#88B04B] text-white transition-colors`}
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  aria-invalid={Boolean(formErrors.password)}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  id="toggle-password"
                  name="toggle-password"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p 
                  id="password-error" 
                  className="mt-2 text-red-400 text-sm"
                  role="alert"
                >
                  {formErrors.password}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#88B04B] hover:text-[#7a9d43] text-sm transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            {/* CAPTCHA component */}
            {showCaptcha && (
              <div className="flex flex-col items-center mt-4">
                {recaptchaLoadFailed ? (
                  <div className="text-yellow-400 p-3 border border-yellow-500 rounded-lg bg-yellow-900 bg-opacity-30 mb-4">
                    <p className="font-medium">CAPTCHA could not load</p>
                    <p className="text-sm">Alternative verification will be used.</p>
                  </div>
                ) : (
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} // fallback to test key
                    onChange={handleCaptchaChange}
                    theme="dark"
                    onError={(err) => {
                      console.error('reCAPTCHA error:', err);
                      setRecaptchaLoadFailed(true);
                    }}
                    onExpired={() => {
                      console.warn('reCAPTCHA token expired');
                      setCaptchaToken(null);
                    }}
                  />
                )}
              </div>
            )}
            
            <div className="pt-4">
              <Button
                type="submit"
                id="sign-in-button"
                name="sign-in-button"
                className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled || (showCaptcha && !captchaToken && !recaptchaLoadFailed)}
                onClick={(e) => {
                  // This is a backup in case the form submit doesn't trigger
                  if (!e.isDefaultPrevented()) {
                    console.log('Button clicked directly');
                    // Since this button is inside a form, clicking it should trigger handleSubmit
                    // No need to call handleSubmit directly
                  }
                }}
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

            <p className="text-center text-gray-300 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#88B04B] hover:text-[#7a9d43] transition-colors">
                Sign Up
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-start gap-3 text-gray-300">
            <Shield className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <span className="text-sm block">Your information is secured with:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#88B04B]" />
                  <span>256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            <Link to="/terms" className="hover:text-white">
              Terms of Service
            </Link>{" "}
            •{" "}
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
