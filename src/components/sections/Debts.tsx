import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, TrendingDown, DollarSign, Calendar, ArrowRight, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency, formatDate } from '@/lib/utils';

export function Debts() {
  const { dashboardState } = useDashboard();
  const [activeTab, setActiveTab] = useState<'all' | 'credit-cards' | 'loans' | 'other'>('all');
  const [showAddDebt, setShowAddDebt] = useState(false);
  
  // Filter debts based on active tab
  const filteredDebts = dashboardState.debtBreakdown.filter(debt => {
    if (activeTab === 'all') return true;
    if (activeTab === 'credit-cards') return debt.category.toLowerCase() === 'credit card';
    if (activeTab === 'loans') return ['personal loan', 'student loan', 'auto loan', 'mortgage'].includes(debt.category.toLowerCase());
    if (activeTab === 'other') return !['credit card', 'personal loan', 'student loan', 'auto loan', 'mortgage'].includes(debt.category.toLowerCase());
    return true;
  });
  
  // Calculate totals for the filtered debts
  const totalDebt = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalMonthlyPayment = filteredDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const avgInterestRate = filteredDebts.length > 0 
    ? filteredDebts.reduce((sum, debt) => sum + (debt.interestRate * debt.amount), 0) / totalDebt 
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Total Debt</h3>
            <DollarSign className="h-5 w-5 text-red-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(totalDebt)}</div>
            <div className="text-sm text-white/60 mt-1">
              Across {filteredDebts.length} accounts
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Monthly Payment</h3>
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(totalMonthlyPayment)}</div>
            <div className="text-sm text-white/60 mt-1">
              Minimum required payments
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Avg. Interest Rate</h3>
            <TrendingDown className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{avgInterestRate.toFixed(2)}%</div>
            <div className="text-sm text-white/60 mt-1">
              Weighted average APR
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Debt list section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-semibold text-white">Your Debts</h3>
          
          {/* Debt type filter */}
          <div className="flex space-x-2 bg-black/30 rounded-lg p-1">
            {(['all', 'credit-cards', 'loans', 'other'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All' : 
                 tab === 'credit-cards' ? 'Credit Cards' : 
                 tab === 'loans' ? 'Loans' : 'Other'}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowAddDebt(!showAddDebt)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Debt
          </Button>
        </div>
        
        {filteredDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-blue-500/20 mb-4">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No debts found</h4>
            <p className="text-white/60 max-w-md mb-6">
              {activeTab === 'all' 
                ? "You haven't added any debts yet. Add your debts to track your progress towards financial freedom."
                : `You don't have any ${activeTab === 'credit-cards' ? 'credit cards' : activeTab === 'loans' ? 'loans' : 'other debts'} in your account.`}
            </p>
            <Button 
              onClick={() => setShowAddDebt(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Debt
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDebts.map((debt) => (
              <motion.div 
                key={debt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${
                      debt.category.toLowerCase() === 'credit card' ? 'bg-red-500/20' : 
                      debt.category.toLowerCase().includes('loan') ? 'bg-blue-500/20' : 
                      'bg-purple-500/20'
                    }`}>
                      <CreditCard className={`h-5 w-5 ${
                        debt.category.toLowerCase() === 'credit card' ? 'text-red-400' : 
                        debt.category.toLowerCase().includes('loan') ? 'text-blue-400' : 
                        'text-purple-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{debt.name}</h4>
                      <p className="text-sm text-white/60">{debt.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    <div>
                      <p className="text-xs text-white/50">Balance</p>
                      <p className="font-medium text-white">{formatCurrency(debt.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Interest Rate</p>
                      <p className="font-medium text-white">{debt.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Min. Payment</p>
                      <p className="font-medium text-white">{formatCurrency(debt.minimumPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Payoff Date</p>
                      <p className="font-medium text-white">
                        {debt.payoffDate 
                          ? formatDate(debt.payoffDate, { month: 'short', year: 'numeric' })
                          : 'Not calculated'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="bg-white/5 hover:bg-white/10">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Debt Payoff Strategy */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Debt Payoff Strategy</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <ArrowRight className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Avalanche Method</h4>
              <p className="text-sm text-white/70 mt-1">
                Pay minimum payments on all debts, then put extra money toward the debt with the highest interest rate. This saves the most money over time.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <ArrowRight className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Snowball Method</h4>
              <p className="text-sm text-white/70 mt-1">
                Pay minimum payments on all debts, then put extra money toward the smallest debt. This builds momentum with quick wins.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <div className="bg-blue-500/30 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Recommended for You</h4>
              <p className="text-sm text-white/70 mt-1">
                Based on your debt profile, we recommend the <strong>Avalanche Method</strong>. You could save approximately {formatCurrency(totalDebt * 0.05)} in interest over the life of your debts.
              </p>
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                Apply This Strategy
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Add Debt Form (conditionally rendered) */}
      {showAddDebt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Add New Debt</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddDebt(false)}
              className="bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Debt Name</label>
              <input 
                type="text" 
                placeholder="e.g., Chase Credit Card" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Debt Type</label>
              <select className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none">
                <option value="">Select a type</option>
                <option value="credit-card">Credit Card</option>
                <option value="personal-loan">Personal Loan</option>
                <option value="student-loan">Student Loan</option>
                <option value="auto-loan">Auto Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Current Balance</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Interest Rate (%)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Minimum Payment</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Due Date</label>
              <input 
                type="date" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Add Debt
          </Button>
        </motion.div>
      )}
    </div>
  );
} 