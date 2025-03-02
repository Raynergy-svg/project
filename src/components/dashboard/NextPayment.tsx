import { CreditCard, ArrowRight, Calendar, Clock, CheckCircle, Bell, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

export interface NextPaymentProps {
  dueDate: string;
  amount: number;
  isAutomated: boolean;
  onSchedule: (amount: number, date: string) => void;
}

export function NextPayment({ dueDate, amount, isAutomated, onSchedule }: NextPaymentProps) {
  // Calculate days until due
  const today = new Date();
  const due = dueDate ? new Date(dueDate) : new Date();
  const daysUntilDue = differenceInDays(due, today);
  
  // Format the date for display
  const formattedDate = dueDate ? format(due, 'MMMM d, yyyy') : 'Not scheduled';
  
  // Determine urgency level
  const getUrgencyColor = () => {
    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue < 3) return 'text-amber-400';
    if (daysUntilDue < 7) return 'text-[#88B04B]';
    return 'text-blue-400';
  };

  // Get urgency status 
  const getUrgencyStatus = () => {
    if (isPast(due)) return 'Overdue';
    if (isToday(due)) return 'Due today';
    if (daysUntilDue < 3) return 'Due soon';
    if (daysUntilDue < 7) return 'Upcoming';
    return 'Scheduled';
  };

  return (
    <div
      className="p-6 rounded-2xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
            <Calendar className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Next Payment</h2>
        </div>
        <Badge 
          variant={isAutomated ? "default" : "outline"} 
          className={isAutomated ? "bg-[#88B04B]/20 text-[#88B04B] hover:bg-[#88B04B]/30 border-[#88B04B]/30" : "text-white/60 border-white/20"}
        >
          <div className="flex items-center gap-1.5">
            {isAutomated ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Automated</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Manual</span>
              </>
            )}
          </div>
        </Badge>
      </div>
      
      <div 
        className="p-5 rounded-xl bg-white/5 border border-white/10 relative"
      >
        {/* Conditional highlight for urgent payments */}
        {daysUntilDue <= 3 && daysUntilDue >= 0 && (
          <div className="absolute -right-1 -top-1 w-5 h-5 bg-amber-400 rounded-full" />
        )}
        {daysUntilDue < 0 && (
          <div className="absolute -right-1 -top-1 w-5 h-5 bg-red-500 rounded-full" />
        )}
        
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 rounded-xl bg-[#88B04B]/20 border border-[#88B04B]/30">
            <DollarSign className="w-6 h-6 text-[#88B04B]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Payment Amount</p>
              {isAutomated && (
                <Badge variant="outline" className="bg-[#88B04B]/10 text-[#88B04B] border-[#88B04B]/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Auto-pay
                </Badge>
              )}
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-white mt-1">
                ${amount.toLocaleString()}
              </p>
              
              {dueDate && (
                <Badge 
                  className={`ml-3 ${getUrgencyColor()} bg-opacity-10 border-opacity-20`}
                  variant="outline"
                >
                  {getUrgencyStatus()}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 rounded-xl bg-[#88B04B]/20 border border-[#88B04B]/30">
            <Clock className="w-6 h-6 text-[#88B04B]" />
          </div>
          <div>
            <p className="text-sm text-white/60">Due Date</p>
            <p className="text-lg font-medium text-white mt-1">
              {formattedDate}
            </p>
            {dueDate && (
              <p className={`text-sm mt-1 ${getUrgencyColor()}`}>
                {daysUntilDue < 0 
                  ? `Overdue by ${Math.abs(daysUntilDue)} days` 
                  : daysUntilDue === 0 
                    ? 'Due today' 
                    : `${daysUntilDue} days remaining`}
              </p>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full gap-2 mt-2 bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
          onClick={() => onSchedule(amount, dueDate)}
          disabled={isAutomated}
          variant={isAutomated ? "outline" : "default"}
        >
          {isAutomated ? 'Payment Scheduled' : 'Schedule Payment'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      
      {!isAutomated && (
        <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
          <CheckCircle className="w-4 h-4 text-[#88B04B]" />
          <span>Set up auto-pay to never miss a payment</span>
        </div>
      )}
    </div>
  );
} 