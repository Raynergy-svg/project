import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Wallet, TrendingUp, PiggyBank, CreditCard, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinancialToolsProps {
  className?: string;
}

export default function FinancialTools({ className }: FinancialToolsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const categories = [
    {
      id: 'debt-strategies',
      title: 'Debt Reduction Strategies',
      icon: BookOpen,
      items: [
        { name: 'Snowball Method', description: 'Pay off debts from smallest to largest balance, gaining momentum as each debt is paid' },
        { name: 'Avalanche Method', description: 'Pay off debts with highest interest rates first to minimize interest payments over time' },
        { name: 'Debt Consolidation', description: 'Combine multiple debts into a single loan with a lower interest rate' },
        { name: 'Debt Settlement', description: "Negotiate with creditors to pay a lump sum that's less than what you owe" }
      ]
    },
    {
      id: 'budgeting-tools',
      title: 'Budgeting Tools',
      icon: PiggyBank,
      items: [
        { name: 'Creating a Monthly Budget', description: 'Plan your income and expenses for each month based on financial goals' },
        { name: '50/30/20 Rule', description: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment' },
        { name: 'Zero-Based Budgeting', description: 'Allocate every dollar of income to specific expenses, savings, or debt payments' },
        { name: 'Envelope System', description: 'Use physical or digital envelopes to separate money for different spending categories' }
      ]
    },
    {
      id: 'saving-techniques',
      title: 'Saving Techniques',
      icon: Wallet,
      items: [
        { name: 'Emergency Fund Basics', description: 'Build a fund covering 3-6 months of essential expenses for financial security' },
        { name: 'Automated Savings', description: 'Set up automatic transfers to savings accounts on paydays' },
        { name: 'Saving for Big Purchases', description: 'Create dedicated funds for specific goals like a down payment or vacation' },
        { name: 'Retirement Planning', description: 'Maximize contributions to retirement accounts and understand investment options' }
      ]
    }
  ];

  const calculators = [
    {
      id: 'debt-payoff',
      title: 'Debt Payoff Calculator',
      icon: CreditCard,
      description: 'Calculate how long it will take to pay off your debts using different strategies'
    },
    {
      id: 'interest-rate',
      title: 'Interest Rate Calculator',
      icon: TrendingUp,
      description: 'Compare interest rates and see the impact on your total payment amount'
    },
    {
      id: 'budget',
      title: 'Budget Calculator',
      icon: Calculator,
      description: 'Create a balanced budget based on your income and necessary expenses'
    },
    {
      id: 'savings-goal',
      title: 'Savings Goal Calculator',
      icon: PiggyBank,
      description: 'Plan how to reach your savings goals with regular contributions'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#2A2A2A] rounded-xl border border-white/10 p-6 ${className}`}
    >
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <Calculator className="mr-2 h-5 w-5 text-[#88B04B]" />
        Financial Tools & Resources
      </h2>

      <Tabs defaultValue="strategies" className="w-full">
        <TabsList className="mb-6 bg-black/20 p-1 rounded-lg">
          <TabsTrigger value="strategies" className="data-[state=active]:bg-[#88B04B] data-[state=active]:text-white">
            Strategies
          </TabsTrigger>
          <TabsTrigger value="calculators" className="data-[state=active]:bg-[#88B04B] data-[state=active]:text-white">
            Calculators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="mt-0">
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center">
                    <category.icon className="w-5 h-5 mr-3 text-[#88B04B]" />
                    <span className="font-medium text-white">{category.title}</span>
                  </div>
                  {activeCategory === category.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {activeCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 pt-2"
                  >
                    <ul className="space-y-3">
                      {category.items.map((item, index) => (
                        <li key={index} className="pl-8 relative">
                          <div className="absolute left-0 top-1 w-5 h-5 bg-[#88B04B]/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#88B04B] rounded-full"></div>
                          </div>
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-4 ml-8 text-[#88B04B] border-[#88B04B]/30 hover:bg-[#88B04B]/10"
                      variant="outline"
                      size="sm"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculators" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {calculators.map((calculator) => (
              <div
                key={calculator.id}
                className="bg-white/5 rounded-lg p-5 border border-white/10 hover:border-[#88B04B]/30 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mr-3">
                    <calculator.icon className="w-5 h-5 text-[#88B04B]" />
                  </div>
                  <h3 className="font-semibold text-white">{calculator.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">{calculator.description}</p>
                <Button
                  className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90"
                >
                  Open Calculator
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 