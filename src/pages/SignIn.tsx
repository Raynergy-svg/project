import { useState, useCallback, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useSecurity } from "@/contexts/SecurityContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });
  
  useEffect(() => {
    // Try to get saved email from localStorage if exists
    const getSavedEmail = async () => {
      try {
        const savedEmail = localStorage.getItem('lastUsedEmail');
        if (savedEmail) {
          const decryptedEmail = await sensitiveDataHandler.decryptSensitiveData(
            savedEmail,
            localStorage.getItem('lastUsedEmail_iv') || ''
          );
          setFormData(prev => ({ ...prev, email: decryptedEmail }));
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Reset error when user types
  useEffect(() => {
    setErrors({});
  }, [formData]);

  // Handle rate limiting
  useEffect(() => {
    if (failedAttempts >= 3) {
      const timer = setTimeout(() => setFailedAttempts(0), 30000);
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!sensitiveDataHandler.validateSensitiveData(formData.email, 'email')) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, sensitiveDataHandler]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (failedAttempts >= 3) {
        setErrors({ general: "Too many failed attempts. Please try again in 30 seconds." });
        return;
      }

      if (validateForm()) {
        setIsSubmitting(true);
        try {
          // Sanitize sensitive data before sending
          const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
          const sanitizedPassword = sensitiveDataHandler.sanitizeSensitiveData(formData.password);
          
          // Attempt to login
          await login(sanitizedEmail, sanitizedPassword);
          
          // Save encrypted email if remember me is checked
          if (rememberMe) {
            const { encryptedData: encryptedEmail, iv: emailIv } = await sensitiveDataHandler.encryptSensitiveData(sanitizedEmail);
            localStorage.setItem('lastUsedEmail', encryptedEmail);
            localStorage.setItem('lastUsedEmail_iv', emailIv);
          } else {
            localStorage.removeItem('lastUsedEmail');
            localStorage.removeItem('lastUsedEmail_iv');
          }
          
          // Navigate to dashboard or return URL
          const returnUrl = new URLSearchParams(location.search).get('returnUrl');
          navigate(returnUrl || '/dashboard');
        } catch (error) {
          console.error('Login error:', error);
          setErrors({ general: "Invalid email or password" });
          setFailedAttempts(prev => prev + 1);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [formData, validateForm, navigate, location, failedAttempts, rememberMe, sensitiveDataHandler, login]
  );

  return (
    <div role="main" className="min-h-screen text-white">
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:text-[#88B04B] transition-colors group"
          aria-label="Return to home page"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <Logo size="sm" showText={false} isLink={false} />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Sign in to continue managing your debt-free journey
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start max-w-4xl mx-auto">
          {/* Sign In Form */}
          <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">Sign In to Your Account</h2>
            
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
                <p className="text-red-400">{errors.general}</p>
              </div>
            )}
            
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
                    errors.email ? "border-red-500" : "border-white/10"
                  } focus:outline-none focus:border-[#88B04B] text-white transition-colors`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p 
                    id="email-error" 
                    className="mt-2 text-red-400 text-sm"
                    role="alert"
                  >
                    {errors.email}
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
                      errors.password ? "border-red-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors`}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                {errors.password && (
                  <p 
                    id="password-error" 
                    className="mt-2 text-red-400 text-sm"
                    role="alert"
                  >
                    {errors.password}
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
                  disabled={isSubmitting || failedAttempts >= 3}
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

          {/* Features Section */}
          <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">What's New</h2>
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 transition-colors hover:border-[#88B04B]/30">
                <h3 className="text-lg font-semibold text-[#88B04B] mb-2">
                  Smart Dashboard
                </h3>
                <p className="text-gray-300">
                  Take control of your finances with our intuitive dashboard featuring debt tracking and progress visualization.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 transition-colors hover:border-[#88B04B]/30">
                <h3 className="text-lg font-semibold text-[#88B04B] mb-2">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-300">
                  Get personalized recommendations powered by our advanced AI algorithms.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 relative transition-colors hover:border-[#88B04B]/30">
                <div className="absolute -top-2 -right-2 bg-[#88B04B]/20 text-[#88B04B] text-xs px-2 py-1 rounded-full border border-[#88B04B]/30">
                  Coming Soon
                </div>
                <h3 className="text-lg font-semibold text-[#88B04B] mb-2">
                  Mobile App
                </h3>
                <p className="text-gray-300">
                  Our mobile app is in development. Get ready for seamless debt management on iOS and Android devices.
                </p>
              </div>
            </div>
          </div>
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
              <span className="text-xs block text-gray-400">
                All sensitive data is encrypted end-to-end using AES-256-GCM encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
