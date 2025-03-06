import { useState, useMemo } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from 'recharts';

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface DebtChartProps {
  selectedDebtType: string;
  selectedPlan: 'minimum' | 'recommended' | 'aggressive';
  setSelectedPlan: (plan: 'minimum' | 'recommended' | 'aggressive') => void;
  paymentScenarios: any;
  debtStatistics: any;
  calculateAmortization: (principal: number, annualRate: number, monthlyPayment: number, months: number) => any[];
}

export default function DebtChart({
  selectedDebtType,
  selectedPlan,
  setSelectedPlan,
  paymentScenarios,
  debtStatistics,
  calculateAmortization
}: DebtChartProps) {
  // Chart type state (area, bar, or composed)
  const [chartType, setChartType] = useState<'area' | 'bar' | 'composed'>('area');
  
  // Helper function to format time labels for the x-axis
  const formatTimeLabel = (month: number) => {
    const years = Math.floor(month / 12);
    const remainingMonths = month % 12;
    
    if (years === 0) {
      return `${month}m`;
    } else if (remainingMonths === 0) {
      return `${years}y`;
    } else {
      return `${years}y ${remainingMonths}m`;
    }
  };
  
  // Helper function for detailed time format (for tooltips)
  const formatDetailedTime = (month: number) => {
    const years = Math.floor(month / 12);
    const remainingMonths = month % 12;
    
    if (years === 0) {
      return `${month} month${month !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };
  
  // Generate chart data from payment scenarios
  const chartData = useMemo(() => {
    // Get data for all three payment strategies for comparison
    const strategies = ['minimum', 'recommended', 'aggressive'];
    const allStrategiesData: any[] = [];
    
    // Calculate the longest repayment period for consistent x-axis
    const longestPeriod = Math.max(
      ...strategies.map(strategy => 
        paymentScenarios[strategy as keyof typeof paymentScenarios].yearsToPayoff * 12
      )
    );
    
    // Determine an appropriate interval for the x-axis labels
    // For longer periods, show fewer points to avoid crowding
    const interval = longestPeriod <= 24 ? 3 : 
                     longestPeriod <= 60 ? 6 : 
                     longestPeriod <= 120 ? 12 : 24;
    
    // Create the data points for the chart with proper intervals
    for (let month = 0; month <= longestPeriod; month += interval) {
      const dataPoint: any = {
        month,
        // Format time labels more clearly
        timeLabel: formatTimeLabel(month),
        formattedTime: formatDetailedTime(month),
      };
      
      // Add data for each strategy
      strategies.forEach(strategy => {
        const scenarioData = paymentScenarios[strategy as keyof typeof paymentScenarios];
        const { avg, rate } = debtStatistics[selectedDebtType as keyof typeof debtStatistics];
        
        // Only calculate if this month is within the strategy's repayment period
        if (month <= scenarioData.yearsToPayoff * 12) {
          const schedule = calculateAmortization(
            avg,
            rate,
            scenarioData.monthlyPayment,
            month
          );
          
          // Get the latest point from the schedule (representing this month)
          const point = schedule[schedule.length - 1] || { balance: avg, interest: 0, principal: 0 };
          
          // Add data for the chart
          dataPoint[`${strategy}Balance`] = point.balance;
          dataPoint[`${strategy}Payment`] = scenarioData.monthlyPayment;
          dataPoint[`${strategy}Interest`] = point.interest;
          dataPoint[`${strategy}Principal`] = point.principal;
          dataPoint[`${strategy}Percentage`] = ((1 - point.balance / avg) * 100).toFixed(1);
          dataPoint[`${strategy}TotalPaid`] = scenarioData.monthlyPayment * month;
        } else {
          // Strategy has already paid off the debt by this month
          dataPoint[`${strategy}Balance`] = 0;
          dataPoint[`${strategy}Payment`] = 0;
          dataPoint[`${strategy}Interest`] = 0;
          dataPoint[`${strategy}Principal`] = 0;
          dataPoint[`${strategy}Percentage`] = "100.0";
          dataPoint[`${strategy}TotalPaid`] = scenarioData.totalPaid;
        }
      });
      
      allStrategiesData.push(dataPoint);
    }
    
    return allStrategiesData;
  }, [selectedDebtType, paymentScenarios, debtStatistics, calculateAmortization]);
  
  // Create a custom tooltip component with improved information display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl text-sm max-w-xs">
          <div className="font-semibold mb-2 text-white border-b border-white/20 pb-2">
            {data.formattedTime}
          </div>
          <div className="space-y-3">
            {['minimum', 'recommended', 'aggressive'].map(strategy => {
              if (data[`${strategy}Balance`] === undefined) return null;
              
              const strategyLabel = {
                'minimum': 'Minimum',
                'recommended': 'Recommended',
                'aggressive': 'Aggressive'
              }[strategy];
              
              const strategyColor = {
                'minimum': '#FF6B6B',
                'recommended': '#88B04B',
                'aggressive': '#4ECDC4'
              }[strategy];
              
              return (
                <div key={strategy} className="space-y-1">
                  <div className="font-medium text-white flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: strategyColor}}></div>
                    {strategyLabel} Plan
                  </div>
                  <div className="text-white/80 pl-5 text-xs flex justify-between">
                    <span>Balance:</span>
                    <span>{formatCurrency(data[`${strategy}Balance`])}</span>
                  </div>
                  <div className="text-white/80 pl-5 text-xs flex justify-between">
                    <span>Paid off:</span>
                    <span>{data[`${strategy}Percentage`]}%</span>
                  </div>
                  <div className="text-white/80 pl-5 text-xs flex justify-between">
                    <span>Total paid so far:</span>
                    <span>{formatCurrency(data[`${strategy}TotalPaid`])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-[#88B04B]" />
          Payment Progress Comparison
        </h3>
        
        <div className="flex items-center gap-3 mt-3 md:mt-0 text-sm">
          <div className="flex items-center gap-2 mr-4">
            <Button
              onClick={() => setChartType('area')}
              size="sm"
              variant={chartType === 'area' ? 'default' : 'outline'}
              className={`${chartType === 'area' ? 'bg-[#88B04B] text-white' : 'text-white/80'}`}
            >
              Area
            </Button>
            <Button
              onClick={() => setChartType('bar')}
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              className={`${chartType === 'bar' ? 'bg-[#88B04B] text-white' : 'text-white/80'}`}
            >
              Bar
            </Button>
            <Button
              onClick={() => setChartType('composed')}
              size="sm"
              variant={chartType === 'composed' ? 'default' : 'outline'}
              className={`${chartType === 'composed' ? 'bg-[#88B04B] text-white' : 'text-white/80'}`}
            >
              Combined
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' && (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <defs>
                <linearGradient id="minimumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="recommendedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#88B04B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#88B04B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="aggressiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              
              <XAxis
                dataKey="timeLabel"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                label={{ 
                  value: 'Time', 
                  position: 'insideBottom',
                  fill: 'rgba(255,255,255,0.8)',
                  offset: 0,
                  dy: 15
                }}
                tickFormatter={(value) => value}
              />
              
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickFormatter={(value) => `$${value > 999 ? (value / 1000).toFixed(0) + 'k' : value}`}
                label={{ 
                  value: 'Remaining Balance', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'rgba(255,255,255,0.8)',
                  offset: -10,
                  dx: -10
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => <span className="text-white/90">{value}</span>}
              />
              
              <Area
                name="Minimum Plan"
                type="monotone"
                dataKey="minimumBalance"
                stroke="#FF6B6B"
                strokeWidth={selectedPlan === 'minimum' ? 3 : 2}
                fillOpacity={selectedPlan === 'minimum' ? 0.8 : 0.4}
                fill="url(#minimumGradient)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              
              <Area
                name="Recommended Plan"
                type="monotone"
                dataKey="recommendedBalance"
                stroke="#88B04B"
                strokeWidth={selectedPlan === 'recommended' ? 3 : 2}
                fillOpacity={selectedPlan === 'recommended' ? 0.8 : 0.4}
                fill="url(#recommendedGradient)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              
              <Area
                name="Aggressive Plan"
                type="monotone"
                dataKey="aggressiveBalance"
                stroke="#4ECDC4"
                strokeWidth={selectedPlan === 'aggressive' ? 3 : 2}
                fillOpacity={selectedPlan === 'aggressive' ? 0.8 : 0.4}
                fill="url(#aggressiveGradient)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          )}
          
          {chartType === 'bar' && (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              barGap={2}
              barSize={12}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              
              <XAxis
                dataKey="timeLabel"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                label={{ 
                  value: 'Time', 
                  position: 'insideBottom',
                  fill: 'rgba(255,255,255,0.8)',
                  offset: 0,
                  dy: 15
                }}
              />
              
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickFormatter={(value) => `$${value > 999 ? (value / 1000).toFixed(0) + 'k' : value}`}
                label={{ 
                  value: 'Remaining Balance', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'rgba(255,255,255,0.8)',
                  offset: -10,
                  dx: -10
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => <span className="text-white/90">{value}</span>}
              />
              
              <Bar
                name="Minimum Plan"
                dataKey="minimumBalance"
                fill="#FF6B6B"
                opacity={selectedPlan === 'minimum' ? 1 : 0.6}
                radius={[4, 4, 0, 0]}
              />
              
              <Bar
                name="Recommended Plan"
                dataKey="recommendedBalance"
                fill="#88B04B"
                opacity={selectedPlan === 'recommended' ? 1 : 0.6}
                radius={[4, 4, 0, 0]}
              />
              
              <Bar
                name="Aggressive Plan"
                dataKey="aggressiveBalance"
                fill="#4ECDC4"
                opacity={selectedPlan === 'aggressive' ? 1 : 0.6}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
          
          {chartType === 'composed' && (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              
              <XAxis
                dataKey="timeLabel"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                label={{ 
                  value: 'Time', 
                  position: 'insideBottom',
                  fill: 'rgba(255,255,255,0.8)',
                  offset: 0,
                  dy: 15
                }}
              />
              
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickFormatter={(value) => `$${value > 999 ? (value / 1000).toFixed(0) + 'k' : value}`}
                label={{ 
                  value: 'Remaining Balance', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'rgba(255,255,255,0.8)',
                  offset: -10,
                  dx: -10
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => <span className="text-white/90">{value}</span>}
              />
              
              <Area
                name="Minimum Plan"
                type="monotone"
                dataKey="minimumBalance"
                fill="url(#minimumGradient)"
                fillOpacity={0.4}
                stroke="none"
              />
              
              <Bar
                name="Recommended Plan"
                dataKey="recommendedBalance"
                fill="#88B04B"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
                barSize={8}
              />
              
              <Line
                name="Aggressive Plan"
                type="monotone"
                dataKey="aggressiveBalance"
                stroke="#4ECDC4"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#4ECDC4', fill: '#4ECDC4' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 bg-black/30 rounded-xl p-4 border border-white/10">
        <div className="grid grid-cols-3 gap-4">
          {['minimum', 'recommended', 'aggressive'].map(strategy => {
            const strategyData = paymentScenarios[strategy as keyof typeof paymentScenarios];
            const isSelected = selectedPlan === strategy;
            
            return (
              <div 
                key={strategy}
                onClick={() => setSelectedPlan(strategy as any)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-white/10 ring-2 ring-offset-2 ring-offset-black/50 ring-white/20' : 'bg-black/20 hover:bg-white/5'}`}
              >
                <div className="text-xs font-medium mb-2 text-white/70">
                  With {strategyData.label}:
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/60">Total paid:</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(strategyData.totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Time to freedom:</span>
                  <span className="text-sm font-semibold text-white">{strategyData.yearsToPayoff} years</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
