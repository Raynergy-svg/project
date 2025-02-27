import { CardElement } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';
import { AccessibleStripeWrapper } from './AccessibleStripeWrapper';
import { useState, useEffect } from 'react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#fff',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aaa'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  },
  hidePostalCode: true
};

interface StripeCardInputProps {
  onChange?: (event: any) => void;
  className?: string;
}

export function StripeCardInput({ onChange, className = '' }: StripeCardInputProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate a short loading state to ensure Stripe elements are ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`space-y-4 ${className}`}>
      <AccessibleStripeWrapper
        id="stripe-card-element-wrapper"
        isLoading={isLoading}
        loadingText="Preparing secure payment form..."
      >
        <div className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus-within:border-[#88B04B]">
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={onChange} />
        </div>
      </AccessibleStripeWrapper>
      
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Lock className="w-4 h-4" />
        <span>Your payment info is secure and encrypted</span>
      </div>
    </div>
  );
} 