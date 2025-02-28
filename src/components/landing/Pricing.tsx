import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PricingProps {
  onGetStarted: (planId: string) => void;
}

const subscriptionTiers = [
  {
    id: "basic",
    name: "Basic",
    price: "Free for 7 days, then $20/mo",
    description: "Essential tools to start your debt-free journey with a 7-day free trial",
    features: [
      "7-day free trial",
      "Basic debt calculator",
      "Single debt strategy",
      "Monthly payment tracking",
      "Basic spending insights",
      "Limited AI Tokens (100/mo)"
    ],
    paymentLink: 'https://buy.stripe.com/3csbJDf1D9eQ0FybIJ'
  },
  {
    id: "pro",
    name: "Pro",
    price: "$50/mo",
    description: "Advanced features for faster debt elimination",
    recommended: true,
    features: [
      "Advanced debt calculator",
      "All debt strategies",
      "Real-time payment tracking",
      "Deep financial insights",
      "Unlimited AI Tokens"
    ],
    paymentLink: 'https://buy.stripe.com/6oE7tnbPrfDecogfYY'
  }
];

export default function Pricing({ onGetStarted }: PricingProps) {
  const navigate = useNavigate();

  const handlePlanSelection = (tierId: string) => {
    const selectedTier = subscriptionTiers.find(tier => tier.id === tierId);
    if (selectedTier) {
      onGetStarted(tierId);
    }
  };

  return (
    <section className="py-16" id="pricing-heading">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#88B04B] to-[#6A9A2D]">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Start with a 7-day free trial and accelerate your journey to financial freedom
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {subscriptionTiers.map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`p-8 rounded-xl border backdrop-blur-sm transition-all ${
              tier.recommended
                ? 'border-[#88B04B] bg-[#88B04B]/10'
                : 'border-white/10 bg-white/5 hover:border-[#88B04B]/50'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                <p className="text-3xl font-bold text-[#88B04B] mt-2">{tier.price}</p>
              </div>
              {tier.recommended && (
                <span className="bg-[#88B04B] text-white text-sm px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>

            <p className="text-gray-300 mb-8">{tier.description}</p>

            <div className="space-y-4 mb-8">
              {tier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#88B04B] flex-shrink-0" />
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handlePlanSelection(tier.id)}
              className={`w-full py-6 text-lg font-medium ${
                tier.recommended
                  ? 'bg-[#88B04B] hover:bg-[#7a9d43] text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {tier.id === 'basic' ? 'Start Free Trial' : 'Get Started'}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm">
          All plans include: 
          <span className="text-white ml-2">
            SSL Security • 24/7 Support • Money-back Guarantee
          </span>
        </p>
      </div>
    </section>
  );
}
