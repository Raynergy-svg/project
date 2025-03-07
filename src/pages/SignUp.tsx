import { useState, useCallback, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema } from '@/lib/utils/validation';
import { validatePasswordStrength } from '@/utils/validation';
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
  marketingConsent?: boolean;
  dataProcessingConsent?: boolean;
  ageVerification?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
  acceptTerms?: string;
  ageVerification?: string;
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
    price: "Free for 7 days, then $20/mo",
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
    price: "$50/mo",
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
    acceptTerms: false,
    marketingConsent: false,
    dataProcessingConsent: false,
    ageVerification: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const { signup, resendConfirmationEmail } = useAuth();

  // Reset errors when form data changes
  useEffect(() => {
    setFormErrors({});
  }, [formData]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.name) {
      errors.name = 'Name is required';
    }

    // Password validation using our new strengthened validation
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]; // Display the first error
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    // Age verification validation (required)
    if (!formData.ageVerification) {
      errors.ageVerification = 'You must confirm that you are of legal age';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First make sure the security handler is initialized
      if (sensitiveDataHandler) {
        try {
          // Initialize encryption key if not already done
          await sensitiveDataHandler.initializeKey();
        } catch (error) {
          console.warn('Failed to initialize encryption key:', error);
          // Continue with signup even if encryption initialization fails
          // The server will handle unencrypted data appropriately
        }
      }

      // Use direct Stripe payment link based on selected tier
      const paymentLink = formData.selectedTier === 'basic'
        ? 'https://buy.stripe.com/3csbJDf1D9eQ0FybIJ'  // Basic plan link
        : 'https://buy.stripe.com/6oE7tnbPrfDecogfYY'; // Pro plan link

      // Store minimal form data in localStorage for retrieval after payment
      // Avoid storing sensitive data like password
      localStorage.setItem('pendingSignup', JSON.stringify({
        email: formData.email,
        name: formData.name,
        selectedTier: formData.selectedTier
        // Don't store password in localStorage
      }));

      // Set a flag to indicate we need to collect the password again
      localStorage.setItem('requirePasswordConfirmation', 'true');

      // Redirect to Stripe payment page
      window.location.href = paymentLink;
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "An error occurred. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, sensitiveDataHandler]);

  const handlePaymentComplete = useCallback(async (paymentResult: PaymentResult) => {
    setIsSubmitting(true);
    try {
      // Get stored registration data
      const storedData = localStorage.getItem('pendingSignup');
      if (!storedData) {
        throw new Error('Registration data not found. Please try again.');
      }

      const pendingSignup = JSON.parse(storedData);

      // Check if we need to collect password again (it wasn't stored in localStorage for security)
      const needPasswordConfirmation = localStorage.getItem('requirePasswordConfirmation') === 'true';
      if (needPasswordConfirmation) {
        // Here you would typically show a password input dialog
        // For now, we'll use the password from the form state (which is still in memory)
        // In a real app, you would prompt the user again for their password
        console.log('Using password from current form state since we avoided storing it in localStorage');
      }

      // Get the selected tier and other required data
      const registrationData = {
        email: pendingSignup.email,
        password: formData.password,
        name: pendingSignup.name,
        selectedTier: pendingSignup.selectedTier,
        // Include consent data
        acceptTerms: formData.acceptTerms,
        marketingConsent: formData.marketingConsent,
        dataProcessingConsent: formData.dataProcessingConsent,
        ageVerification: formData.ageVerification,
      };

      // Try to use the security handler for encryption if available
      let encryptedData = { ...registrationData };

      try {
        // Only attempt encryption if the handler is properly initialized
        if (sensitiveDataHandler &&
          typeof sensitiveDataHandler.sanitizeSensitiveData === 'function' &&
          typeof sensitiveDataHandler.encryptSensitiveData === 'function') {

          // Initialize if not already done
          await sensitiveDataHandler.initializeKey();

          // Sanitize and encrypt sensitive data
          const sanitizedEmail = sensitiveDataHandler.sanitizeSensitiveData(registrationData.email);
          const sanitizedName = sensitiveDataHandler.sanitizeSensitiveData(registrationData.name);
          const sanitizedPassword = sensitiveDataHandler.sanitizeSensitiveData(registrationData.password);

          // Encrypt the data - with error handling for each field
          try {
            const encryptedEmail = await sensitiveDataHandler.encryptSensitiveData(sanitizedEmail);
            encryptedData.email = encryptedEmail.encryptedData;
          } catch (err) {
            console.warn('Failed to encrypt email:', err);
            // Continue with unencrypted email
          }

          try {
            const encryptedName = await sensitiveDataHandler.encryptSensitiveData(sanitizedName);
            encryptedData.name = encryptedName.encryptedData;
          } catch (err) {
            console.warn('Failed to encrypt name:', err);
            // Continue with unencrypted name
          }

          try {
            const encryptedPassword = await sensitiveDataHandler.encryptSensitiveData(sanitizedPassword);
            encryptedData.password = encryptedPassword.encryptedData;
          } catch (err) {
            console.warn('Failed to encrypt password:', err);
            // Continue with unencrypted password
          }
        } else {
          console.warn('Sensitive data handler not fully initialized, proceeding with unencrypted signup');
        }
      } catch (encryptionError) {
        console.error('Encryption failed:', encryptionError);
        // Continue with unencrypted data as fallback
      }

      // Record consent information
      const consentRecord = {
        userId: null, // Will be filled in by backend
        consentDate: new Date().toISOString(),
        consentVersion: "1.0", // Current version of Terms/Privacy
        termsAccepted: formData.acceptTerms,
        privacyAccepted: formData.acceptTerms,
        marketingConsent: formData.marketingConsent,
        dataProcessingConsent: formData.dataProcessingConsent,
        ageVerified: formData.ageVerification,
        ipAddress: "{{client_ip}}", // Placeholder - would be captured by backend
        userAgent: navigator.userAgent,
        consentMethod: "signup_form",
      };

      // Include the consent record with the encrypted data
      encryptedData.consentRecord = consentRecord;

      // Register user with subscription and encrypted data
      const result = await signup(encryptedData);

      // Check if email confirmation is needed
      if (result.needsEmailConfirmation) {
        setEmailConfirmationSent(true);
        setConfirmedEmail(registrationData.email);
        return;
      }

      const returnUrl = new URLSearchParams(location.search).get('returnUrl');

      // Clean up sensitive data from localStorage
      localStorage.removeItem('pendingSignup');
      localStorage.removeItem('requirePasswordConfirmation');

      // Navigate to dashboard or return URL
      navigate(returnUrl || '/dashboard');

    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "An error occurred during registration. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, location.search, navigate, sensitiveDataHandler, signup]);

  const handleResendConfirmation = async () => {
    if (!confirmedEmail) return;

    setIsSubmitting(true);
    try {
      await resendConfirmationEmail(confirmedEmail);
      setFormErrors({});
      // Show success message
      setFormErrors({ general: "Confirmation email has been resent. Please check your inbox." });
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "Failed to resend confirmation email. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Add this function to render error messages
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    if (formErrors[fieldName]) {
      return (
        <div className="text-red-500 text-sm mt-1">
          {formErrors[fieldName]}
        </div>
      );
    }
    return null;
  };

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

        {emailConfirmationSent ? (
          <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-xl border border-[#333]">
            <div className="flex flex-col items-center text-center">
              <Shield className="w-16 h-16 text-[#88B04B] mb-4" />
              <h1 className="text-2xl font-bold mb-3">Verify Your Email</h1>
              <p className="mb-6 text-gray-300">
                We've sent a confirmation email to <strong>{confirmedEmail}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
              <div className="bg-[#111] p-4 rounded-md text-left w-full mb-6">
                <h3 className="font-medium mb-2 text-[#88B04B]">Next steps:</h3>
                <ol className="list-decimal list-inside text-gray-300 space-y-2">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>After verification, you can sign in to your account</li>
                </ol>
              </div>
              <div className="space-y-4 w-full">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#333] hover:bg-[#444] text-white py-3 px-6 rounded-md transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <>Resend confirmation email</>
                  )}
                </button>
                <Link
                  to="/signin"
                  className="block w-full text-center py-3 px-6 rounded-md border border-[#444] hover:bg-[#222] transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
              {formErrors.general && (
                <div className="mt-4 p-3 bg-opacity-20 rounded-md text-center w-full bg-blue-500 text-blue-100">
                  {formErrors.general}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10">
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
                <p className="text-red-400 text-sm">{formErrors.general}</p>
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
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${formErrors.name ? "border-red-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-invalid={Boolean(formErrors.name)}
                  aria-describedby={formErrors.name ? "name-error" : undefined}
                  disabled={isSubmitting}
                />
                {formErrors.name && (
                  <p id="name-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                    {formErrors.name}
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
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${formErrors.email ? "border-red-500" : "border-white/10"
                    } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(formErrors.email)}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.email && (
                  <p id="email-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                    {formErrors.email}
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
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${formErrors.password ? "border-red-500" : "border-white/10"
                        } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                      aria-invalid={Boolean(formErrors.password)}
                      aria-describedby={formErrors.password ? "password-error" : undefined}
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
                  {formErrors.password && (
                    <p id="password-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                      {formErrors.password}
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
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border ${formErrors.confirmPassword ? "border-red-500" : "border-white/10"
                        } focus:outline-none focus:border-[#88B04B] text-white transition-colors text-sm sm:text-base`}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      autoComplete="new-password"
                      aria-invalid={Boolean(formErrors.confirmPassword)}
                      aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
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
                  {formErrors.confirmPassword && (
                    <p id="confirm-password-error" className="mt-1.5 text-red-400 text-xs sm:text-sm" role="alert">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4 border border-gray-700/50 p-4 rounded-lg bg-gray-900/30">
                <h3 className="text-sm font-medium text-white">Consent Options</h3>

                {/* Terms and Privacy Policy Consent - Required */}
                <div className="flex items-start gap-2">
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
                    <span className="ml-1 text-xs text-red-400">*</span>
                  </label>
                </div>
                {formErrors.acceptTerms && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1" role="alert">{formErrors.acceptTerms}</p>
                )}

                {/* Marketing Communications Consent - Optional */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent || false}
                    onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                  />
                  <label htmlFor="marketingConsent" className="text-xs sm:text-sm text-gray-300">
                    I agree to receive marketing communications about products, services, and promotions.
                  </label>
                </div>

                {/* Data Processing Consent - Optional */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="dataProcessingConsent"
                    name="dataProcessingConsent"
                    checked={formData.dataProcessingConsent || false}
                    onChange={(e) => setFormData({ ...formData, dataProcessingConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                  />
                  <label htmlFor="dataProcessingConsent" className="text-xs sm:text-sm text-gray-300">
                    I consent to the processing of my data for service improvement and personalization purposes.
                  </label>
                </div>

                {/* Age Verification - Required */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="ageVerification"
                    name="ageVerification"
                    checked={formData.ageVerification || false}
                    onChange={(e) => setFormData({ ...formData, ageVerification: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                  />
                  <label htmlFor="ageVerification" className="text-xs sm:text-sm text-gray-300">
                    I confirm that I am at least 18 years old or the age of majority in my jurisdiction.
                    <span className="ml-1 text-xs text-red-400">*</span>
                  </label>
                </div>
                {formData.ageVerification === false && formSubmitted && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1" role="alert">You must confirm that you are of legal age to continue.</p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Fields marked with <span className="text-red-400">*</span> are required.
                </p>
              </div>

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
                      Become Debt Free
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

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