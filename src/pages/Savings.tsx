import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Plus, 
  Trash2,
  Edit,
  Target,
  Calendar,
  DollarSign,
  PiggyBank,
  Home,
  Car,
  Briefcase,
  Plane,
  Gift,
  Smartphone,
  GraduationCap,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock data for savings goals
const mockSavingsGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    icon: 'piggybank',
    targetAmount: 10000,
    currentAmount: 5600,
    deadline: '2023-12-31',
    createdAt: '2023-01-15',
    color: '#4ECDC4'
  },
  {
    id: '2',
    name: 'Down Payment',
    icon: 'home',
    targetAmount: 50000,
    currentAmount: 12500,
    deadline: '2025-06-30',
    createdAt: '2023-02-10',
    color: '#FF6B6B'
  },
  {
    id: '3',
    name: 'Vacation',
    icon: 'plane',
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: '2023-08-15',
    createdAt: '2023-03-05',
    color: '#C7F464'
  },
  {
    id: '4',
    name: 'New Car',
    icon: 'car',
    targetAmount: 25000,
    currentAmount: 8000,
    deadline: '2024-10-01',
    createdAt: '2023-01-20',
    color: '#556270'
  }
];

type SavingsIconType = 'piggybank' | 'home' | 'car' | 'plane' | 'gift' | 'smartphone' | 'graduation' | 'heart' | 'briefcase';

interface SavingsGoal {
  id: string;
  name: string;
  icon: SavingsIconType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  color: string;
}

