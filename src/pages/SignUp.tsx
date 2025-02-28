import { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema } from '@/lib/utils/validation';
import { z } from 'zod';
import { useSecurity } from '@/contexts/SecurityContext';
import type { SignUpData } from '@/types';

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  selectedTier: string;
  name: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
  acceptTerms?: string;
}

interface PaymentResult {
  subscriptionId: string;
  oneTimePaymentIntentId?: string;
}

interface CheckoutResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  message?: string;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: "Free for 7 days, then $9.99/mo",
    description: "Essential tools to start your debt-free journey with AI-powered insights",
    features: [
      "AI-powered debt analysis",
      "Custom debt strategy (Snowball or Avalanche)",
      "Real-time payment tracking",
      "Basic spending insights",
      "Smart payment reminders",
      "Secure data encryption",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99/mo",
    description: "Advanced features and unlimited AI assistance for faster debt elimination",
    recommended: true,
    features: [
      "Everything in Basic, plus:",
      "Advanced AI financial analysis",
      "All debt management strategies",
      "Intelligent payment optimization",
      "Deep financial insights & forecasting",
      "Smart budgeting recommendations",
      "Priority customer support",
      "Unlimited AI-powered assistance"
    ]
  }
];

export default function SignUp() {
  const { sensitiveDataHandler } = useSecurity();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get plan from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const planFromUrl = searchParams.get('plan');
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    selectedTier: planFromUrl || 'basic',
    name: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();

  // Reset errors when form data changes
  useEffect(() => {
    setErrors({});
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    try {
      // Validate and sanitize sensitive data
      const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
      const sanitizedName = sensitiveDataHandler.sanitizeSensitiveData(formData.name);
      
      if (!sensitiveDataHandler.validateSensitiveData(sanitizedEmail, 'email')) {
        throw new Error('Invalid email format');
      }

      userSchema.parse({
        email: sanitizedEmail,
        password: formData.password
      });
      
      const newErrors: FormErrors = {};
      
      if (!sanitizedName?.trim()) {
        newErrors.name = 'Name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.errors.forEach(error => {
          const field = error.path[0] as keyof FormErrors;
          newErrors[field] = error.message;
        });
        setErrors(newErrors);
        return false;
      }
      setErrors({ email: err instanceof Error ? err.message : 'Invalid email' });
      return false;
    }
  }, [formData, sensitiveDataHandler]);

  const getPasswordStrength = useCallback((password: string): { strength: number; label: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength, label: labels[strength - 1] || 'Very Weak' };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Use direct Stripe payment link based on selected tier
        const paymentLink = formData.selectedTier === 'basic' 
          ? 'https://buy.stripe.com/3csbJDf1D9eQ0FybIJ'  // Basic plan link
          : 'https://buy.stripe.com/6oE7tnbPrfDecogfYY'; // Pro plan link

        // Store form data in localStorage for retrieval after payment
        localStorage.setItem('pendingSignup', JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          selectedTier: formData.selectedTier
        }));

        // Redirect to Stripe payment page
        window.location.href = paymentLink;
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : "An error occurred. Please try again."
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, validateForm]);

  const handlePaymentComplete = useCallback(async (paymentResult: PaymentResult) => {
    setIsSubmitting(true);
    try {
      // Encrypt sensitive data before sending to API
      const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
      const sanitizedName = sensitiveDataHandler.sanitizeSensitiveData(formData.name);
      const sanitizedPassword = sensitiveDataHandler.sanitizeSensitiveData(formData.password);

      const encryptedEmail = sensitiveDataHandler.encryptSensitiveData(sanitizedEmail);
      const encryptedName = sensitiveDataHandler.encryptSensitiveData(sanitizedName);
      const encryptedPassword = sensitiveDataHandler.encryptSensitiveData(sanitizedPassword);

      // Register user with subscription and encrypted data
      await signup({
        email: (await encryptedEmail).encryptedData,
        name: (await encryptedName).encryptedData,
        password: (await encryptedPassword).encryptedData,
        subscriptionId: paymentResult.subscriptionId
      });
      
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      navigate(returnUrl || '/dashboard');
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : "An error occurred during sign up. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, signup, location, sensitiveDataHandler]);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div role="main" className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white py-4 px-4">
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

      <div className="max-w-xl mx-auto pt-24 sm:pt-20">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-4">
            Set up your account to continue with the {formData.selectedTier === 'basic' ? '7-day free trial' : 'Pro'} plan
          </p>
        </div>

        <div className="bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${
                  errors.name ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${
                  errors.email ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isSubmitting}
                required
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${
                      errors.password ? "border-red-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${
                      errors.confirmPassword ? "border-red-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
              />
              <label htmlFor="acceptTerms" className="text-xs sm:text-sm text-gray-300">
                I accept the <Link to="/terms" className="text-[#88B04B] hover:text-[#7a9d43]">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-[#88B04B] hover:text-[#7a9d43]">Privacy Policy</Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-400 text-xs sm:text-sm mt-1" role="alert">{errors.acceptTerms}</p>
            )}

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex items-start gap-3 text-gray-300">
            <Shield className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <span className="text-xs sm:text-sm block">Your information is secured with:</span>
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