import { motion } from 'framer-motion';
import { CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface NextPaymentProps {
  dueDate: string;
  amount: number;
  isAutomated: boolean;
  onSchedule: (amount: number, date: string) => void;
}

export function NextPayment({ dueDate, amount, isAutomated, onSchedule }: NextPaymentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Next Payment</h2>
        <Badge variant="outline" className="text-[#88B04B]">
          {isAutomated ? 'Automated' : 'Manual'}
        </Badge>
      </div>
      <div className="p-4 rounded-xl bg-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 rounded-lg bg-[#88B04B]/20">
            <CreditCard className="w-5 h-5 text-[#88B04B]" />
          </div>
          <div>
            <p className="text-sm text-white/60">Due in {dueDate}</p>
            <p className="text-2xl font-bold text-white mt-1">
              ${amount.toLocaleString()}
            </p>
          </div>
        </div>
        <Button 
          className="w-full gap-2"
          onClick={() => onSchedule(amount, dueDate)}
          disabled={isAutomated}
        >
          {isAutomated ? 'Payment Scheduled' : 'Schedule Payment'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
} 