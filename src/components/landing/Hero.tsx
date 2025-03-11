import { motion } from "framer-motion";
import { Shield, Check, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { Button } from "@/components/ui/button";
import type { SubscriptionTier } from "@/types";

const tiers: SubscriptionTier[] = [
  {
    name: "Basic",
    price: 20,
    features: [
      "7-day free trial",
      "Basic debt calculator",
      "Single debt strategy",
      "Monthly payment tracking",
      "Basic spending insights",
      "Limited AI Tokens (100/mo)"
    ],
  },
  {
    name: "Pro",
    price: 50,
    features: [
      "Advanced debt calculator",
      "All debt strategies",
      "Real-time payment tracking",
      "Deep financial insights",
      "Unlimited AI Tokens",
      "Priority Support"
    ],
    isPopular: true,
  }
];

interface HeroProps {
  onSelectPlan?: (plan: SubscriptionTier) => void;
}

export function Hero({ onSelectPlan }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const { isDesktop } = useDeviceContext();

  const titleAnimation = prefersReducedMotion
    ? { opacity: 1, y: 0, scale: 1 }
    : {
        opacity: [0, 1],
        y: [20, 0],
        scale: [0.98, 1],
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="hero-heading">
      <div className="text-center mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={titleAnimation}
          className="space-y-6"
        >
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-['Poppins'] leading-[1.1] tracking-tight"
          >
            <span className="inline-block bg-gradient-to-r from-[#1DB954] via-[#1DB954] to-[#19A449] bg-clip-text text-transparent pb-2">
              Take Control of Your
              <br className="hidden sm:block" /> Financial Future
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-['Inter'] leading-relaxed px-4">
            Join 15,000+ users who reduced debt by an average of 40% in their
            first year. Start your risk-free trial today with AI-powered
            financial optimization.
          </p>
        </motion.div>

        {/* Pricing Plans */}
        <div
          role="region"
          aria-label="Pricing plans"
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mt-12"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={
                isDesktop ? { y: -5, transition: { duration: 0.2 } } : {}
              }
              className={`relative bg-[#2A2A2A] rounded-xl p-6 sm:p-8 border ${
                tier.isPopular
                  ? "border-[#1DB954] shadow-lg shadow-[#1DB954]/10"
                  : "border-white/10"
              }`}
              role="article"
              aria-labelledby={`tier-${tier.name}`}
            >
              {tier.isPopular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                  aria-label="Most popular plan"
                >
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#1DB954] text-white px-4 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1.5"
                  >
                    Most Popular
                  </motion.span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3
                  id={`tier-${tier.name}`}
                  className="text-xl font-bold text-white mb-2"
                >
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold text-white mb-2">
                  <span className="sr-only">Price:</span>${tier.price}
                  <span className="text-lg text-white/60">/month</span>
                </div>
                {tier.name === "Premium" && (
                  <p className="text-[#1DB954] text-sm">
                    Includes 7-day free trial
                  </p>
                )}
              </div>

              <ul
                className="space-y-3 mb-6"
                aria-label={`${tier.name} plan features`}
              >
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <Check
                      className="w-5 h-5 text-[#1DB954] flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onSelectPlan?.(tier)}
                className={`w-full h-12 ${
                  tier.isPopular
                    ? "bg-[#1DB954] hover:bg-[#1DB954]/90"
                    : "bg-white/10 hover:bg-white/20"
                } text-white font-medium group`}
                aria-label={`Select ${tier.name} plan`}
              >
                <span className="flex items-center justify-center gap-2">
                  {tier.name === "Basic"
                    ? "Get Started"
                    : tier.name === "Premium"
                    ? "Start 7-Day Free Trial"
                    : "Contact Sales"}
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Security Badge */}
        <div
          className="mt-8 sm:mt-12 flex items-center justify-center gap-2 text-white/70 text-sm"
          role="complementary"
          aria-label="Security information"
        >
          <Shield className="text-[#1DB954] w-4 h-4" aria-hidden="true" />
          <span className="font-['Inter']">
            256-bit Encryption • SOC 2 Certified
          </span>
        </div>
      </div>
    </section>
  );
}
