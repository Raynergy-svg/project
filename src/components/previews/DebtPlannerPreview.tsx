import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  TrendingDown, 
  Wallet, 
  ArrowRight, 
  DollarSign, 
  Target, 
  Lock,
  X,
  Building2,
  ChevronRight,
  Calendar,
  PieChart,
  BarChart2,
  Bell,
  Shield,
  LineChart,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/animations/ProgressBar";
import { CircularProgress } from "@/components/animations/CircularProgress";

interface DebtPlannerPreviewProps {
  onClose: () => void;
  onContinue: () => void;
}

export default function DebtPlannerPreview({ onClose, onContinue }: DebtPlannerPreviewProps) {
  const [step, setStep] = useState<'connect' | 'analysis' | 'plan'>('connect');

    return (
    <div className="w-full max-w-5xl mx-auto bg-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Smart Debt Analysis Preview
          </h2>
          <p className="text-gray-400 mt-2">
            See how connecting your accounts enables personalized AI-powered debt elimination
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 relative">
          {[
            { id: 'connect', icon: Building2, label: 'Connect Banks' },
            { id: 'analysis', icon: Brain, label: 'AI Analysis' },
            { id: 'plan', icon: Target, label: 'Custom Plan' }
          ].map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center ${s.id === step ? 'text-[#88B04B]' : 'text-gray-500'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  s.id === step ? 'bg-[#88B04B]/20' : 'bg-gray-800'
                }`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="text-sm">{s.label}</span>
              </div>
              {index < 2 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-800">
                  <div 
                    className="h-full bg-[#88B04B] transition-all duration-300"
                    style={{ 
                      width: step === 'connect' ? '0%' : 
                             step === 'analysis' && index === 0 ? '100%' :
                             step === 'plan' ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[400px]"
          >
            {step === 'connect' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-6 h-6 text-[#88B04B]" />
                      <h3 className="text-lg font-semibold text-white">Connect Your Accounts</h3>
                    </div>
                    <p className="text-gray-400 mb-6">
                      Securely connect your bank accounts for real-time tracking and personalized insights
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                        <img src="/bank-logos/chase.svg" alt="Chase" className="w-8 h-8" />
                        <div className="flex-1">
                          <p className="text-white font-medium">Chase Bank</p>
                          <p className="text-sm text-gray-400">Credit Cards & Loans</p>
                        </div>
                        <Button size="sm" className="bg-[#88B04B]">Connect</Button>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                        <img src="/bank-logos/bofa.svg" alt="Bank of America" className="w-8 h-8" />
                        <div className="flex-1">
                          <p className="text-white font-medium">Bank of America</p>
                          <p className="text-sm text-gray-400">Credit Cards & Accounts</p>
                        </div>
                        <Button size="sm" className="bg-[#88B04B]">Connect</Button>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                        <img src="/bank-logos/wells.svg" alt="Wells Fargo" className="w-8 h-8" />
                        <div className="flex-1">
                          <p className="text-white font-medium">Wells Fargo</p>
                          <p className="text-sm text-gray-400">All Accounts</p>
                        </div>
                        <Button size="sm" className="bg-[#88B04B]">Connect</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-[#88B04B]" />
                        <h3 className="text-lg font-semibold text-white">Bank-Level Security</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-400">
                          <Lock className="w-5 h-5" />
                          <span>256-bit encryption for all data</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <Shield className="w-5 h-5" />
                          <span>SOC2 Type II certified</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <Lock className="w-5 h-5" />
                          <span>Read-only access to your accounts</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#88B04B]/10 p-6 rounded-lg border border-[#88B04B]/30">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-6 h-6 text-[#88B04B]" />
                        <h3 className="text-lg font-semibold text-white">Why Connect?</h3>
                      </div>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-[#88B04B]" />
                          Real-time balance & payment tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-[#88B04B]" />
                          Personalized AI recommendations
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-[#88B04B]" />
                          Automated spending analysis
                        </li>
                      </ul>
                    </div>
              </div>
            </div>
              </div>
            )}

            {step === 'analysis' && (
              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-[#88B04B]" />
                    <h3 className="text-lg font-semibold text-white">AI Analysis in Progress</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Analyzing Accounts</span>
                        <span className="text-[#88B04B]">3/3 Complete</span>
                      </div>
                      <ProgressBar progress={100} label="" color="#88B04B" />
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Processing Transactions</span>
                        <span className="text-[#88B04B]">75%</span>
                      </div>
                      <ProgressBar progress={75} label="" color="#88B04B" />
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Generating Insights</span>
                        <span className="text-[#88B04B]">50%</span>
                      </div>
                      <ProgressBar progress={50} label="" color="#88B04B" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <LineChart className="w-6 h-6 text-[#88B04B] mb-2" />
                    <h4 className="text-white font-medium">Transaction Analysis</h4>
                    <p className="text-sm text-gray-400">Analyzing spending patterns across accounts</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <Brain className="w-6 h-6 text-[#88B04B] mb-2" />
                    <h4 className="text-white font-medium">AI Processing</h4>
                    <p className="text-sm text-gray-400">Identifying optimization opportunities</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <Target className="w-6 h-6 text-[#88B04B] mb-2" />
                    <h4 className="text-white font-medium">Strategy Creation</h4>
                    <p className="text-sm text-gray-400">Building your personalized plan</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'plan' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-6 h-6 text-[#88B04B]" />
                      <h3 className="text-lg font-semibold text-white">Your Custom Plan</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Recommended Strategy</h4>
                        <div className="flex items-center gap-2 text-[#88B04B]">
                          <TrendingDown className="w-5 h-5" />
                          <span>Modified Debt Snowball</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          Optimized for your spending patterns and income schedule
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Payment Schedule</h4>
                        <div className="flex items-center gap-2 text-[#88B04B]">
                          <Calendar className="w-5 h-5" />
                          <span>Bi-weekly Payments</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          Aligned with your paycheck deposits
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#88B04B]/10 p-6 rounded-lg border border-[#88B04B]/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-6 h-6 text-[#88B04B]" />
                      <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-300">
                        <ChevronRight className="w-4 h-4 text-[#88B04B] inline mr-2" />
                        Potential to save $320/mo by optimizing subscriptions
                      </p>
                      <p className="text-gray-300">
                        <ChevronRight className="w-4 h-4 text-[#88B04B] inline mr-2" />
                        Refinancing opportunity could save $2,400 in interest
                      </p>
                      <p className="text-gray-300">
                        <ChevronRight className="w-4 h-4 text-[#88B04B] inline mr-2" />
                        Extra payments from reduced dining out could save 8 months
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart2 className="w-6 h-6 text-[#88B04B]" />
                    <h3 className="text-lg font-semibold text-white">Projected Impact</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-block">
                        <CircularProgress 
                          progress={65}
                          size={160}
                          strokeWidth={12}
                          label="Faster Debt Freedom"
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        65% faster than your current pace
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Interest Savings</span>
                          <span className="text-[#88B04B] font-medium">$4,800</span>
                        </div>
                        <ProgressBar progress={80} label="" color="#88B04B" />
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Time Saved</span>
                          <span className="text-[#88B04B] font-medium">16 months</span>
                        </div>
                        <ProgressBar progress={65} label="" color="#88B04B" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Close Preview
          </Button>
          {step === 'plan' ? (
            <Button
              onClick={onContinue}
              className="bg-[#88B04B] hover:bg-[#7a9d43] text-white flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setStep(step === 'connect' ? 'analysis' : 'plan')}
              className="bg-[#88B04B] hover:bg-[#7a9d43] text-white flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}