import { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2, Check, X, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema } from '@/lib/utils/validation';
import { z } from 'zod';
import { useSecurity } from '@/hooks/useSecurity';
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
  const { signup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
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
  const [validationStatus, setValidationStatus] = useState<{
    email: boolean;
    password: boolean;
    name: boolean;
  }>({
    email: false,
    password: false,
    name: false
  });

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
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <p className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>{label}</p>
          <p className="text-xs text-gray-400">{Math.round(percentage)}%</p>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
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
          className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10"
        >
          <p className="text-xs font-medium text-white/80 mb-2">Password requirements:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PASSWORD_REQUIREMENTS.map(({ id, label }) => (
              <div key={id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordRequirements[id] ? 'bg-green-500/20' : 'bg-white/10'
                }`}>
                  {passwordRequirements[id] ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className={`text-xs ${passwordRequirements[id] ? 'text-green-500' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step === stepNumber 
                ? 'bg-[#88B04B] text-white' 
                : step > stepNumber 
                  ? 'bg-[#88B04B]/20 text-[#88B04B]' 
                  : 'bg-white/10 text-white/50'
            }`}
          >
            {step > stepNumber ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{stepNumber}</span>
            )}
          </div>
          <div className="text-xs mt-1 text-center">
            {stepNumber === 1 ? 'Account' : stepNumber === 2 ? 'Password' : 'Plan'}
          </div>
        </div>
      ))}
    </div>
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      const newErrors: FormErrors = {};
      
      if (step === 1) {
        if (!formData.name.trim()) {
          newErrors.name = 'Please enter your name';
        } else if (formData.name.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
          newErrors.email = 'Please enter your email address';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.confirmEmail.trim()) {
          newErrors.confirmEmail = 'Please confirm your email address';
        } else if (formData.email !== formData.confirmEmail) {
          newErrors.confirmEmail = 'Emails do not match';
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
        
        // Update validation status to ensure it's correct
        const nameValid = formData.name.trim().length >= 2;
        const emailValid = validateEmail(formData.email);
        const emailsMatch = formData.email === formData.confirmEmail;
        
        setValidationStatus(prev => ({
          ...prev,
          name: nameValid,
          email: emailValid
        }));
        
        if (nameValid && emailValid && emailsMatch) {
          setStep(2);
        }
        return;
      } 
      
      if (step === 2) {
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
        
        const passwordValid = getPasswordStrength(formData.password).strength >= 3;
        const passwordsMatch = formData.password === formData.confirmPassword;
        
        setValidationStatus(prev => ({
          ...prev,
          password: passwordValid
        }));
        
        if (passwordValid && passwordsMatch) {
          setStep(3);
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
      // Create the user account with Supabase
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

      // Determine the correct payment link based on environment and selected tier
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
        
        // Give the toast time to display before redirecting
        await new Promise(resolve => setTimeout(resolve, 1500));
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
  }, [formData, validateEmail, getPasswordStrength, signup, step, validationStatus, toast]);

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
          setErrors(prev => ({ 
            ...prev, 
            email: 'Please enter a valid email address (e.g., name@example.com)' 
          }));
        } else {
          // Clear error when valid
          setErrors(prev => ({ ...prev, email: undefined }));
          
          // Check if confirm email matches
          if (formData.confirmEmail && formData.confirmEmail !== value) {
            setErrors(prev => ({ ...prev, confirmEmail: 'Emails do not match' }));
          } else if (formData.confirmEmail) {
            setErrors(prev => ({ ...prev, confirmEmail: undefined }));
          }
        }
      }
    } else if (name === 'confirmEmail') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, confirmEmail: 'Please confirm your email address' }));
      } else if (value !== formData.email) {
        setErrors(prev => ({ ...prev, confirmEmail: 'Emails do not match' }));
      } else {
        // Clear error when emails match
        setErrors(prev => ({ ...prev, confirmEmail: undefined }));
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
      } else {
        // Clear error when passwords match
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    } else if (name === 'name') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, name: 'Please enter your name' }));
        setValidationStatus(prev => ({ ...prev, name: false }));
      } else {
        const isValid = value.trim().length >= 2;
        setValidationStatus(prev => ({ ...prev, name: isValid }));
        if (!isValid) {
          setErrors(prev => ({ ...prev, name: 'Name must be at least 2 characters' }));
        } else {
          // Clear error when valid
          setErrors(prev => ({ ...prev, name: undefined }));
        }
      }
    }
  }, [validateEmail, getPasswordStrength, formData.password, formData.email, formData.confirmEmail]);

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
      <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white py-8 px-4 flex flex-col items-center justify-center">
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

        <div className="w-full max-w-md mx-auto">
          {renderStepIndicator()}

          <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>
            
          {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                role="alert"
              >
              <p className="text-red-400 text-sm">{errors.general}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {step === 1 && (
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
                          errors.name ? "border-red-500" : validationStatus.name ? "border-green-500" : "border-white/10"
                } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={isSubmitting}
              />
                      {validationStatus.name && !errors.name && (
                        <div className="mt-1 text-xs text-green-500">
                          <CheckCircle className="inline-block h-3 w-3 mr-1" />
                          Valid name
                        </div>
                      )}
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
                          errors.email ? "border-red-500" : validationStatus.email ? "border-green-500" : "border-white/10"
                } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isSubmitting}
                required
              />
                      {validationStatus.email && !errors.email && (
                        <div className="mt-1 text-xs text-green-500">
                          <CheckCircle className="inline-block h-3 w-3 mr-1" />
                          Valid email format
                        </div>
                      )}
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
                          errors.confirmEmail ? "border-red-500" : 
                          formData.confirmEmail && formData.confirmEmail === formData.email ? "border-green-500" : "border-white/10"
                        } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                        value={formData.confirmEmail}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                        placeholder="Confirm your email address"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.confirmEmail)}
                        aria-describedby={errors.confirmEmail ? "confirm-email-error" : undefined}
                        disabled={isSubmitting}
                        required
                      />
                      {formData.confirmEmail && formData.confirmEmail === formData.email && !errors.confirmEmail && (
                        <div className="mt-1 text-xs text-green-500">
                          <CheckCircle className="inline-block h-3 w-3 mr-1" />
                          Emails match
                        </div>
                      )}
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
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
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
                              errors.password ? "border-red-500" : validationStatus.password ? "border-green-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                    value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => {
                              setPasswordFocused(false);
                              handleInputChange({ target: { name: 'password', value: formData.password } } as React.ChangeEvent<HTMLInputElement>);
                            }}
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
                              errors.confirmPassword ? "border-red-500" : 
                              formData.confirmPassword && formData.confirmPassword === formData.password ? "border-green-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                    value={formData.confirmPassword}
                            onChange={handleInputChange}
                            onBlur={() => {
                              if (formData.confirmPassword) {
                                handleInputChange({ target: { name: 'confirmPassword', value: formData.confirmPassword } } as React.ChangeEvent<HTMLInputElement>);
                              }
                            }}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    disabled={isSubmitting}
                    required
                  />
                          {formData.confirmPassword && formData.confirmPassword === formData.password && !errors.confirmPassword && (
                            <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                          )}
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
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeIn}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      {subscriptionTiers.map((tier) => (
                        <motion.div
                          key={tier.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative p-6 md:p-8 rounded-xl border ${
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
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-semibold">{tier.name}</h3>
                              {formData.selectedTier === tier.id && (
                                <div className="bg-[#88B04B]/20 text-[#88B04B] p-1 rounded-full">
                                  <Check className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <p className="text-lg font-medium mb-4">{tier.price}</p>
                            <p className="text-gray-300 text-sm mb-6">{tier.description}</p>
                            <ul className="space-y-3 flex-grow">
                              {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm">
                                  <CheckCircle className="w-5 h-5 text-[#88B04B] shrink-0 mt-0.5" />
                                  <span className="text-gray-200">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
              />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                I accept the <Link to="/terms" className="text-[#88B04B] hover:text-[#7a9d43]">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-[#88B04B] hover:text-[#7a9d43]">Privacy Policy</Link>
              </label>
            </div>
            {errors.acceptTerms && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-sm mt-1"
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
                            {step === 3 ? 'Complete Sign Up' : 'Continue'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.general && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{errors.general}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(prev => prev - 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                <motion.button
                  type="submit"
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white font-medium shadow-lg ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl hover:brightness-110'
                  } transition-all min-w-[120px]`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {step === 3 ? 'Complete Sign Up' : 'Continue'}
                      <ArrowRight className="w-4 h-4" />
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
          </div>
        </div>
      </div>
    </>
  );
}