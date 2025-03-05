import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const captchaRef = useRef<ReCAPTCHA>(null);
  
  // Check if the user was redirected here after session expiry
  const sessionExpired = new URLSearchParams(location.search).get('session_expired') === 'true';
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Show security message if session expired
    if (sessionExpired) {
      setSecurityMessage({
        type: 'warning',
        message: 'Your session has expired due to inactivity',
        details: 'Please sign in again to continue.'
      });
    }
  }, [isAuthenticated, navigate, sessionExpired]);
  
  useEffect(() => {
    // Show CAPTCHA after first failed attempt
    if (failedAttempts > 0) {
      setShowCaptcha(true);
    }
  }, [failedAttempts]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      // Clear CAPTCHA-related errors when completed
      if (formErrors.general?.includes('CAPTCHA')) {
        setFormErrors(prev => ({ ...prev, general: undefined }));
      }
    }
  };
  
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    
    // Clear previous messages
    setSecurityMessage(null);

    // Validate inputs before submitting
    const validationErrors: FormErrors = {};
    
    if (!formData.email) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    
    // If CAPTCHA is required and not completed
    if (failedAttempts > 0 && showCaptcha && !captchaToken) {
      validationErrors.general = 'Please complete the CAPTCHA verification';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Attempt login with the provided credentials
      const { success, error } = await login(
        formData.email,
        formData.password,
        captchaToken || undefined
      );
      
      if (success) {
        // Success, will be redirected by the auth listener
        setFailedAttempts(0);
        setSecurityMessage({
          type: 'success',
          message: 'Sign in successful! Redirecting...'
        });
        
        // Let the user see the success message briefly before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // Handle login failure
        setFailedAttempts(prev => prev + 1);
        
        // Reset CAPTCHA if present
        if (captchaRef.current) {
          captchaRef.current.reset();
          setCaptchaToken(null);
        }
        
        if (error) {
          // Special handling for development environment errors
          if (error.includes('Development environment setup incomplete')) {
            setSecurityMessage({
              type: 'warning',
              message: error,
              details: 'This is a development-only issue. Some database tables might be missing. Try using the development credentials: dev@example.com / development'
            });
          } 
          // Handle specific errors with more helpful messages
          else if (error.includes('404') || error.includes('technical difficulties')) {
            setSecurityMessage({
              type: 'error',
              message: 'Service temporarily unavailable',
              details: 'Our authentication service is currently experiencing issues. Please try again later.'
            });
          }
          // Network-related errors
          else if (error.includes('NetworkError') || error.includes('Failed to fetch')) {
            setSecurityMessage({
              type: 'error',
              message: 'Network connection issue',
              details: 'Please check your internet connection and try again.'
            });
          }
          // General errors
          else {
            setFormErrors({ general: error });
          }
        } else {
          setFormErrors({ general: 'Authentication failed. Please try again.' });
        }
        
        // If too many failed attempts, show a password reset suggestion
        if (failedAttempts >= 2) {
          setSecurityMessage({
            type: 'warning',
            message: 'Having trouble signing in?',
            details: 'You\'ve had multiple failed login attempts. Consider resetting your password.'
          });
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Handle unexpected errors
      setFormErrors({ 
        general: process.env.NODE_ENV === 'development'
          ? `Sign in error: ${err.message || 'Unknown error'}`
          : 'An unexpected error occurred. Please try again later.'
      });
      
      setFailedAttempts(prev => prev + 1);
      
      // Reset CAPTCHA if present
      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaToken(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-900 to-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-gray-300">
            Welcome back! Sign in to access your account.
          </p>
        </div>

        {formErrors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formErrors.general}</AlertDescription>
          </Alert>
        )}

        {securityMessage && (
          <Alert 
            className={`mb-4 ${
              securityMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
              securityMessage.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
              'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-start">
              {securityMessage.type === 'success' && (
                <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              )}
              {securityMessage.type === 'warning' && (
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              )}
              {securityMessage.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              )}
              <div>
                <AlertTitle className="font-semibold">
                  {securityMessage.message}
                </AlertTitle>
                {securityMessage.details && (
                  <AlertDescription className="mt-1 text-sm">
                    {securityMessage.details}
                  </AlertDescription>
                )}
                
                {/* Show password reset link for warnings */}
                {securityMessage.type === 'warning' && failedAttempts >= 3 && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2 text-sm font-medium underline"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Reset your password
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 ${formErrors.email ? 'border-red-500' : 'border-gray-700'} bg-black/50`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-300 hover:text-blue-200"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`${formErrors.password ? 'border-red-500' : 'border-gray-700'} bg-black/50 pr-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={handleRememberMeChange}
                />
                <Label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-300"
                >
                  Remember me
                </Label>
              </div>
            </div>

            {showCaptcha && (
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} 
                  onChange={handleCaptchaChange}
                  theme="dark"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-300">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-blue-300 hover:text-blue-200 font-semibold"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-800 rounded-md text-xs text-gray-400">
            <p>Development mode enabled</p>
            <p className="mt-1">You can use <code className="bg-gray-700 px-1 rounded">dev@example.com / development</code> to sign in.</p>
          </div>
        )}
      </div>
    </div>
  );
}
