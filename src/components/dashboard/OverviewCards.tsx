import { DollarSign, TrendingDown, ChevronRight, Shield, BarChart4, PieChart, ArrowRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { memo, useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface OverviewCardsProps {
  totalDebt: number;
  totalMonthlyPayment: number;
  monthlyChange: number;
  onAddConnection?: () => void;
  onViewDetails?: () => void;
}

// Generate trend data for the mini chart
const generateTrendData = (startingDebt: number, monthlyPayment: number, monthlyChange: number) => {
  const data = [];
  let currentDebt = startingDebt;
  
  // Generate 6 months of data
  for (let i = 0; i < 6; i++) {
    data.push({
      month: i,
      debt: currentDebt,
    });
    currentDebt = Math.max(0, currentDebt - (monthlyPayment + Math.abs(monthlyChange)));
  }
  
  return data;
};

export const OverviewCards = memo(function OverviewCards({ 
  totalDebt, 
  totalMonthlyPayment, 
  monthlyChange,
  onAddConnection,
  onViewDetails
}: OverviewCardsProps) {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [creditScoreData, setCreditScoreData] = useState<any[]>([]);
  const [creditScore, setCreditScore] = useState<number>(0);
  
  // Generate chart data when props change
  useEffect(() => {
    setTrendData(generateTrendData(totalDebt, totalMonthlyPayment, monthlyChange));
    
    // Generate mock credit score data
    const mockCreditScore = 728;
    setCreditScore(mockCreditScore);
    
    // Generate 12 months of credit score data
    const mockData = Array.from({ length: 12 }, (_, i) => {
      // Create a slightly increasing trend with some randomness
      const baseScore = mockCreditScore - 80 + (i * 7);
      const randomVariation = Math.floor(Math.random() * 10) - 5;
      return {
        month: i,
        score: Math.min(850, Math.max(300, baseScore + randomVariation))
      };
    });
    
    setCreditScoreData(mockData);
  }, [totalDebt, totalMonthlyPayment, monthlyChange]);
  
  return (
    <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Debt Overview Card */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm shadow-sm">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
                <DollarSign className="w-4 h-4 text-[#88B04B]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Debt Overview</h2>
            </div>
            
            {monthlyChange < 0 && (
              <Badge className="bg-[#88B04B]/20 text-[#88B04B]">
                <TrendingDown className="w-3.5 h-3.5 mr-1.5" /> 
                Decreasing (${Math.abs(monthlyChange).toLocaleString()}/mo)
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Total Debt</p>
              <p className="text-2xl font-bold text-white">${totalDebt.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-white/60 mb-1">Monthly Payment</p>
              <p className="text-2xl font-bold text-white">${totalMonthlyPayment.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/80">Debt Projection</h3>
            <Badge className="bg-white/10 text-white/70">6 Month Forecast</Badge>
          </div>
          
          {/* Mini line chart for debt projection */}
          <div className="h-36 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => `M${value}`}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Debt']}
                  labelFormatter={(value) => `Month ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="debt" 
                  stroke="#88B04B" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#88B04B" }}
                  activeDot={{ r: 6, fill: "#88B04B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1 bg-white/5 text-white hover:bg-white/10 border-white/20 mt-3"
            onClick={onViewDetails}
          >
            View Detailed Projection <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Credit Score Card */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm shadow-sm">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
                <BarChart4 className="w-4 h-4 text-[#88B04B]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Credit Score</h2>
            </div>
            <Badge className="bg-[#88B04B]/20 text-[#88B04B]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> +15 pts
            </Badge>
          </div>
          
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={creditScoreData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => `M${value}`}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  domain={[600, 850]}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value) => [value, 'Score']}
                  labelFormatter={(value) => `Month ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#88B04B" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#88B04B" }}
                  activeDot={{ r: 6, fill: "#88B04B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-between w-full">
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
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-28 h-28 rounded-full bg-white/5 border-4 border-[#88B04B] flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{creditScore}</p>
                <p className="text-xs text-white/60">Good</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/60">Payment History</p>
              <p className="text-sm font-semibold text-white">Excellent</p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/60">Credit Utilization</p>
              <p className="text-sm font-semibold text-white">28%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Add default export for lazy loading
export default OverviewCards; 