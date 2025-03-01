import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Calendar, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';

export function DebtPayoffCalculator() {
  const { dashboardState } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [extraPayment, setExtraPayment] = useState(100);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [results, setResults] = useState<{
    monthsToPayoff: number;
    interestSaved: number;
    newPayoffDate: Date;
  } | null>(null);

  // Calculate the results when the user changes the extra payment amount
  const calculateResults = () => {
    setIsLoading(true);
    
    // Simulate API call or calculation
    setTimeout(() => {
      // In a real app, this would be a more complex calculation based on interest rates
      const totalDebt = dashboardState.totalDebt;
      const avgInterestRate = dashboardState.debtBreakdown.reduce(
        (sum, debt) => sum + debt.interestRate * debt.amount, 
        0
      ) / totalDebt;
      
      // Simple calculation for demo purposes
      const standardMonthlyPayment = dashboardState.monthlyPayment;
      const enhancedMonthlyPayment = standardMonthlyPayment + extraPayment;
      
      // Calculate months to payoff (simplified)
      const standardMonths = Math.ceil(totalDebt / standardMonthlyPayment);
      const enhancedMonths = Math.ceil(totalDebt / enhancedMonthlyPayment);
      const monthsSaved = standardMonths - enhancedMonths;
      
      // Calculate interest saved (simplified)
      const interestSaved = totalDebt * (avgInterestRate / 12) * monthsSaved;
      
      // Calculate new payoff date
      const newPayoffDate = new Date();
      newPayoffDate.setMonth(newPayoffDate.getMonth() + enhancedMonths);
      
      setResults({
        monthsToPayoff: enhancedMonths,
        interestSaved,
        newPayoffDate
      });
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/20">
          <Calculator className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Debt Payoff Calculator</h2>
      </div>
      
      <div className="space-y-6">
        {/* Debt Selection */}
        <div>
          <h3 className="text-white font-medium mb-3">Select a debt to focus on</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setSelectedDebtId(null)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedDebtId === null 
                  ? 'bg-blue-500/20 border border-blue-500/30' 
                  : 'bg-black/30 hover:bg-black/40 border border-white/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">All Debts</span>
                <span className="text-white/70">{formatCurrency(dashboardState.totalDebt)}</span>
              </div>
            </button>
            
            {dashboardState.debtBreakdown.map((debt) => (
              <button
                key={debt.id}
                onClick={() => setSelectedDebtId(debt.id)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  selectedDebtId === debt.id 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'bg-black/30 hover:bg-black/40 border border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{debt.name}</span>
                  <span className="text-white/70">{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-white/50">{debt.category}</span>
                  <span className="text-xs text-white/50">{debt.interestRate}% APR</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Extra Payment Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">Extra monthly payment</h3>
            <span className="text-blue-400 font-medium">${extraPayment}</span>
          </div>
          
          <Slider
            defaultValue={[extraPayment]}
            min={0}
            max={1000}
            step={25}
            onValueChange={(value) => setExtraPayment(value[0])}
            className="my-4"
          />
          
          <div className="flex justify-between text-xs text-white/50">
            <span>$0</span>
            <span>$1,000</span>
          </div>
          
          <p className="text-sm text-white/70 mt-3">
            Adding an extra ${extraPayment} to your monthly payment can significantly reduce your payoff time and save on interest.
          </p>
        </div>
        
        {/* Calculate Button */}
        <Button
          onClick={calculateResults}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate Payoff Plan'}
        </Button>
        
        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
          >
            <h3 className="text-white font-medium mb-3">Payoff Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-black/30">
                <div className="flex items-center mb-1">
                  <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-white/70 text-sm">Payoff Time</span>
                </div>
                <div className="text-xl font-bold text-white">{results.monthsToPayoff} months</div>
              </div>
              
              <div className="p-3 rounded-lg bg-black/30">
                <div className="flex items-center mb-1">
                  <DollarSign className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-white/70 text-sm">Interest Saved</span>
                </div>
                <div className="text-xl font-bold text-white">{formatCurrency(results.interestSaved)}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-black/30">
                <div className="flex items-center mb-1">
                  <TrendingDown className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-white/70 text-sm">Payoff Date</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {results.newPayoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-blue-500/20 flex items-start space-x-3">
              <ArrowRight className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Recommendation</p>
                <p className="text-sm text-white/70 mt-1">
                  By adding ${extraPayment} to your monthly payment, you'll be debt-free 
                  {Math.round(dashboardState.totalDebt / dashboardState.monthlyPayment) - results.monthsToPayoff} months 
                  earlier and save {formatCurrency(results.interestSaved)} in interest!
                </p>
              </div>
            </div>
            
            <Button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply This Payment Plan
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 