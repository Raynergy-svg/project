import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import axios from 'axios';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('Premium');

  useEffect(() => {
    // Extract session_id from URL
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setError('No session ID found. Please contact support if you believe this is an error.');
      setLoading(false);
      return;
    }

    // Verify the payment session
    const verifyPayment = async () => {
      try {
        // Call your API to verify the payment session
        const response = await axios.get(`/api/subscription/verify-session?session_id=${sessionId}`);
        
        // Handle successful payment verification
        if (response.data.success) {
          // Reset URL without session_id parameter to avoid refreshing issues
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          // Set subscription plan from response
          if (response.data.plan) {
            setSubscriptionPlan(response.data.plan);
          }
          
          // Show success toast
          toast({
            title: 'Payment successful!',
            description: 'Thank you for your subscription. Your account has been upgraded.',
            variant: 'default',
          });
          
          // Show onboarding after a short delay
          setTimeout(() => {
            setShowOnboarding(true);
            setLoading(false);
          }, 2000);
        } else {
          setError('Unable to verify your payment. Please contact support for assistance.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('An error occurred while verifying your payment. Please contact support.');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  const handleOnboardingComplete = () => {
    // Navigate to dashboard after onboarding
    navigate('/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-4">
        <div className="max-w-md w-full bg-[#1A1A1A] rounded-xl p-8 shadow-lg">
          <div className="bg-red-500/20 p-3 rounded-full w-fit mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center mb-4">Payment Verification Failed</h1>
          <p className="text-white/70 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !showOnboarding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] p-4">
        <div className="w-16 h-16 border-t-4 border-[#88B04B] border-solid rounded-full animate-spin mb-8"></div>
        <h2 className="text-xl font-semibold mb-2">Verifying your payment</h2>
        <p className="text-white/70">Please wait while we confirm your subscription...</p>
      </div>
    );
  }

  if (showOnboarding) {
    return <UserOnboarding onComplete={handleOnboardingComplete} subscriptionPlan={subscriptionPlan} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#1A1A1A] rounded-xl p-8 shadow-lg"
      >
        <div className="bg-[#88B04B]/20 p-3 rounded-full w-fit mx-auto mb-6">
          <Check className="h-8 w-8 text-[#88B04B]" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">Payment Successful!</h1>
        <p className="text-white/70 text-center mb-6">
          Thank you for subscribing to our service. Your account has been upgraded to {subscriptionPlan}.
        </p>
        <div className="flex justify-center">
          <button 
            onClick={() => setShowOnboarding(true)}
            className="bg-[#88B04B] hover:bg-[#7A9B3B] text-white py-2 px-6 rounded-lg transition-colors"
          >
            Continue to Setup
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess; 