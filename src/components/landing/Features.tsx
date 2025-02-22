import { motion, useScroll, useTransform } from 'framer-motion';
import { Calculator, Wallet, TrendingUp, Brain, Shield } from 'lucide-react';
import { useRef } from 'react';

interface Section {
  title: string;
  content: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: typeof Calculator;
  sections: readonly Section[];
  index: number;
}

const FEATURES = [
  {
    title: "AI-Powered Analysis",
    description: "Our advanced AI system analyzes your financial data in real-time to provide personalized recommendations.",
    icon: Brain,
    sections: [
      { title: "Real-Time Analysis", content: "Secure connection to your financial institutions for up-to-date insights" },
      { title: "Smart Recommendations", content: "AI-driven suggestions based on your spending patterns and goals" },
      { title: "Adaptive Strategies", content: "Dynamic strategy adjustments as your financial situation changes" }
    ]
  },
  {
    title: "Personalized Debt Planning",
    description: "Get a customized debt management plan that adapts to your unique financial situation.",
    icon: Calculator,
    sections: [
      { title: "Custom Strategy Creation", content: "AI tailors Snowball or Avalanche methods to your specific needs" },
      { title: "Payment Optimization", content: "Smart scheduling based on your income patterns and expenses" },
      { title: "Goal Tracking", content: "AI-powered progress monitoring and milestone celebrations" }
    ]
  },
  {
    title: "Smart Financial Tools",
    description: "Leverage AI-enhanced tools to maximize your debt repayment efficiency.",
    icon: Wallet,
    sections: [
      { title: "Intelligent Budgeting", content: "AI analyzes spending patterns to find extra debt payment opportunities" },
      { title: "Automated Tracking", content: "Real-time monitoring of all your accounts and debts" },
      { title: "Smart Alerts", content: "AI-powered notifications for payment optimization and savings opportunities" }
    ]
  },
  {
    title: "Secure Data Management",
    description: "Bank-grade security protecting your sensitive financial information.",
    icon: Shield,
    sections: [
      { title: "Encrypted Connection", content: "256-bit SSL encryption for all financial data transfers" },
      { title: "Secure Analysis", content: "AI processing with end-to-end data encryption" },
      { title: "Privacy First", content: "Your data is never shared or sold to third parties" }
    ]
  }
] as const;

function FeatureCard({ title, description, icon: Icon, sections, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity }}
      className="relative group"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="relative bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 hover:border-[#88B04B]/30 transition-colors overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#88B04B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
        />
        
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#88B04B]/20 flex items-center justify-center group-hover:bg-[#88B04B]/30 transition-colors">
              <Icon className="w-6 h-6 text-[#88B04B]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <h4 className="text-white font-medium mb-2">{section.title}</h4>
                <p className="text-sm text-gray-400">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <div className="relative py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
          Powerful Features to Manage Your Debt
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Take control of your financial future with our comprehensive suite of debt management tools
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}