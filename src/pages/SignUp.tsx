import { useState, useCallback, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Lock, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema } from '@/lib/utils/validation';
import { validatePasswordStrength } from '@/utils/validation';
import { z } from 'zod';
import { useSecurity } from '@/contexts/SecurityContext';
import type { SignUpData } from '@/types';

// Error boundary component to catch rendering errors
class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in SignUp component:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">We encountered an error while loading this page. Please try refreshing.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

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
  return (
    <ErrorBoundary>
      <SignUpContent />
    </ErrorBoundary>
  );
}

function SignUpContent() {
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
  const [isResending, setIsResending] = useState(false);
  const [confirmationResent, setConfirmationResent] = useState(false);
  
  // Add states to track payment failure and resuming registration
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [continueRegistration, setContinueRegistration] = useState(false);

  const { signup, resendConfirmationEmail } = useAuth();

  // Reset errors when form data changes
  useEffect(() => {
    setFormErrors({});
  }, [formData]);

  // Extended version of generateTempAuthToken that accepts an existing timestamp
  const generateTempAuthToken = async (password: string, existingTimestamp?: string): Promise<string> => {
    try {
      // Use provided timestamp or generate a new one
      const timestamp = existingTimestamp || Date.now().toString();
      const encoder = new TextEncoder();
      const data = encoder.encode(password + timestamp);
      
      // Use SubtleCrypto to create a hash if available
      if (window.crypto && window.crypto.subtle) {
        try {
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          // Store the timestamp only if we're generating a new one
          if (!existingTimestamp) {
            localStorage.setItem('authTimestamp', timestamp);
          }
          
          return hashHex;
        } catch (e) {
          console.warn('Secure hashing unavailable, using fallback method');
        }
      }
      
      // Fallback to a less secure method if SubtleCrypto is not available
      let hash = 0;
      for (let i = 0; i < (password + timestamp).length; i++) {
        const char = (password + timestamp).charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Store the timestamp only if we're generating a new one
      if (!existingTimestamp) {
        localStorage.setItem('authTimestamp', timestamp);
      }
      
      return hash.toString(16);
    } catch (error) {
      console.error('Error generating auth token:', error);
      // Return a fallback hash in case of error
      return `fallback-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }
  };

  // Define handlePaymentComplete before using it in useEffect
  const handlePaymentComplete = useCallback(async (paymentResult: PaymentResult) => {
    setIsSubmitting(true);
    try {
      // Get stored registration data
      const storedData = localStorage.getItem('pendingSignup');
      if (!storedData) {
        throw new Error('Registration data not found. Please try again.');
      }

      // Parse stored data
      const pendingSignup = JSON.parse(storedData);
      
      // Decrypt sensitive data if it was encrypted
      let email = pendingSignup.email;
      let name = pendingSignup.name;
      
      if (sensitiveDataHandler && pendingSignup.emailIv) {
        try {
          // Decrypt email if it was encrypted
          const decryptedEmail = await sensitiveDataHandler.decryptData(
            pendingSignup.email,
            pendingSignup.emailIv
          );
          if (decryptedEmail) {
            email = decryptedEmail;
          }
          
          // Decrypt name if it was encrypted
          if (pendingSignup.nameIv) {
            const decryptedName = await sensitiveDataHandler.decryptData(
              pendingSignup.name,
              pendingSignup.nameIv
            );
            if (decryptedName) {
              name = decryptedName;
            }
          }
        } catch (error) {
          console.warn('Failed to decrypt user data:', error);
          // Continue with the encrypted data - we'll handle this server-side
        }
      }

      // Check if we have the required auth token
      const authVerification = localStorage.getItem('authVerification');
      const authTimestamp = localStorage.getItem('authTimestamp');
      if (!authVerification || !authTimestamp) {
        throw new Error('Authentication information missing. Please try signing up again.');
      }

      // Check the session ID to make sure this is the same signup attempt
      const storedSessionId = localStorage.getItem('signupSessionId');
      const sessionIdFromUrl = new URLSearchParams(window.location.search).get('session_id');
      
      if (storedSessionId && sessionIdFromUrl && storedSessionId !== sessionIdFromUrl) {
        console.warn('Session ID mismatch - possible security issue');
        // We'll continue but log the issue for security monitoring
      }

      // For security, we'll ask the user to confirm their password again
      // Ideally this would be a modal or inline form
      // For now, we'll assume we have a password field in the form
      // that the user can reenter their password into
      
      // Verify the password matches the stored verification token
      let passwordValid = false;
      if (formData.password) {
        // Re-generate the token with the same method but using the stored timestamp
        const verificationToken = await generateTempAuthToken(formData.password, authTimestamp);
        passwordValid = verificationToken === authVerification;
        
        if (!passwordValid) {
          setFormErrors({
            password: 'The password does not match. Please enter the same password you used initially.'
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // We need the password - show UI to request it
        // For simplicity in this implementation, we assume the user has provided it already
        throw new Error('Please enter your password to complete registration.');
      }

      // Prepare consent data from the stored signup
      const consentRecord = pendingSignup.consentRecord || {
        termsAccepted: true, // Default to true since we require this for signup
        privacyAccepted: true,
        marketingConsent: false,
        dataProcessingConsent: false,
        ageVerified: true
      };
      
      // Get the selected tier and other required data
      const registrationData: SignUpData = {
        email: email,
        password: formData.password,
        name: name,
        subscriptionId: paymentResult.subscriptionId,  // Include the subscription ID from Stripe
        consentRecord: consentRecord
      };

      // Attempt to create the account
      const result = await signup(registrationData);

      // Clear sensitive data from localStorage
      localStorage.removeItem('pendingSignup');
      localStorage.removeItem('requirePasswordConfirmation');
      localStorage.removeItem('authVerification');
      localStorage.removeItem('authTimestamp');
      localStorage.removeItem('signupSessionId');

      // Set email confirmation state if needed
      if (result.needsEmailConfirmation) {
        setEmailConfirmationSent(true);
        setConfirmedEmail(email);
      } else {
        // If email confirmation not needed, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      
      setFormErrors({
        general: error instanceof Error ? error.message : "An error occurred. Please try again."
      });
      
      // If we get a specific error about account already existing, suggest sign in
      if (error instanceof Error && 
          (error.message.includes('already exists') || 
           error.message.includes('already registered'))) {
        setFormErrors({
          general: `This email is already registered. Please sign in instead.`,
          email: 'Account already exists'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, sensitiveDataHandler, signup]);

  // Check URL parameters for payment status on component mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const paymentSuccess = searchParams.get('payment_success');
      const subscriptionId = searchParams.get('subscription_id');
      const oneTimePaymentId = searchParams.get('payment_intent_id');
      const errorParam = searchParams.get('error');
      
      // If we have payment success and subscription info, process the payment completion
      if (paymentSuccess === 'true' && (subscriptionId || oneTimePaymentId)) {
        const paymentResult: PaymentResult = {
          subscriptionId: subscriptionId || '',
          oneTimePaymentIntentId: oneTimePaymentId || undefined
        };
        
        handlePaymentComplete(paymentResult);
      } 
      // If we have a payment failure, show appropriate error message
      else if (paymentSuccess === 'false' || errorParam) {
        setFormErrors({
          general: `Your payment was not completed. ${errorParam ? `Error: ${errorParam}` : 'Please try again or contact support.'}`
        });
        
        // Set flag to show retry UI
        setPaymentFailed(true);
      }
      // Check if we have a saved registration in progress but no payment confirmation yet
      else if (localStorage.getItem('pendingSignup')) {
        // Handle case where user may have abandoned the payment flow or opened in a new tab
        // Show UI to continue the previous registration attempt
        setContinueRegistration(true);
      }
    } catch (error) {
      console.error('Error processing URL parameters:', error);
      // Don't set form errors here to avoid confusing the user on initial load
    }
  }, [location.search, handlePaymentComplete]);

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

      // Generate a session ID to track this signup attempt across redirects
      const sessionId = `signup_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Create a more comprehensive data object
      const signupData = {
        email: formData.email,
        name: formData.name,
        selectedTier: formData.selectedTier,
        sessionId: sessionId,
        timestamp: Date.now(),
        // Store consent data
        consentRecord: {
          termsAccepted: formData.acceptTerms,
          privacyAccepted: formData.acceptTerms, // Privacy is typically accepted with terms
          marketingConsent: formData.marketingConsent,
          dataProcessingConsent: formData.dataProcessingConsent,
          ageVerified: formData.ageVerification,
        }
      };

      // Use direct Stripe payment link based on selected tier
      const paymentLink = formData.selectedTier === 'basic'
        ? 'https://buy.stripe.com/3csbJDf1D9eQ0FybIJ'  // Basic plan link
        : 'https://buy.stripe.com/6oE7tnbPrfDecogfYY'; // Pro plan link

      try {
        // Encrypt sensitive data before storing in localStorage
        let encryptedData = { ...signupData };
        
        if (sensitiveDataHandler) {
          try {
            // Encrypt email
            const encryptedEmail = await sensitiveDataHandler.encryptData(signupData.email);
            if (encryptedEmail) {
              encryptedData.email = encryptedEmail.encrypted;
              encryptedData.emailIv = encryptedEmail.iv;
            }
            
            // Encrypt name
            const encryptedName = await sensitiveDataHandler.encryptData(signupData.name);
            if (encryptedName) {
              encryptedData.name = encryptedName.encrypted;
              encryptedData.nameIv = encryptedName.iv;
            }
          } catch (err) {
            console.warn('Failed to encrypt user data:', err);
            // Continue with unencrypted data
          }
        }
        
        // Store data in localStorage with the session ID
        localStorage.setItem('pendingSignup', JSON.stringify(encryptedData));
      } catch (storageError) {
        console.error('Failed to store signup data:', storageError);
        // If we can't store data, we should not proceed with payment
        throw new Error('Failed to prepare for payment process. Please try again.');
      }

      // Create a secure way to handle the password across redirects
      // IMPORTANT: Never store raw passwords in localStorage
      
      // Instead, we'll hash the password and store a temporary verification token
      // that we can use to verify the password when the user returns
      const tempAuthToken = await generateTempAuthToken(formData.password);
      
      // Store additional data for verification
      localStorage.setItem('authVerification', tempAuthToken);
      localStorage.setItem('requirePasswordConfirmation', 'true');
      localStorage.setItem('signupSessionId', sessionId);

      // Add session ID as a query param to help with tracking
      const paymentLinkWithParams = new URL(paymentLink);
      paymentLinkWithParams.searchParams.append('session_id', sessionId);

      // Redirect to Stripe payment page
      window.location.href = paymentLinkWithParams.toString();
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "An error occurred. Please try again."
      });
      
      // Log the error for debugging
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, sensitiveDataHandler, generateTempAuthToken]);

  const handleResendConfirmation = async () => {
    if (isResending || !confirmedEmail) return;
    
    setIsResending(true);
    
    try {
      await resendConfirmationEmail(confirmedEmail);
      setConfirmationResent(true);
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "Failed to resend confirmation email. Please try again."
      });
    } finally {
      setIsResending(false);
    }
  };

  // Helper function to get password strength
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) {
      return { score: 0, label: 'None', color: 'gray' };
    }
    
    // Calculate password strength based on criteria
    let score = 0;
    
    // Length check
    if (password.length >= 10) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine label and color based on score
    let label = '';
    let color = '';
    
    switch (true) {
      case (score <= 2):
        label = 'Weak';
        color = 'red';
        break;
      case (score <= 4):
        label = 'Fair';
        color = 'orange';
        break;
      case (score <= 5):
        label = 'Good';
        color = 'yellow';
        break;
      default:
        label = 'Strong';
        color = 'green';
    }
    
    return { score, label, color };
  };

  // Calculate password strength for the current password
  const passwordStrength = getPasswordStrength(formData.password);

  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    if (!formErrors[fieldName]) return null;
    
    return (
      <p className="text-red-400 text-sm mt-1">{formErrors[fieldName]}</p>
    );
  };

  // Handler for retrying payment after failure
  const handleRetryPayment = useCallback(() => {
    const storedData = localStorage.getItem('pendingSignup');
    if (!storedData) {
      setFormErrors({
        general: 'Your previous signup information was lost. Please fill out the form again.'
      });
      // Reset payment failed state so user can try again with form
      setPaymentFailed(false);
        return;
      }

    try {
      // Parse the stored data
      const pendingSignup = JSON.parse(storedData);
      
      // Use the stored tier to determine payment link
      const paymentLink = pendingSignup.selectedTier === 'basic'
        ? 'https://buy.stripe.com/3csbJDf1D9eQ0FybIJ'  // Basic plan link
        : 'https://buy.stripe.com/6oE7tnbPrfDecogfYY'; // Pro plan link
      
      // Add session ID as a query param if available
      const sessionId = pendingSignup.sessionId || localStorage.getItem('signupSessionId');
      const paymentLinkWithParams = new URL(paymentLink);
      if (sessionId) {
        paymentLinkWithParams.searchParams.append('session_id', sessionId);
      }
      
      // Redirect to Stripe payment page again
      window.location.href = paymentLinkWithParams.toString();
    } catch (error) {
      setFormErrors({
        general: 'Failed to process your request. Please try signing up again.'
      });
      // Clear any potentially corrupted data
      localStorage.removeItem('pendingSignup');
      localStorage.removeItem('requirePasswordConfirmation');
      localStorage.removeItem('authVerification');
      localStorage.removeItem('authTimestamp');
      localStorage.removeItem('signupSessionId');
      // Reset payment failed state to show normal signup form
      setPaymentFailed(false);
    }
  }, []);

  // Handler for continuing registration after abandoning payment flow
  const handleContinueRegistration = useCallback(() => {
    handleRetryPayment();
  }, [handleRetryPayment]);

  // Render payment failure UI
  const renderPaymentFailureUI = () => {
    if (!paymentFailed) return null;
    
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-red-300">Payment Not Completed</h2>
        <p className="text-gray-300 mb-4">
          Your payment was not completed successfully. You can try again or choose a different payment method.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRetryPayment}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            Try again
          </button>
          <button
            onClick={() => {
              // Clear saved data and start fresh
              localStorage.removeItem('pendingSignup');
              localStorage.removeItem('requirePasswordConfirmation');
              localStorage.removeItem('authVerification');
              localStorage.removeItem('authTimestamp');
              localStorage.removeItem('signupSessionId');
              setPaymentFailed(false);
            }}
            className="bg-transparent border border-white/20 hover:border-white/40 text-white font-medium py-2 px-4 rounded-md"
          >
            Start over
          </button>
        </div>
      </div>
    );
  };

  // Render continue registration UI
  const renderContinueRegistrationUI = () => {
    if (!continueRegistration) return null;
    
      return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-yellow-300">Registration in Progress</h2>
        <p className="text-gray-300 mb-4">
          You have a registration in progress. Would you like to continue where you left off?
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleContinueRegistration}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            Continue registration
          </button>
          <button
            onClick={() => {
              // Clear saved data and start fresh
              localStorage.removeItem('pendingSignup');
              localStorage.removeItem('requirePasswordConfirmation');
              localStorage.removeItem('authVerification');
              localStorage.removeItem('authTimestamp');
              localStorage.removeItem('signupSessionId');
              setContinueRegistration(false);
            }}
            className="bg-transparent border border-white/20 hover:border-white/40 text-white font-medium py-2 px-4 rounded-md"
          >
            Start over
          </button>
        </div>
        </div>
      );
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

        {/* Display payment failure UI */}
        {renderPaymentFailureUI()}
        
        {/* Display continue registration UI */}
        {renderContinueRegistrationUI()}

        {emailConfirmationSent ? (
          <div className="bg-[#1e1e1e]/50 backdrop-blur-sm border border-[#88B04B]/20 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#88B04B]/20 mb-4">
                <Shield className="w-8 h-8 text-[#88B04B]" />
              </div>
              <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
              <p className="text-gray-300 mb-6">
                Please check your email to verify your account. We've sent a verification link to <span className="font-semibold">{confirmedEmail}</span>.
              </p>
                <button
                  onClick={handleResendConfirmation}
                  disabled={isSubmitting}
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#88B04B] hover:bg-[#6A9A2D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#88B04B] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </>
                  ) : (
                  'Resend confirmation email'
                  )}
                </button>
              {formErrors.general && (
                <p className="mt-4 text-red-500">{formErrors.general}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#1e1e1e]/50 backdrop-blur-sm border border-[#88B04B]/20 rounded-lg p-8">
            {formErrors.general && (
              <div className="p-4 mb-6 bg-red-900/20 border border-red-500/30 rounded-md">
                <p className="text-red-400">{formErrors.general}</p>
              </div>
            )}

            {(!paymentFailed && !continueRegistration) && (
              <>
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  {/* Subscription tiers */}
                  <div className="md:w-1/2 space-y-4">
                    <h2 className="text-lg font-semibold mb-2">Choose Your Plan</h2>
                    {subscriptionTiers.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => setFormData({ ...formData, selectedTier: tier.id })}
                        className={`relative cursor-pointer rounded-lg p-4 border transition-all ${
                          formData.selectedTier === tier.id
                            ? 'border-[#88B04B] bg-[#88B04B]/10'
                            : 'border-gray-700 hover:border-gray-500 bg-gray-800/20'
                        }`}
                      >
                        {tier.recommended && (
                          <span className="absolute -top-3 right-4 bg-[#88B04B] text-black text-xs px-2 py-1 rounded-full font-medium">
                            Recommended
                          </span>
                        )}
                        <div className="flex justify-between items-start mb-2">
              <div>
                            <h3 className="font-bold">{tier.name}</h3>
                            <p className="text-sm text-gray-300">{tier.price}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                            formData.selectedTier === tier.id
                              ? 'border-[#88B04B] bg-[#88B04B]'
                              : 'border-gray-500'
                          }`}>
                            {formData.selectedTier === tier.id && (
                              <Check className="w-3 h-3 text-black" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{tier.description}</p>
                        <ul className="space-y-2">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="flex text-sm items-start gap-2">
                              <Check className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Signup form */}
                  <form className="md:w-1/2" onSubmit={handleSubmit}>
                    <h2 className="text-lg font-semibold mb-4">Your Details</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                          Name
                </label>
                <input
                  id="name"
                          type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-3 py-2 bg-gray-800/50 border ${
                            formErrors.name ? 'border-red-500' : 'border-gray-700'
                          } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#88B04B] focus:border-[#88B04B]`}
                          placeholder="Your name"
                          aria-label="Name"
                />
                {formErrors.name && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                          Email
                </label>
                <input
                  id="email"
                          type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full px-3 py-2 bg-gray-800/50 border ${
                            formErrors.email ? 'border-red-500' : 'border-gray-700'
                          } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#88B04B] focus:border-[#88B04B]`}
                          placeholder="Your email"
                          aria-label="Email"
                />
                {formErrors.email && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                )}
              </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                            type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full px-3 py-2 pr-10 bg-gray-800/50 border ${
                              formErrors.password ? 'border-red-500' : 'border-gray-700'
                            } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#88B04B] focus:border-[#88B04B]`}
                            placeholder="Create a strong password"
                            aria-label="Password"
                    />
                    <button
                      type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <Eye className="h-5 w-5" aria-hidden="true" />
                            )}
                    </button>
                  </div>
                  {formErrors.password && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                  )}
                </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`w-full px-3 py-2 pr-10 bg-gray-800/50 border ${
                              formErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                            } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#88B04B] focus:border-[#88B04B]`}
                            placeholder="Confirm your password"
                            aria-label="Confirm Password"
                    />
                    <button
                      type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <Eye className="h-5 w-5" aria-hidden="true" />
                            )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                  )}
              </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-start">
                  <input
                    id="acceptTerms"
                            type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                            className="h-4 w-4 mt-1 rounded border-gray-600 bg-gray-800 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                          />
                          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-300">
                            I accept the <a href="/terms" className="text-[#88B04B] hover:underline">terms and conditions</a> and <a href="/privacy" className="text-[#88B04B] hover:underline">privacy policy</a>
                  </label>
                </div>
                {formErrors.acceptTerms && (
                          <p className="text-sm text-red-400">{formErrors.acceptTerms}</p>
                )}

                        <div className="flex items-start">
                  <input
                            id="ageVerification"
                    type="checkbox"
                            checked={formData.ageVerification}
                            onChange={(e) => setFormData({ ...formData, ageVerification: e.target.checked })}
                            className="h-4 w-4 mt-1 rounded border-gray-600 bg-gray-800 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                          />
                          <label htmlFor="ageVerification" className="ml-2 block text-sm text-gray-300">
                            I am at least 18 years old
                  </label>
                </div>
                        {formErrors.ageVerification && (
                          <p className="text-sm text-red-400">{formErrors.ageVerification}</p>
                        )}

                        <div className="flex items-start">
                  <input
                            id="marketingConsent"
                    type="checkbox"
                            checked={formData.marketingConsent}
                            onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                            className="h-4 w-4 mt-1 rounded border-gray-600 bg-gray-800 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                          />
                          <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-300">
                            I would like to receive news, tips and updates (optional)
                  </label>
                </div>

                        <div className="flex items-start">
                  <input
                            id="dataProcessingConsent"
                    type="checkbox"
                            checked={formData.dataProcessingConsent}
                            onChange={(e) => setFormData({ ...formData, dataProcessingConsent: e.target.checked })}
                            className="h-4 w-4 mt-1 rounded border-gray-600 bg-gray-800 text-[#88B04B] focus:ring-[#88B04B] focus:ring-offset-0"
                          />
                          <label htmlFor="dataProcessingConsent" className="ml-2 block text-sm text-gray-300">
                            I consent to the processing of my financial data to receive personalized recommendations (optional)
                  </label>
                </div>
                      </div>
              </div>

                    <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-[#88B04B] hover:bg-[#6A9A2D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#88B04B] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                            <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                            Create Account
                            <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
                    
                    <div className="mt-6 text-center text-sm text-gray-400">
                      Already have an account?{' '}
                      <Link to="/signin" className="text-[#88B04B] hover:underline">
                        Sign in
                      </Link>
              </div>
            </form>
          </div>
              </>
            )}
                </div>
        )}
      </div>
    </div>
  );
}