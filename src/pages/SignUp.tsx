import { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema } from '@/lib/utils/validation';
import { z } from 'zod';
import { useSecurity } from '@/contexts/SecurityContext';
import { toast } from '@/components/ui/use-toast';

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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

export default function SignUp() {
  const { sensitiveDataHandler } = useSecurity();
  const location = useLocation();
  const navigate = useNavigate();
  
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
  const [currentStep, setCurrentStep] = useState(1);
  const [validationStatus, setValidationStatus] = useState<{
    email: boolean;
    password: boolean;
    name: boolean;
  }>({
    email: false,
    password: false,
    name: false
  });

  const { signup } = useAuth();

  useEffect(() => {
    setErrors({});
  }, [formData]);

  const validateEmail = useCallback((email: string): boolean => {
    try {
      const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(email);
      return sensitiveDataHandler.validateSensitiveData(sanitizedEmail, 'email');
    } catch {
      return false;
    }
  }, [sensitiveDataHandler]);

  const validateForm = useCallback((): boolean => {
    try {
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

  const getPasswordStrength = useCallback((password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    
    return { 
      strength, 
      label: labels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || colors[0]
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: undefined }));

    // Real-time validation
    if (name === 'email') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, email: 'Please enter your email address' }));
        setValidationStatus(prev => ({ ...prev, email: false }));
      } else {
        const isValid = validateEmail(value);
        setValidationStatus(prev => ({ ...prev, email: isValid }));
        if (!isValid) {
          setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        }
      }
    } else if (name === 'password') {
      if (!value) {
        setErrors(prev => ({ ...prev, password: 'Please enter a password' }));
        setValidationStatus(prev => ({ ...prev, password: false }));
      } else {
        const strength = getPasswordStrength(value);
        const isValid = strength.strength >= 3;
        setValidationStatus(prev => ({ ...prev, password: isValid }));
        if (!isValid) {
          setErrors(prev => ({ ...prev, password: 'Please create a stronger password' }));
        }
      }
    } else if (name === 'confirmPassword') {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      } else if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    } else if (name === 'name') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, name: 'Please enter your name' }));
        setValidationStatus(prev => ({ ...prev, name: false }));
      } else {
        setValidationStatus(prev => ({ ...prev, name: value.trim().length >= 2 }));
        if (value.trim().length < 2) {
          setErrors(prev => ({ ...prev, name: 'Name must be at least 2 characters' }));
        }
      }
    }
  }, [validateEmail, getPasswordStrength, formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      const newErrors: FormErrors = {};
      
      if (currentStep === 1) {
        if (!formData.name.trim()) {
          newErrors.name = 'Please enter your name';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Please enter your email address';
        } else if (!validationStatus.email) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
        
        if (validationStatus.email && validationStatus.name) {
          setCurrentStep(2);
        }
        return;
      } 
      
      if (currentStep === 2) {
        if (!formData.password) {
          newErrors.password = 'Please enter a password';
        } else if (getPasswordStrength(formData.password).strength < 3) {
          newErrors.password = 'Please create a stronger password';
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
        
        if (validationStatus.password) {
          setCurrentStep(3);
        }
        return;
      }
    }
    
    // Final step - handle signup
    setIsSubmitting(true);
    setErrors({});

    if (!formData.acceptTerms) {
      setErrors({ acceptTerms: 'Please accept the terms and conditions to continue' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: signupError } = await signup({
        email: formData.email,
        password: formData.password,
        metadata: {
          name: formData.name,
          selectedTier: formData.selectedTier,
          acceptedTerms: formData.acceptTerms,
          signupDate: new Date().toISOString()
        }
      });

      if (signupError) {
        throw signupError;
      }

      // After successful signup, redirect to Stripe payment
      const paymentLinks = {
        test: {
          basic: 'https://buy.stripe.com/test_4gwcPW1HN8597x64gi',
          pro: 'https://buy.stripe.com/test_8wM5nu72799dbNm6or'
        },
        live: {
          basic: 'https://buy.stripe.com/4gwcPW1HN8597x64gi',
          pro: 'https://buy.stripe.com/8wM5nu72799dbNm6or'
        }
      };
      
      const isTestMode = import.meta.env.VITE_STRIPE_MODE === 'test';
      const environment = isTestMode ? 'test' : 'live';
      
      const selectedLink = paymentLinks[environment][formData.selectedTier as keyof typeof paymentLinks.test];
      if (selectedLink) {
        toast({
          title: "Account created successfully!",
          description: "Redirecting to payment...",
          variant: "success",
          duration: 3000
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = selectedLink;
      } else {
        throw new Error("Invalid subscription tier selected");
      }
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({
        general: errorMessage
      });
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Add loading state UI elements
  const LoadingSpinner = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#88B04B]" />
        <p className="mt-2 text-white">Creating your account...</p>
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {isSubmitting && <LoadingSpinner />}
      </AnimatePresence>
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

        <motion.div 
          className="max-w-xl mx-auto pt-24 sm:pt-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-4">
              Join thousands of people on their journey to financial freedom
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep ? 'bg-[#88B04B]' : 'bg-gray-700'
                  }`}
                  animate={{
                    scale: step === currentStep ? 1.1 : 1,
                    backgroundColor: step <= currentStep ? '#88B04B' : '#374151'
                  }}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white">{step}</span>
                  )}
                </motion.div>
                {step < 3 && (
                  <div 
                    className={`w-12 h-0.5 ${
                      step < currentStep ? 'bg-[#88B04B]' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeIn}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 bg-white/5 border ${
                          errors.name ? 'border-red-500' : 'border-white/10'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88B04B] focus:border-transparent transition-colors`}
                        placeholder="Enter your full name"
                      />
                      {validationStatus.name && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[#88B04B] w-5 h-5" />
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 bg-white/5 border ${
                          errors.email ? 'border-red-500' : 'border-white/10'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88B04B] focus:border-transparent transition-colors`}
                        placeholder="Enter your email"
                      />
                      {validationStatus.email && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[#88B04B] w-5 h-5" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeIn}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 bg-white/5 border ${
                          errors.password ? 'border-red-500' : 'border-white/10'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88B04B] focus:border-transparent transition-colors`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: passwordStrength.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <span className="text-sm" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-[#88B04B]' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>Uppercase letter</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-[#88B04B]' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>Lowercase letter</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-[#88B04B]' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>Number</span>
                          </div>
                          <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-[#88B04B]' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>8+ characters</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 bg-white/5 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88B04B] focus:border-transparent transition-colors`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeIn}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptionTiers.map((tier) => (
                      <motion.div
                        key={tier.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 rounded-xl border ${
                          formData.selectedTier === tier.id
                            ? 'border-[#88B04B] bg-[#88B04B]/10'
                            : 'border-white/10 bg-white/5'
                        } cursor-pointer transition-colors`}
                        onClick={() => setFormData(prev => ({ ...prev, selectedTier: tier.id }))}
                      >
                        {tier.recommended && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#88B04B] text-white text-xs font-medium px-3 py-1 rounded-full">
                            Recommended
                          </div>
                        )}
                        <div className="flex flex-col h-full">
                          <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                          <p className="text-lg font-medium mb-4">{tier.price}</p>
                          <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                          <ul className="space-y-2 flex-grow">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-[#88B04B] shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                      I agree to the{' '}
                      <Link to="/terms" className="text-[#88B04B] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-[#88B04B] hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {errors.general && (
              <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              <motion.button
                type="submit"
                className={`ml-auto flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white font-medium ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:brightness-110'
                } transition`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {currentStep === 3 ? 'Complete Sign Up' : 'Continue'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center mt-8 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#88B04B] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}