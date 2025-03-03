import { memo } from 'react';
import { Calendar, Plus, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface NextPaymentProps {
  dueDate?: Date;
  amount?: number;
  payeeName?: string;
  category?: string;
  onAddPayment: () => void;
  onViewDetails: () => void;
}

export const NextPayment = memo(function NextPayment({ 
  dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
  amount = 0, 
  payeeName = '',
  category = '',
  onAddPayment,
  onViewDetails 
}: NextPaymentProps) {
  
  const hasPayment = payeeName && amount > 0;
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isToday = daysUntilDue === 0;
  const isUpcoming = daysUntilDue > 0 && daysUntilDue <= 3;
  
  // Calculate progress for visual indicator
  const progressValue = isOverdue ? 100 : Math.max(0, Math.min(100, 100 - (daysUntilDue / 30) * 100));
  
  // Determine status text and color
  let statusText = '';
  let statusColor = '';
  
  if (isOverdue) {
    statusText = `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    statusColor = 'text-red-500';
  } else if (isToday) {
    statusText = 'Due today';
    statusColor = 'text-amber-500';
  } else if (isUpcoming) {
    statusText = `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
    statusColor = 'text-amber-500';
  } else {
    statusText = `Due in ${daysUntilDue} days`;
    statusColor = 'text-white/70';
  }
  
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Next Payment</h2>
        {hasPayment && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-white border-white/20 hover:bg-white/10"
            onClick={onViewDetails}
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
      
      {hasPayment ? (
        <div className="space-y-4">
          <div className="bg-black/30 p-5 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">${amount.toLocaleString()}</h3>
                <p className="text-white/60">{payeeName}</p>
              </div>
              <div className="text-right">
                <Badge className={`${isOverdue ? 'bg-red-500/20 text-red-400' : isUpcoming ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'}`}>
                  {category || 'Payment'}
                </Badge>
                <p className={`text-sm mt-2 flex items-center ${statusColor}`}>
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {statusText}
                </p>
              </div>
            </div>

            <Progress value={progressValue} className={`h-2 ${isOverdue ? 'bg-red-950' : isUpcoming ? 'bg-amber-950' : 'bg-white/5'}`} 
                     indicatorClassName={`${isOverdue ? 'bg-red-500' : isUpcoming ? 'bg-amber-500' : 'bg-green-500'}`} />
                     
            <div className="flex justify-between mt-4">
              <p className="text-sm text-white/60 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                Pay Now
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-sm text-white/60 mb-1">Previous Payment</p>
              <p className="text-lg font-medium text-white">$245.00</p>
              <p className="text-xs text-white/60 mt-1">July 15, 2023</p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-sm text-white/60 mb-1">Payment Method</p>
              <p className="text-lg font-medium text-white">Chase ****2519</p>
              <p className="text-xs text-white/60 mt-1">Auto-payment enabled</p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-sm text-white/60 mb-1">Status</p>
              <p className="text-lg font-medium text-green-400">Scheduled</p>
              <p className="text-xs text-white/60 mt-1">Will be paid automatically</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-10 bg-black/30 rounded-xl">
          <Calendar className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No upcoming payments</h3>
          <p className="text-white/60 mb-6">Add your next payment to get reminders and stay on track</p>
          <Button onClick={onAddPayment} className="bg-white/10 hover:bg-white/20 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Payment
          </Button>
        </div>
      )}
    </div>
  );
});

// Add default export for lazy loading
export default NextPayment; 