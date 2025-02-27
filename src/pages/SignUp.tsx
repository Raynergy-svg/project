import { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema } from '@/lib/utils/validation';
import { z } from 'zod';
import { useSecurity } from '@/contexts/SecurityContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  selectedTier: string;
  name: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  confirmEmail?: string;
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

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /[0-9]/ },
  { id: 'special', label: 'One special character', regex: /[^A-Za-z0-9]/ },
];

export default function SignUp() {
  const { sensitiveDataHandler } = useSecurity();
  const { signup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get plan from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const planFromUrl = searchParams.get('plan');
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    confirmEmail: '',
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
  const [step, setStep] = useState(1);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState(
    PASSWORD_REQUIREMENTS.reduce((acc, req) => ({ ...acc, [req.id]: false }), {})
  );

  // Reset errors when form data changes
  useEffect(() => {
    setErrors({});
  }, [formData]);

  // Update password requirements when password changes
  useEffect(() => {
    const newRequirements = PASSWORD_REQUIREMENTS.reduce((acc, requirement) => ({
      ...acc,
      [requirement.id]: requirement.regex.test(formData.password)
    }), {});
    setPasswordRequirements(newRequirements);
  }, [formData.password]);

  const validateForm = useCallback((): boolean => {
    try {
      // Validate and sanitize sensitive data
      const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
      const sanitizedConfirmEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.confirmEmail);
      const sanitizedName = sensitiveDataHandler.sanitizeSensitiveData(formData.name);
      
      if (!sensitiveDataHandler.validateSensitiveData(sanitizedEmail, 'email')) {
        throw new Error('Invalid email format');
      }

      // Check if emails match
      if (sanitizedEmail !== sanitizedConfirmEmail) {
        throw new Error('Emails do not match');
      }

      // Additional email validation
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
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
      const errorMessage = err instanceof Error ? err.message : 'Invalid email';
      if (errorMessage.includes('Emails do not match')) {
        setErrors({ confirmEmail: errorMessage });
      } else {
        setErrors({ email: errorMessage });
      }
      return false;
    }
  }, [formData, sensitiveDataHandler]);

  const getPasswordStrength = useCallback((password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    const requirements = PASSWORD_REQUIREMENTS.filter(req => req.regex.test(password));
    strength = requirements.length;

    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-orange-500' },
      2: { label: 'Fair', color: 'bg-yellow-500' },
      3: { label: 'Good', color: 'bg-blue-500' },
      4: { label: 'Strong', color: 'bg-green-500' },
      5: { label: 'Very Strong', color: 'bg-green-600' }
    };

    return {
      strength,
      ...strengthMap[strength as keyof typeof strengthMap]
    };
  }, []);

  const renderPasswordStrength = () => {
    const { strength, label, color } = getPasswordStrength(formData.password);
    const percentage = (strength / PASSWORD_REQUIREMENTS.length) * 100;

    return (
      <div className="mt-2">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs mt-1 text-gray-400">{label}</p>
      </div>
    );
  };

  const renderPasswordRequirements = () => (
    <AnimatePresence>
      {passwordFocused && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 space-y-2"
        >
          {PASSWORD_REQUIREMENTS.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-2">
              {passwordRequirements[id] ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-xs ${passwordRequirements[id] ? 'text-green-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2].map((stepNumber) => (
        <div
          key={stepNumber}
          className={`w-2 h-2 rounded-full transition-colors ${
            step >= stepNumber ? 'bg-[#88B04B]' : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Sanitize sensitive data
        const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(formData.email);
        const sanitizedName = sensitiveDataHandler.sanitizeSensitiveData(formData.name);
        const sanitizedPassword = sensitiveDataHandler.sanitizeSensitiveData(formData.password);

        // Create user with Supabase
        await signup({
          email: sanitizedEmail,
          password: sanitizedPassword,
          name: sanitizedName,
        });

        // Redirect to payment if needed
        if (formData.selectedTier !== 'basic') {
          const paymentLinks = {
            test: {
              pro: 'https://buy.stripe.com/test_8wM5nu72799dbNm6or'
            },
            live: {
              pro: 'https://buy.stripe.com/8wM5nu72799dbNm6or'
            }
          };
          
          const isTestMode = import.meta.env.VITE_STRIPE_MODE === 'test';
          const environment = isTestMode ? 'test' : 'live';
          
          const selectedLink = paymentLinks[environment][formData.selectedTier as keyof typeof paymentLinks.test];
          if (selectedLink) {
            window.location.href = selectedLink;
          }
        } else {
          // Navigate to dashboard for basic tier
          const returnUrl = new URLSearchParams(location.search).get('returnUrl');
          navigate(returnUrl || '/dashboard');
        }
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({
          general: error instanceof Error ? error.message : "An error occurred during sign up. Please try again."
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, validateForm, signup, navigate, location, sensitiveDataHandler]);

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

        {renderStepIndicator()}

        <div className="bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              role="alert"
            >
              <p className="text-red-400 text-sm">{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
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
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        id="name-error"
                        className="mt-1.5 text-red-400 text-xs sm:text-sm"
                        role="alert"
                      >
                        {errors.name}
                      </motion.p>
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
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        id="email-error"
                        className="mt-1.5 text-red-400 text-xs sm:text-sm"
                        role="alert"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmEmail" className="block text-sm font-medium mb-1.5">
                      Confirm Email Address
                    </label>
                    <input
                      type="email"
                      id="confirmEmail"
                      name="confirmEmail"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${
                        errors.confirmEmail ? "border-red-500" : formData.email && formData.confirmEmail && formData.email === formData.confirmEmail ? "border-green-500" : "border-white/10"
                      } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                      value={formData.confirmEmail}
                      onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.confirmEmail)}
                      aria-describedby={errors.confirmEmail ? "confirm-email-error" : undefined}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.confirmEmail && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        id="confirm-email-error"
                        className="mt-1.5 text-red-400 text-xs sm:text-sm"
                        role="alert"
                      >
                        {errors.confirmEmail}
                      </motion.p>
                    )}
                    {formData.email && formData.confirmEmail && formData.email === formData.confirmEmail && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1.5 text-green-400 text-xs sm:text-sm"
                      >
                        Emails match
                      </motion.p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.email || !formData.confirmEmail || formData.email !== formData.confirmEmail}
                    className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
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
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
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
                      {renderPasswordStrength()}
                      {renderPasswordRequirements()}
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          id="password-error"
                          className="mt-1.5 text-red-400 text-xs sm:text-sm"
                          role="alert"
                        >
                          {errors.password}
                        </motion.p>
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
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          id="confirm-password-error"
                          className="mt-1.5 text-red-400 text-xs sm:text-sm"
                          role="alert"
                        >
                          {errors.confirmPassword}
                        </motion.p>
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
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-xs sm:text-sm mt-1"
                      role="alert"
                    >
                      {errors.acceptTerms}
                    </motion.p>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#88B04B] hover:bg-[#7a9d43] text-white py-2.5 sm:py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
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
                </motion.div>
              )}
            </AnimatePresence>
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