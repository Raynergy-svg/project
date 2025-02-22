import { Brain, TrendingDown, BarChart2, Shield, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FeatureSection {
  title: string;
  content: string;
}

export interface FeaturePanel {
  title: string;
  icon: LucideIcon;
  sections: FeatureSection[];
}

export interface FeaturePanelsData {
  ai: FeaturePanel;
  optimization: FeaturePanel;
  tracking: FeaturePanel;
}

export const featurePanelsData: FeaturePanelsData = {
  ai: {
    title: "AI-Powered Analysis",
    icon: Brain,
    sections: [
      {
        title: "Smart Debt Analysis",
        content: "Our AI analyzes your financial situation to create a personalized debt elimination strategy that fits your lifestyle."
      },
      {
        title: "Continuous Learning",
        content: "The system learns from successful debt payoff patterns to optimize your strategy in real-time."
      },
      {
        title: "Predictive Insights",
        content: "Get ahead of potential financial challenges with AI-powered predictions and recommendations."
      }
    ]
  },
  optimization: {
    title: "Smart Optimization",
    icon: BarChart2,
    sections: [
      {
        title: "Interest Minimization",
        content: "Advanced algorithms work to minimize your total interest payments through strategic debt allocation."
      },
      {
        title: "Payment Optimization",
        content: "Automatically adjust payment strategies based on your changing financial situation."
      },
      {
        title: "Risk Management",
        content: "Proactive identification and mitigation of potential financial risks in your debt payoff journey."
      }
    ]
  },
  tracking: {
    title: "Real-Time Tracking",
    icon: TrendingDown,
    sections: [
      {
        title: "Progress Dashboard",
        content: "Visual tracking of your debt payoff progress with detailed metrics and milestones."
      },
      {
        title: "Payment Analytics",
        content: "Comprehensive analysis of your payment history and its impact on your debt-free timeline."
      },
      {
        title: "Goal Monitoring",
        content: "Track your progress against personalized financial goals with real-time updates."
      }
    ]
  }
};