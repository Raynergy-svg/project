import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';

export interface NextPaymentProps {
  dueDate: string;
  amount: number;
  isAutomated: boolean;
  onSchedule: (amount: number, date: string) => void;
}

export function NextPayment({ dueDate, amount, isAutomated, onSchedule }: NextPaymentProps) {
  // Calculate days until due
  const today = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = differenceInDays(due, today);
  
  // Format the date for display
  const formattedDate = format(due, 'MMMM d, yyyy');
  
  // Determine urgency level
  const getUrgencyColor = () => {
    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue < 3) return 'text-amber-400';
    if (daysUntilDue < 7) return 'text-[#88B04B]';
    return 'text-blue-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#88B04B]/30 to-emerald-500/20">
            <Calendar className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Next Payment</h2>
        </div>
        <Badge 
          variant={isAutomated ? "default" : "outline"} 
          className={isAutomated ? "bg-[#88B04B]/20 text-[#88B04B] hover:bg-[#88B04B]/30" : "text-white/60"}
        >
          {isAutomated ? 'Automated' : 'Manual'}
        </Badge>
      </div>
      
      <motion.div 
        className="p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 rounded-xl bg-[#88B04B]/20">
            <CreditCard className="w-6 h-6 text-[#88B04B]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Payment Amount</p>
              {isAutomated && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-400/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Auto-pay
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              ${amount.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-white/60">Due Date</p>
            <p className="text-lg font-medium text-white mt-1">
              {formattedDate}
            </p>
            <p className={`text-sm mt-1 ${getUrgencyColor()}`}>
              {daysUntilDue < 0 
                ? `Overdue by ${Math.abs(daysUntilDue)} days` 
                : daysUntilDue === 0 
                  ? 'Due today' 
                  : `${daysUntilDue} days remaining`}
            </p>
          </div>
        </div>
        
        <Button 
          className="w-full gap-2 mt-2"
          onClick={() => onSchedule(amount, dueDate)}
          disabled={isAutomated}
          variant={isAutomated ? "outline" : "default"}
        >
          {isAutomated ? 'Payment Scheduled' : 'Schedule Payment'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
      
      {!isAutomated && (
        <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
          <CheckCircle className="w-4 h-4 text-[#88B04B]" />
          <span>Set up auto-pay to never miss a payment</span>
        </div>
      )}
    </motion.div>
  );
} 