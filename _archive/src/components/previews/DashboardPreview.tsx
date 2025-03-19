import { motion } from "framer-motion";
import { ArrowRight, TrendingDown, Wallet, PieChart, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardPreviewProps {
  onClose: () => void;
  onContinue: () => void;
}

export function DashboardPreview({ onClose, onContinue }: DashboardPreviewProps) {
  return (
    <div className="w-full max-w-5xl p-8 rounded-2xl bg-[#121212] shadow-2xl">
      <div className="relative">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Your Financial Command Center
            </h2>
            <p className="text-gray-300 text-lg">
              Real-time insights and powerful debt management tools
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-[#88B04B]/20 to-[#1E1E1E] p-6"
          >
            {/* Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Debt</span>
                  <TrendingDown className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">$24,500</div>
                <div className="text-sm text-green-500">-12% this month</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Savings</span>
                  <Wallet className="w-4 h-4 text-[#88B04B]" />
                </div>
                <div className="text-2xl font-bold text-white">$8,750</div>
                <div className="text-sm text-[#88B04B]">+8% this month</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Credit Score</span>
                  <ArrowUpRight className="w-4 h-4 text-[#88B04B]" />
                </div>
                <div className="text-2xl font-bold text-white">725</div>
                <div className="text-sm text-[#88B04B]">+15 points</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Debt Free In</span>
                  <PieChart className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">24 mo</div>
                <div className="text-sm text-blue-400">On track</div>
              </motion.div>
            </div>

            {/* Animated Chart Background */}
            <div className="absolute inset-0 z-0">
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#88B04B]/20 to-transparent"
              />
              {/* Animated Chart Lines */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    bottom: `${20 + i * 10}%`,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, rgba(136, 176, 75, ${0.1 + i * 0.05}), transparent)`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={onClose}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Back to Home
            </Button>
            <Button
              onClick={onContinue}
              className="bg-[#88B04B] hover:bg-[#7a9d43] text-white"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 