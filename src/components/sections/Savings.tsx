import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Plus, TrendingUp, DollarSign, Target, ArrowRight, Edit, Trash2, AlertCircle, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export function Savings() {
  const { dashboardState } = useDashboard();
  const [activeTab, setActiveTab] = useState<'all' | 'emergency' | 'goals' | 'investments'>('all');
  const [showAddGoal, setShowAddGoal] = useState(false);
  
  // Mock savings data (in a real app, this would come from dashboardState)
  const savingsData = {
    totalSavings: 12500,
    monthlySavingsRate: 750,
    emergencyFund: {
      current: 8000,
      target: 15000,
      monthsOfExpenses: 2.5
    },
    savingsGoals: [
      {
        id: '1',
        name: 'Vacation Fund',
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: new Date(2023, 11, 15),
        category: 'Travel',
        priority: 'medium'
      },
      {
        id: '2',
        name: 'New Car Down Payment',
        targetAmount: 5000,
        currentAmount: 2100,
        targetDate: new Date(2024, 5, 1),
        category: 'Transportation',
        priority: 'high'
      },
      {
        id: '3',
        name: 'Home Renovation',
        targetAmount: 10000,
        currentAmount: 1200,
        targetDate: new Date(2024, 8, 30),
        category: 'Home',
        priority: 'low'
      }
    ] as SavingsGoal[],
    investments: {
      total: 45000,
      monthly: 500,
      allocation: {
        stocks: 60,
        bonds: 30,
        cash: 10
      },
      accounts: [
        {
          name: '401(k)',
          balance: 30000,
          contribution: 300
        },
        {
          name: 'Roth IRA',
          balance: 12000,
          contribution: 150
        },
        {
          name: 'Brokerage Account',
          balance: 3000,
          contribution: 50
        }
      ]
    }
  };
  
  // Filter savings goals based on active tab
  const filteredGoals = savingsData.savingsGoals.filter(goal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'emergency') return false; // Emergency fund is handled separately
    if (activeTab === 'goals') return true;
    if (activeTab === 'investments') return false; // Investments are handled separately
    return true;
  });
  
  // Calculate progress percentage for emergency fund
  const emergencyFundProgress = Math.min(
    Math.round((savingsData.emergencyFund.current / savingsData.emergencyFund.target) * 100),
    100
  );
  
  // Calculate total progress for all savings goals
  const totalGoalsTarget = savingsData.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalsCurrent = savingsData.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalGoalsProgress = Math.min(
    Math.round((totalGoalsCurrent / totalGoalsTarget) * 100),
    100
  );
  
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
            <h3 className="text-lg font-medium text-white">Total Savings</h3>
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(savingsData.totalSavings)}</div>
            <div className="text-sm text-white/60 mt-1">
              Across all savings accounts
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
            <h3 className="text-lg font-medium text-white">Monthly Savings</h3>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(savingsData.monthlySavingsRate)}</div>
            <div className="text-sm text-white/60 mt-1">
              Current monthly savings rate
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
            <h3 className="text-lg font-medium text-white">Total Investments</h3>
            <BarChart className="h-5 w-5 text-green-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(savingsData.investments.total)}</div>
            <div className="text-sm text-white/60 mt-1">
              Across all investment accounts
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Emergency Fund */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Emergency Fund</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Current Balance</span>
              <span className="text-white">{formatCurrency(savingsData.emergencyFund.current)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Target (6 months expenses)</span>
              <span className="text-white">{formatCurrency(savingsData.emergencyFund.target)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-medium">Current Coverage</span>
              <span className="text-white">{savingsData.emergencyFund.monthsOfExpenses.toFixed(1)} months</span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-white/70">Progress</span>
                <span className="text-sm text-white/70">{emergencyFundProgress}%</span>
              </div>
              <Progress value={emergencyFundProgress} className="h-2" indicatorClassName="bg-green-500" />
            </div>
            
            <p className="text-sm text-white/70 mt-4">
              Financial experts recommend having 3-6 months of expenses saved in an emergency fund. You're currently at {savingsData.emergencyFund.monthsOfExpenses.toFixed(1)} months.
            </p>
            
            <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add to Emergency Fund
            </Button>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Emergency Fund Tips</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-white/70">Keep your emergency fund in a high-yield savings account for easy access.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-white/70">Only use this fund for true emergencies like medical bills or job loss.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-white/70">Aim to save at least 3-6 months of essential expenses.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-white/70">Replenish your emergency fund as soon as possible after using it.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      
      {/* Savings Goals */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-semibold text-white">Savings Goals</h3>
          
          <Button 
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-white/70">Overall Progress</span>
            <span className="text-sm text-white/70">{totalGoalsProgress}%</span>
          </div>
          <Progress value={totalGoalsProgress} className="h-2" indicatorClassName="bg-green-500" />
          <p className="text-sm text-white/70 mt-2">
            {formatCurrency(totalGoalsCurrent)} saved of {formatCurrency(totalGoalsTarget)} total goal amount
          </p>
        </div>
        
        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-green-500/20 mb-4">
              <Target className="h-6 w-6 text-green-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No savings goals found</h4>
            <p className="text-white/60 max-w-md mb-6">
              You haven't added any savings goals yet. Create goals to track your progress and stay motivated.
            </p>
            <Button 
              onClick={() => setShowAddGoal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal) => {
              const progress = Math.min(
                Math.round((goal.currentAmount / goal.targetAmount) * 100),
                100
              );
              
              const daysRemaining = Math.max(
                0,
                Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              );
              
              const monthsRemaining = Math.ceil(daysRemaining / 30);
              
              return (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-4 bg-green-500/20">
                        <Target className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{goal.name}</h4>
                        <p className="text-sm text-white/60">{goal.category}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      <div>
                        <p className="text-xs text-white/50">Current</p>
                        <p className="font-medium text-white">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Target</p>
                        <p className="font-medium text-white">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Progress</p>
                        <p className="font-medium text-white">{progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Time Left</p>
                        <p className="font-medium text-white">{monthsRemaining} months</p>
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
                  
                  <div className="mt-3">
                    <Progress value={progress} className="h-2" indicatorClassName="bg-green-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
      
      {/* Investments */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Investments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Total Investments</span>
              <span className="text-white">{formatCurrency(savingsData.investments.total)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Monthly Contribution</span>
              <span className="text-white">{formatCurrency(savingsData.investments.monthly)}</span>
            </div>
            
            <h4 className="text-white font-medium mt-6 mb-3">Asset Allocation</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white/70">Stocks</span>
                  <span className="text-sm text-white/70">{savingsData.investments.allocation.stocks}%</span>
                </div>
                <Progress value={savingsData.investments.allocation.stocks} className="h-2" indicatorClassName="bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white/70">Bonds</span>
                  <span className="text-sm text-white/70">{savingsData.investments.allocation.bonds}%</span>
                </div>
                <Progress value={savingsData.investments.allocation.bonds} className="h-2" indicatorClassName="bg-purple-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white/70">Cash</span>
                  <span className="text-sm text-white/70">{savingsData.investments.allocation.cash}%</span>
                </div>
                <Progress value={savingsData.investments.allocation.cash} className="h-2" indicatorClassName="bg-green-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Investment Accounts</h4>
            <div className="space-y-3">
              {savingsData.investments.accounts.map((account, index) => (
                <div key={index} className="p-3 rounded-lg bg-black/30 border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{account.name}</span>
                    <span className="text-white">{formatCurrency(account.balance)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-white/50">Monthly Contribution</span>
                    <span className="text-xs text-white/50">{formatCurrency(account.contribution)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment Account
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Add Savings Goal Form (conditionally rendered) */}
      {showAddGoal && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Add New Savings Goal</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddGoal(false)}
              className="bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Goal Name</label>
              <input 
                type="text" 
                placeholder="e.g., Vacation Fund" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
              <select className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-green-500 focus:outline-none">
                <option value="">Select a category</option>
                <option value="travel">Travel</option>
                <option value="home">Home</option>
                <option value="transportation">Transportation</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Target Amount</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Current Amount</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Target Date</label>
              <input 
                type="date" 
                className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Priority</label>
              <select className="w-full p-2 rounded-md bg-black/30 border border-white/10 text-white focus:border-green-500 focus:outline-none">
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            Add Savings Goal
          </Button>
        </motion.div>
      )}
    </div>
  );
} 