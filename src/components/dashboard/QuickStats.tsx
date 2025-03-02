import { TrendingUp, TrendingDown, Shield, AlertCircle, BarChart4 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface QuickStatsProps {
  debtToIncome: number;
  monthlyChange: number;
  aiScore: number;
}

export function QuickStats({ debtToIncome, monthlyChange, aiScore }: QuickStatsProps) {
  // Helper function to determine financial health status
  const getHealthStatus = () => {
    if (debtToIncome <= 30) return { label: 'Excellent', color: 'text-[#88B04B]', bg: 'bg-[#88B04B]/10' };
    if (debtToIncome <= 40) return { label: 'Good', color: 'text-[#88B04B]/80', bg: 'bg-[#88B04B]/10' };
    if (debtToIncome <= 50) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    return { label: 'Needs Attention', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const health = getHealthStatus();

  return (
    <div className="rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
            <BarChart4 className="w-4 h-4 text-[#88B04B]" />
          </div>
          <h2 className="text-lg font-medium text-white">Financial Health</h2>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Debt to Income */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-white font-medium">Debt to Income Ratio</h3>
                <p className="text-xs text-white/60">Percentage of income used for debt</p>
              </div>
              <Badge className={`${health.bg} ${health.color} py-1 px-2`}>
                {health.label}
              </Badge>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-2xl font-bold text-white">{debtToIncome}%</span>
                <span className="text-xs text-white/60">Target: <span className="text-[#88B04B]">36%</span></span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    debtToIncome <= 30 ? 'bg-[#88B04B]' : 
                    debtToIncome <= 40 ? 'bg-[#88B04B]/80' : 
                    debtToIncome <= 50 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(debtToIncome, 100)}%` }}
                />
                {/* Target marker */}
                <div className="relative">
                  <div className="absolute top-[-8px] left-[36%] w-0.5 h-2 bg-white/60" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                {monthlyChange < 0 ? (
                  <TrendingDown className="w-4 h-4 text-[#88B04B]" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">Monthly Change</p>
                  <p className="text-xs text-white/60">
                    {monthlyChange < 0 
                      ? "Your debt decreased this month" 
                      : "Your debt increased this month"}
                  </p>
                </div>
                <Badge 
                  className={`${
                    monthlyChange < 0 
                      ? 'bg-[#88B04B]/10 text-[#88B04B]' 
                      : 'bg-red-400/10 text-red-400'
                  }`}
                >
                  ${Math.abs(monthlyChange).toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Alerts */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-white font-medium">AI Financial Score</h3>
                <p className="text-xs text-white/60">Overall financial health assessment</p>
              </div>
              <div className="flex items-center px-2 py-1 rounded-full bg-white/5">
                <Shield className="w-3.5 h-3.5 text-[#88B04B] mr-1.5" />
                <span className="text-white font-medium">{aiScore}/100</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <h4 className="text-sm text-white font-medium mb-3">Financial Alerts</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white">Credit Card Interest Rate</p>
                    <p className="text-xs text-white/60">Your APR increased to 24.99%</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-red-400/5 p-2 rounded-lg border border-red-400/20">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white">Payment Due Soon</p>
                    <p className="text-xs text-white/60">Auto loan payment due in 3 days</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white/5 text-white hover:bg-white/10 hover:text-white border-white/20"
                >
                  View All Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 