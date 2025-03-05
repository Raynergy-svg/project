import { motion } from 'framer-motion';
import { Search, BookOpen, PieChart, DollarSign, Calculator, Lightbulb, BookMarked, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FinancialResources() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: "Debt Reduction Strategies",
      icon: BookOpen,
      items: [
        "Snowball Method",
        "Avalanche Method",
        "Debt Consolidation",
        "Debt Settlement"
      ]
    },
    {
      title: "Budgeting Tools",
      icon: Calculator,
      items: [
        "Creating a Monthly Budget",
        "50/30/20 Rule",
        "Zero-Based Budgeting",
        "Envelope System"
      ]
    },
    {
      title: "Saving Techniques",
      icon: Wallet,
      items: [
        "Emergency Fund Basics",
        "Automated Savings",
        "Saving for Big Purchases",
        "Retirement Planning"
      ]
    }
  ];

  const featuredResources = [
    {
      title: "Understanding Credit Scores",
      icon: TrendingUp,
      description: "Learn how credit scores work and strategies to improve your score"
    },
    {
      title: "Financial Planning Basics",
      icon: PieChart,
      description: "Essential financial planning concepts for long-term stability"
    },
    {
      title: "Debt-Free Living",
      icon: DollarSign,
      description: "Tips and strategies for maintaining a debt-free lifestyle"
    },
    {
      title: "Smart Money Habits",
      icon: Lightbulb,
      description: "Daily habits that can transform your financial future"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Financial Resources
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Guides, tools, and educational content to help you achieve financial freedom
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
            />
          </div>
        </motion.div>

        {/* Featured Resources Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8">Featured Resources</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-[#88B04B]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                  <resource.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-300">{resource.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#88B04B]/20 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-[#88B04B]" />
                </div>
                <h2 className="text-xl font-bold">{category.title}</h2>
              </div>
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300 hover:text-[#88B04B] cursor-pointer transition-colors">
                    <BookMarked className="w-4 h-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Financial Calculators Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6">Financial Calculators</h2>
          <div className="bg-white/5 rounded-xl border border-white/10 p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-lg hover:bg-[#88B04B]/10 transition-colors cursor-pointer">
                <Calculator className="w-8 h-8 text-[#88B04B] mb-2" />
                <p className="font-medium">Debt Payoff Calculator</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-lg hover:bg-[#88B04B]/10 transition-colors cursor-pointer">
                <Calculator className="w-8 h-8 text-[#88B04B] mb-2" />
                <p className="font-medium">Interest Rate Calculator</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-lg hover:bg-[#88B04B]/10 transition-colors cursor-pointer">
                <Calculator className="w-8 h-8 text-[#88B04B] mb-2" />
                <p className="font-medium">Budget Calculator</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-lg hover:bg-[#88B04B]/10 transition-colors cursor-pointer">
                <Calculator className="w-8 h-8 text-[#88B04B] mb-2" />
                <p className="font-medium">Savings Goal Calculator</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-gray-300 mb-6">
              Start your journey to financial freedom with our personalized debt management tools
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
                asChild
              >
                <Link to="/debt-planner">Try Debt Planner</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                asChild
              >
                <Link to="/help">Visit Help Center</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 