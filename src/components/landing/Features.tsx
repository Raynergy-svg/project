import { motion } from 'framer-motion';
import { 
  Brain, 
  Calculator, 
  BarChart,
  Sparkles,
  ArrowRight,
  Wallet,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    title: "AI-Powered Analysis",
    description: "Our advanced AI system analyzes your financial data in real-time to provide personalized recommendations and insights.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200",
    benefits: [
      "Real-time financial analysis",
      "Personalized debt strategies",
      "Smart payment optimization",
      "Save up to 35% more with AI-optimized plans"
    ]
  },
  {
    title: "Smart Financial Tools",
    description: "Leverage our comprehensive suite of tools designed to help you manage and eliminate debt effectively.",
    icon: Calculator,
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200",
    benefits: [
      "Debt payoff calculator",
      "Budget optimization",
      "Progress tracking",
      "Reach your goals 2x faster"
    ]
  },
  {
    title: "Financial Insights",
    description: "Get deep insights into your spending patterns and debt repayment progress with advanced analytics.",
    icon: BarChart,
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=1200",
    benefits: [
      "Spending pattern analysis",
      "Debt reduction forecasting",
      "Custom reporting",
      "Data-driven recommendations"
    ]
  }
];

function FeatureCard({ title, description, icon: Icon, image, benefits, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#88B04B]/30 transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      
      <div className="p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-[#88B04B]/10 flex items-center justify-center">
            <Icon className="w-7 h-7 text-[#88B04B]" />
          </div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 mb-6 text-lg">{description}</p>
        
        <ul className="space-y-3">
          {benefits.map((benefit: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-gray-300">
              <Sparkles className="w-5 h-5 text-[#88B04B]" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

interface FeaturesProps {
  id?: string;
}

export default function Features({ id }: FeaturesProps) {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/signup?plan=trial');
  };

  return (
    <div id={id} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#88B04B] rounded-full blur-[120px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#88B04B]/10 rounded-full px-4 py-2">
            <Sparkles className="w-5 h-5 text-[#88B04B]" />
            <span className="text-[#88B04B] font-semibold">AI-Powered Features</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            onClick={handleExploreClick}
            className="group px-6 py-3 bg-[#88B04B] hover:bg-[#88B04B]/90 text-white rounded-xl font-semibold text-lg"
          >
            <span className="flex items-center gap-2">
              Explore All Features
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}