interface SavingsFormData {
  name: string;
  icon: SavingsIconType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export default function Savings() {
  const { user } = useAuth();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SavingsFormData>({
    name: '',
    icon: 'piggybank',
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    color: '#4ECDC4'
  });

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['targetAmount', 'currentAmount'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setSavingsGoals([...savingsGoals, newGoal]);
    setFormData({
      name: '',
      icon: 'piggybank',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: '#4ECDC4'
    });
    setIsAddingGoal(false);
  };

  const handleEditGoal = (goalId: string) => {
    const goalToEdit = savingsGoals.find(goal => goal.id === goalId);
    if (goalToEdit) {
      setFormData({
        name: goalToEdit.name,
        icon: goalToEdit.icon,
        targetAmount: goalToEdit.targetAmount,
        currentAmount: goalToEdit.currentAmount,
        deadline: goalToEdit.deadline,
        color: goalToEdit.color
      });
      setEditingGoalId(goalId);
      setIsAddingGoal(true);
    }
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalId) {
      const updatedGoals = savingsGoals.map(goal => {
        if (goal.id === editingGoalId) {
          return {
            ...goal,
            ...formData
          };
        }
        return goal;
      });
      setSavingsGoals(updatedGoals);
      setEditingGoalId(null);
      setFormData({
        name: '',
        icon: 'piggybank',
        targetAmount: 0,
        currentAmount: 0,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        color: '#4ECDC4'
      });
      setIsAddingGoal(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals(savingsGoals.filter(goal => goal.id !== goalId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGoalIcon = (iconName: SavingsIconType) => {
    const icons = {
      piggybank: <PiggyBank className="h-5 w-5" />,
      home: <Home className="h-5 w-5" />,
      car: <Car className="h-5 w-5" />,
      plane: <Plane className="h-5 w-5" />,
      gift: <Gift className="h-5 w-5" />,
      smartphone: <Smartphone className="h-5 w-5" />,
      graduation: <GraduationCap className="h-5 w-5" />,
      heart: <Heart className="h-5 w-5" />,
      briefcase: <Briefcase className="h-5 w-5" />
    };
    return icons[iconName];
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeStatus = (deadline: string) => {
    const daysRemaining = calculateDaysRemaining(deadline);
    if (daysRemaining < 0) {
      return { label: 'Overdue', color: 'text-red-500' };
    } else if (daysRemaining < 30) {
      return { label: `${daysRemaining} days left`, color: 'text-orange-400' };
    } else if (daysRemaining < 90) {
      return { label: `${daysRemaining} days left`, color: 'text-yellow-400' };
    } else {
      return { label: `${daysRemaining} days left`, color: 'text-green-400' };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Savings Goals</h1>
            <p className="text-gray-400">Track your progress towards financial milestones</p>
          </div>
          <button
            onClick={() => {
              setIsAddingGoal(true);
              setEditingGoalId(null);
              setFormData({
                name: '',
                icon: 'piggybank',
                targetAmount: 0,
                currentAmount: 0,
                deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                color: '#4ECDC4'
              });
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4"
          >
            <h3 className="text-sm font-medium text-gray-400">Total Saved</h3>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totalSaved)}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress className="mt-2" value={overallProgress} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4"
          >
            <h3 className="text-sm font-medium text-gray-400">Target Amount</h3>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totalTarget)}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span>Remaining to Save</span>
                <span>{formatCurrency(totalTarget - totalSaved)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-gray-400">
                  {savingsGoals.length} active goals
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4"
          >
            <h3 className="text-sm font-medium text-gray-400">Next Milestone</h3>
            {savingsGoals.length > 0 && (
              <>
                {/* Find the goal with the closest deadline that's not passed */}
                {(() => {
                  const activeGoals = savingsGoals.filter(
                    goal => calculateDaysRemaining(goal.deadline) > 0
                  );
                  if (activeGoals.length === 0) return null;
                  
                  const nextGoal = activeGoals.sort(
                    (a, b) => calculateDaysRemaining(a.deadline) - calculateDaysRemaining(b.deadline)
                  )[0];
                  
                  const timeStatus = getTimeStatus(nextGoal.deadline);
                  
                  return (
                    <>
                      <div className="mt-2">
                        <p className="font-medium">{nextGoal.name}</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm ${timeStatus.color}`}>
                            {timeStatus.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span>{formatCurrency(nextGoal.currentAmount)}</span>
                          <span>{formatCurrency(nextGoal.targetAmount)}</span>
                        </div>
                        <Progress 
                          className="mt-2" 
                          value={(nextGoal.currentAmount / nextGoal.targetAmount) * 100}
                          indicatorColor={nextGoal.color}
                        />
                      </div>
                    </>
                  );
                })()}
              </>
            )}
            {savingsGoals.length === 0 && (
              <div className="mt-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">No active goals</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Savings Goal Form */}
        {isAddingGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="border-b border-gray-800 px-6 py-4">
              <h3 className="text-lg font-medium">
                {editingGoalId ? 'Edit Savings Goal' : 'Add New Savings Goal'}
              </h3>
            </div>
            <form onSubmit={editingGoalId ? handleUpdateGoal : handleAddGoal} className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Emergency Fund, Vacation"
                  />
                </div>

                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-400">
                    Icon
                  </label>
                  <select
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="piggybank">Savings</option>
                    <option value="home">Home</option>
                    <option value="car">Car</option>
                    <option value="plane">Travel</option>
                    <option value="gift">Gift</option>
                    <option value="smartphone">Electronics</option>
                    <option value="graduation">Education</option>
                    <option value="heart">Health</option>
                    <option value="briefcase">Business</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-400">
                    Target Amount
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="targetAmount"
                      name="targetAmount"
                      value={formData.targetAmount || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-400">
                    Current Amount
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="currentAmount"
                      name="currentAmount"
                      value={formData.currentAmount || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-400">
                    Target Date
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-400">
                    Color
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="h-10 w-10 rounded border border-gray-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={handleInputChange}
                      name="color"
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  {editingGoalId ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Savings Goals Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Savings Goals</h2>
          
          {savingsGoals.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-8 text-center">
              <p className="text-gray-400">You haven't added any savings goals yet.</p>
              <button
                onClick={() => setIsAddingGoal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savingsGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const timeStatus = getTimeStatus(goal.deadline);
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {getGoalIcon(goal.icon)}
                        </div>
                        <h3 className="font-medium">{goal.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
                          title="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditGoal(goal.id)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
                          title="Edit goal"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Current</p>
                          <p className="font-medium">{formatCurrency(goal.currentAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Target</p>
                          <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                      </div>
                      
                      <Progress 
                        className="mb-4" 
                        value={progress}
                        indicatorColor={goal.color}
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={timeStatus.color}>{timeStatus.label}</span>
                        </div>
                        <span className="font-medium">{Math.round(progress)}% complete</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 