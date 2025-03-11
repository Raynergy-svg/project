'use client';

import React from 'react';
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
import { useRouter } from 'next/navigation';

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
      className="relative bg-card rounded-xl overflow-hidden border border-border"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          width={800}
          height={400}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.complete) {
              img.style.opacity = '1';
            }
          }}
          style={{ opacity: 0, transition: 'opacity 0.3s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      
      <div className="p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
            <Icon className="w-7 h-7 text-[#1DB954]" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        </div>
        
        <p className="text-muted-foreground mb-6 text-lg">{description}</p>
        
        <ul className="space-y-3">
          {benefits.map((benefit: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-muted-foreground">
              <Sparkles className="w-5 h-5 text-[#1DB954]" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

interface FeaturesProps {
  onFeatureClick?: (featureId: string) => void;
  id?: string;
}

export default function Features({ onFeatureClick, id = 'features' }: FeaturesProps) {
  const router = useRouter();
  
  const handleExploreClick = () => {
    if (onFeatureClick) {
      onFeatureClick('all');
    } else {
      router.push('/features');
    }
  };
  
  return (
    <div id={id} className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">Powerful Features to Eliminate Debt</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with proven financial strategies to help you become debt-free faster.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
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
            className="px-6 py-3 bg-[#1DB954] hover:bg-[#1DB954]/90 text-white rounded-xl font-semibold text-lg"
          >
            <span className="flex items-center gap-2">
              Explore All Features
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}