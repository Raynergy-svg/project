import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SubscriptionTier } from '@/types';

const tiers: SubscriptionTier[] = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Basic Budget Analyzer',
      'Simple Debt Repayment Plans',
      'Expense Tracking',
      'Monthly Financial Reports',
      'Email Support'
    ]
  },
  {
    name: 'Premium',
    price: 9.99,
    features: [
      'Advanced Budget Analysis',
      'AI-Powered Debt Strategies',
      'Credit Score Tracking',
      'Investment Recommendations',
      'Saving Projections',
      'Custom Repayment Plans',
      'Priority Support',
      'Detailed Financial Reports'
    ],
    isPopular: true
  }
];

interface PricingPlansProps {
  onSelectPlan: (plan: SubscriptionTier) => void;
  currentPlan?: 'Free' | 'Premium';
}

export function PricingPlans({ onSelectPlan, currentPlan }: PricingPlansProps) {
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Start with a 7-day free trial of our Premium features. 
            Cancel anytime during the trial period.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative bg-[#2A2A2A] rounded-2xl p-8 border ${
                tier.isPopular 
                  ? 'border-[#88B04B]' 
                  : 'border-white/10'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#88B04B] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </h3>
                <div className="text-4xl font-bold text-white mb-4">
                  ${tier.price}
                  <span className="text-lg text-white/60">/month</span>
                </div>
                {tier.name === 'Premium' && (
                  <p className="text-[#88B04B]">
                    Includes 7-day free trial
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li 
                    key={feature}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <Check className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onSelectPlan(tier)}
                className={`w-full h-12 ${
                  tier.isPopular
                    ? 'bg-[#88B04B] hover:bg-[#88B04B]/90'
                    : 'bg-white/10 hover:bg-white/20'
                } text-white font-medium`}
                disabled={currentPlan === tier.name}
              >
                {currentPlan === tier.name
                  ? 'Current Plan'
                  : tier.name === 'Premium'
                  ? 'Start 7-Day Free Trial'
                  : 'Get Started'}
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-white/60 mt-8">
          All plans include our core financial management tools. 
          Premium features are available during the trial period.
        </p>
      </div>
    </div>
  );
}