import { memo } from 'react';
import { NextPayment as NextPaymentType } from '@/lib/dashboardConstants';
import { CalendarDays, ArrowRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { motion } from 'framer-motion';

export interface NextPaymentProps {
  nextPayment: NextPaymentType | null;
  onViewAllPayments: () => void;
  onPayNow: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export const NextPayment = memo(function NextPayment({ 
  nextPayment, 
  onViewAllPayments, 
  onPayNow 
}: NextPaymentProps) {
  if (!nextPayment) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="h-full p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-5"
        >
          <h2 className="text-xl font-semibold text-white">Next Payment</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 bg-white/5 hover:bg-white/10"
              onClick={onViewAllPayments}
            >
              View All
            </Button>
          </motion.div>
        </motion.div>
        <motion.div 
          variants={itemVariants}
          className="bg-black/20 rounded-xl p-8 flex flex-col items-center justify-center border border-white/5 h-[calc(100%-3.5rem)]"
        >
          <CalendarDays className="w-10 h-10 text-white/30 mb-4" />
          <p className="text-white/60 text-center">No upcoming payments</p>
          <motion.div 
            className="mt-4"
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={onViewAllPayments}
            >
              View Payment Calendar
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const dueDate = new Date(nextPayment.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const dueToday = isToday(dueDate);
  const dueTomorrow = isTomorrow(dueDate);
  
  let dueDateText = '';
  let StatusIcon = Clock;

  if (isOverdue) {
    dueDateText = `Overdue by ${formatDistanceToNow(dueDate)}`;
    StatusIcon = AlertCircle;
  } else if (dueToday) {
    dueDateText = 'Due Today';
    StatusIcon = Clock;
  } else if (dueTomorrow) {
    dueDateText = 'Due Tomorrow';
    StatusIcon = Clock;
  } else {
    dueDateText = `Due in ${formatDistanceToNow(dueDate)}`;
    StatusIcon = CheckCircle;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
    >
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center mb-5"
      >
        <h2 className="text-xl font-semibold text-white">Next Payment</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 bg-white/5 hover:bg-white/10"
            onClick={onViewAllPayments}
          >
            View All
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="bg-black/20 rounded-xl p-5 border border-white/5"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#88B04B]/20 flex items-center justify-center mr-4">
              <CalendarDays className="w-6 h-6 text-[#88B04B]" />
            </div>
            <div>
              <h3 className="font-medium text-white">{nextPayment.payeeName}</h3>
              <p className="text-sm text-white/60">{nextPayment.accountName || 'Payment'}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">${nextPayment.amount.toLocaleString()}</p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-black/30 rounded-lg p-4 mb-4 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white/60">Due Date</p>
              <p className="text-white">{dueDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
              isOverdue 
                ? 'bg-red-500/20 text-red-300' 
                : dueToday 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {dueDateText}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex justify-between gap-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10"
              onClick={onViewAllPayments}
            >
              Payment Details <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
              onClick={onPayNow}
            >
              Pay Now
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

// Add default export for lazy loading
export default NextPayment; 