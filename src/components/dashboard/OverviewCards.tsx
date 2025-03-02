import { DollarSign, TrendingDown, ChevronRight, Shield, BarChart4, PieChart, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardState } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';

export interface OverviewCardsProps {
  data: DashboardState;
  onAIToggle?: () => void;
  onViewPayoffPlan?: () => void;
}

export function OverviewCards({ data, onViewPayoffPlan }: OverviewCardsProps) {
  return (
    <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Debt Overview */}
      <div className="rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
                <DollarSign className="w-4 h-4 text-[#88B04B]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Debt Overview</h2>
            </div>
            
            {data.monthlyChange < 0 && (
              <Badge className="bg-[#88B04B]/20 text-[#88B04B]">
                <TrendingDown className="w-3.5 h-3.5 mr-1.5" /> 
                Decreasing (${Math.abs(data.monthlyChange).toLocaleString()}/mo)
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Total Debt</p>
              <p className="text-2xl font-bold text-white">${data.totalDebt.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-white/60 mb-1">Monthly Payment</p>
              <p className="text-2xl font-bold text-white">${data.monthlyPayment.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="text-sm font-medium text-white/80 mb-3">Connected Accounts</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-xs font-bold">BOA</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Bank of America</p>
                  <p className="text-xs text-white/60">Checking •••• 4832</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-500">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold">WF</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Wells Fargo</p>
                  <p className="text-xs text-white/60">Credit Card •••• 7621</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-white/60">Updated 2h ago</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 text-xs font-bold">CAP</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Capital One</p>
                  <p className="text-xs text-white/60">Mortgage •••• 9305</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-white/60">Updated 3h ago</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1 bg-white/5 text-white hover:bg-white/10 border-white/20"
          >
            Connect More Accounts <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Credit Score */}
      <div className="rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
                <BarChart4 className="w-4 h-4 text-[#88B04B]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Credit Score</h2>
            </div>
            <Badge className="bg-[#88B04B]/20 text-[#88B04B]">
              +15 pts
            </Badge>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/60">Poor</span>
              <div className="w-12 h-2 rounded-l-full bg-red-500/80 mt-1"></div>
              <span className="text-xs text-white/60 mt-1">300</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/60">Fair</span>
              <div className="w-12 h-2 bg-amber-500/80 mt-1"></div>
              <span className="text-xs text-white/60 mt-1">580</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/60">Good</span>
              <div className="w-12 h-2 bg-green-500/80 mt-1"></div>
              <span className="text-xs text-white/60 mt-1">670</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/60">Very Good</span>
              <div className="w-12 h-2 bg-blue-500/80 mt-1"></div>
              <span className="text-xs text-white/60 mt-1">740</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/60">Excellent</span>
              <div className="w-12 h-2 rounded-r-full bg-purple-500/80 mt-1"></div>
              <span className="text-xs text-white/60 mt-1">850</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-36 h-36 rounded-full bg-white/5 border-4 border-[#88B04B] flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">728</p>
                <p className="text-xs text-white/60">Good</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/60">Payment History</p>
                <p className="text-base font-semibold text-white">Excellent</p>
              </div>
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/60">Credit Utilization</p>
                <p className="text-base font-semibold text-white">28%</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-white/60">Last updated from TransUnion: Today</p>
              <Button variant="link" className="text-xs h-auto p-0 text-[#88B04B] mt-1">
                View Full Report <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 