import { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Shield, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useSecurity } from "@/contexts/SecurityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDevSignIn } from "@/utils/useDevSignIn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
  
  const navigate = useNavigate();
  const location = useLocation();

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

  // Move navigation to useEffect instead of during render
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (failedAttempts >= 3) {
        setFormErrors({ general: "Too many failed attempts. Please try again in 30 seconds." });
        return;
      }

      if (validateForm()) {
        setIsSubmitting(true);
        try {
          // Sanitize sensitive data
          let sanitizedEmail = formData.email;
          let sanitizedPassword = formData.password;
          
          if (sensitiveDataHandler && typeof sensitiveDataHandler.sanitizeSensitiveData === 'function') {
            sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
            sanitizedPassword = sensitiveDataHandler.sanitizeSensitiveData(formData.password);
          }
          
          // Show development mode message if in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Using direct authentication');
          }
          
          // Use our dev sign-in hook which handles authentication
          const result = await handleDevSignIn(sanitizedEmail, sanitizedPassword);
          
          if (!result.success) {
            // Handle authentication failure
            throw new Error(result.message || 'Authentication failed');
          }
          
          // If we reach here, authentication was successful
          // Save email if remember me is checked
          if (rememberMe && sensitiveDataHandler && typeof sensitiveDataHandler.encryptSensitiveData === 'function') {
            try {
              const { encryptedData: encryptedEmail, iv: emailIv } = await sensitiveDataHandler.encryptSensitiveData(sanitizedEmail);
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
        } catch (error) {
          console.error('Login error:', error);
          
          // Handle specific error messages
          let errorMessage = "Invalid email or password";
          if (error instanceof Error) {
            if (error.message.includes('Email not confirmed')) {
              errorMessage = "Please check your email to confirm your account before signing in.";
              setShowConfirmationAlert(true);
            } else {
              errorMessage = error.message;
            }
          }
          
          setFormErrors({ general: errorMessage });
          setFailedAttempts(prev => prev + 1);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [formData, validateForm, handleDevSignIn, failedAttempts, rememberMe, sensitiveDataHandler, navigate]
  );

  // Update form errors if there are errors from the useDevSignIn hook
  useEffect(() => {
    if (devSignInError) {
      setFormErrors(prev => ({ ...prev, general: devSignInError }));
    }
  }, [devSignInError]);

  // Update the button UI to show when auth is loading too
  const isButtonDisabled = isSubmitting || authLoading || devSignInLoading || failedAttempts >= 3;

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
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue your debt-free journey</p>
          
          {/* Development mode helper - only shows in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-blue-900/30 border border-blue-700/50 rounded-md text-blue-300 text-sm">
              <p>🧪 Development Mode</p>
              <p className="font-mono mt-1">{devAccountInfo}</p>
            </div>
          )}
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
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  formErrors.email ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:border-[#88B04B] text-white transition-colors`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                    formErrors.password ? "border-red-500" : "border-white/10"
                  } focus:outline-none focus:border-[#88B04B] text-white transition-colors`}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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

            <div className="pt-4">
              <button
                type="submit"
                id="sign-in-button"
                name="sign-in-button"
                className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
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
              </button>
            </div>

            <p className="text-center text-gray-300 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#88B04B] hover:text-[#7a9d43] transition-colors">
                Sign Up
              </Link>
            </p>
          </form>

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
                <span className="text-xs block text-gray-400">
                  All sensitive data is encrypted end-to-end using AES-256-GCM encryption
                </span>
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
