import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentMethodFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export function PaymentMethodForm({ onSubmit, onCancel }: PaymentMethodFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          Payment Method
        </h3>
        <div className="flex items-center gap-2 text-white/60">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Secure Payment</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="cardNumber" 
            className="block text-white/80 mb-2"
          >
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="cardNumber"
              maxLength={19}
              value={formData.cardNumber}
              onChange={(e) => setFormData({
                ...formData,
                cardNumber: formatCardNumber(e.target.value)
              })}
              className="w-full h-12 bg-[#1E1E1E] rounded-lg px-4 text-white border border-white/10 focus:border-[#88B04B] transition-colors pl-12"
              placeholder="1234 5678 9012 3456"
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="expiryDate" 
              className="block text-white/80 mb-2"
            >
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              maxLength={5}
              value={formData.expiryDate}
              onChange={(e) => setFormData({
                ...formData,
                expiryDate: formatExpiryDate(e.target.value)
              })}
              className="w-full h-12 bg-[#1E1E1E] rounded-lg px-4 text-white border border-white/10 focus:border-[#88B04B] transition-colors"
              placeholder="MM/YY"
            />
          </div>

          <div>
            <label 
              htmlFor="cvv" 
              className="block text-white/80 mb-2"
            >
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              maxLength={3}
              value={formData.cvv}
              onChange={(e) => setFormData({
                ...formData,
                cvv: e.target.value.replace(/\D/g, '')
              })}
              className="w-full h-12 bg-[#1E1E1E] rounded-lg px-4 text-white border border-white/10 focus:border-[#88B04B] transition-colors"
              placeholder="123"
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="name" 
            className="block text-white/80 mb-2"
          >
            Name on Card
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value
            })}
            className="w-full h-12 bg-[#1E1E1E] rounded-lg px-4 text-white border border-white/10 focus:border-[#88B04B] transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-[#88B04B] hover:bg-[#88B04B]/90 text-white h-12"
          >
            Save Payment Method
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white h-12"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}