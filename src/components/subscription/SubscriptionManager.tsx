import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SubscriptionTier } from '@/types';

interface SubscriptionManagerProps {
  currentPlan: SubscriptionTier['name'];
  nextBillingDate?: string;
  onCancelSubscription: () => void;
  onUpdatePayment: () => void;
}

export function SubscriptionManager({
  currentPlan,
  nextBillingDate,
  onCancelSubscription,
  onUpdatePayment
}: SubscriptionManagerProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="bg-[#2A2A2A] rounded-xl border border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Subscription Management
      </h3>

      <div className="space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <p className="text-white/80 mb-1">Current Plan</p>
            <p className="text-white font-semibold text-lg">
              {currentPlan} Plan
            </p>
          </div>
          {currentPlan === 'Premium' && (
            <div className="flex items-center gap-2 text-[#88B04B]">
              <Shield className="w-5 h-5" />
              <span>Active</span>
            </div>
          )}
        </div>

        {nextBillingDate && (
          <div className="flex items-center gap-3 text-white/80">
            <Calendar className="w-5 h-5" />
            <span>Next billing date: {nextBillingDate}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onUpdatePayment}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Update Payment
          </Button>

          {currentPlan === 'Premium' && !showCancelConfirm ? (
            <Button
              onClick={() => setShowCancelConfirm(true)}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              Cancel Subscription
            </Button>
          ) : null}
        </div>

        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 rounded-lg p-4 mt-4"
          >
            <p className="text-white mb-4">
              Are you sure you want to cancel your Premium subscription? 
              You'll lose access to all premium features at the end of your current billing period.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={onCancelSubscription}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Cancel
              </Button>
              <Button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white"
              >
                Keep Premium
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}