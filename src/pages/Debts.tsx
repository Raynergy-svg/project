import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Plus, 
  CreditCard, 
  Home, 
  Car, 
  GraduationCap, 
  Briefcase,
  Trash2,
  Edit,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DebtCategoryType, DEBT_CATEGORIES } from '@/lib/constants';

// Mock data for debts
const mockDebts = [
  {
    id: '1',
    name: 'Credit Card A',
    category: 'credit_card' as DebtCategoryType,
    amount: 5000,
    interestRate: 18.99,
    minimumPayment: 150,
    remainingPayments: 42,
    nextPaymentDate: '2023-06-15',
    totalInterest: 1245.32,
    payoffDate: '2026-12-15'
  },
  {
    id: '2',
    name: 'Home Mortgage',
    category: 'mortgage' as DebtCategoryType,
    amount: 250000,
    interestRate: 4.5,
    minimumPayment: 1250,
    remainingPayments: 324,
    nextPaymentDate: '2023-06-01',
    totalInterest: 153000,
    payoffDate: '2050-05-01'
  },
  {
    id: '3',
    name: 'Car Loan',
    category: 'auto' as DebtCategoryType,
    amount: 18000,
    interestRate: 5.25,
    minimumPayment: 350,
    remainingPayments: 48,
    nextPaymentDate: '2023-06-10',
    totalInterest: 2520,
    payoffDate: '2027-06-10'
  },
  {
    id: '4',
    name: 'Student Loan',
    category: 'student' as DebtCategoryType,
    amount: 35000,
    interestRate: 4.99,
    minimumPayment: 380,
    remainingPayments: 110,
    nextPaymentDate: '2023-06-21',
    totalInterest: 6820,
    payoffDate: '2032-08-21'
  }
];

interface DebtFormData {
  name: string;
  category: DebtCategoryType;
  amount: number;
  interestRate: number;
  minimumPayment: number;
}

export default function Debts() {
  const { user } = useAuth();
  const [debts, setDebts] = useState(mockDebts);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DebtFormData>({
    name: '',
    category: 'credit_card',
    amount: 0,
    interestRate: 0,
    minimumPayment: 0
  });
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const highestInterestDebt = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const newDebt = {
      id: Date.now().toString(),
      ...formData,
      remainingPayments: Math.ceil(formData.amount / formData.minimumPayment),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalInterest: (formData.amount * formData.interestRate / 100),
      payoffDate: new Date(Date.now() + (Math.ceil(formData.amount / formData.minimumPayment) * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setDebts([...debts, newDebt]);
    setFormData({
      name: '',
      category: 'credit_card',
      amount: 0,
      interestRate: 0,
      minimumPayment: 0
    });
    setIsAddingDebt(false);
  };

  const handleEditDebt = (debtId: string) => {
    const debtToEdit = debts.find(debt => debt.id === debtId);
    if (debtToEdit) {
      setFormData({
        name: debtToEdit.name,
        category: debtToEdit.category,
        amount: debtToEdit.amount,
        interestRate: debtToEdit.interestRate,
        minimumPayment: debtToEdit.minimumPayment
      });
      setEditingDebtId(debtId);
      setIsAddingDebt(true);
    }
  };

  const handleUpdateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDebtId) {
      const updatedDebts = debts.map(debt => {
        if (debt.id === editingDebtId) {
          return {
            ...debt,
            ...formData,
            remainingPayments: Math.ceil(formData.amount / formData.minimumPayment),
            totalInterest: (formData.amount * formData.interestRate / 100),
            payoffDate: new Date(Date.now() + (Math.ceil(formData.amount / formData.minimumPayment) * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        }
        return debt;
      });
      setDebts(updatedDebts);
      setEditingDebtId(null);
      setFormData({
        name: '',
        category: 'credit_card',
        amount: 0,
        interestRate: 0,
        minimumPayment: 0
      });
      setIsAddingDebt(false);
    }
  };

  const handleDeleteDebt = (debtId: string) => {
    setDebts(debts.filter(debt => debt.id !== debtId));
  };

  const toggleDebtDetails = (debtId: string) => {
    setExpandedDebtId(expandedDebtId === debtId ? null : debtId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category: DebtCategoryType) => {
    const icons = {
      credit_card: <CreditCard className="h-5 w-5" />,
      mortgage: <Home className="h-5 w-5" />,
      auto: <Car className="h-5 w-5" />,
      student: <GraduationCap className="h-5 w-5" />,
      personal: <Briefcase className="h-5 w-5" />
    };
    return icons[category];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Debt Management</h1>
            <p className="text-gray-400">Track and optimize your debt payoff strategy</p>
          </div>
          <button
            onClick={() => {
              setIsAddingDebt(true);
              setEditingDebtId(null);
              setFormData({
                name: '',
                category: 'credit_card',
                amount: 0,
                interestRate: 0,
                minimumPayment: 0
              });
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Debt
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
            <h3 className="text-sm font-medium text-gray-400">Total Debt</h3>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totalDebt)}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span>Debt Breakdown</span>
                <span>{debts.length} accounts</span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-gray-800">
                {debts.map((debt, index) => (
                  <div
                    key={debt.id}
                    className="h-full"
                    style={{
                      width: `${(debt.amount / totalDebt) * 100}%`,
                      backgroundColor: DEBT_CATEGORIES[debt.category].color
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4"
          >
            <h3 className="text-sm font-medium text-gray-400">Monthly Payments</h3>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(debts.reduce((sum, debt) => sum + debt.minimumPayment, 0))}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span>Percentage of Income</span>
                <span>32%</span>
              </div>
              <Progress className="mt-2" value={32} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4"
          >
            <h3 className="text-sm font-medium text-gray-400">Highest Interest</h3>
            {highestInterestDebt && (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold">{highestInterestDebt.interestRate}%</span>
                  <span className="text-sm text-gray-400">{highestInterestDebt.name}</span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span>Priority for payoff</span>
                    <span className="text-[#88B04B]">Recommended</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-[#88B04B]" />
                    <span className="text-xs text-gray-400">
                      Save {formatCurrency(highestInterestDebt.totalInterest * 0.3)} by paying off early
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Debt Form */}
        {isAddingDebt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="border-b border-gray-800 px-6 py-4">
              <h3 className="text-lg font-medium">
                {editingDebtId ? 'Edit Debt' : 'Add New Debt'}
              </h3>
            </div>
            <form onSubmit={editingDebtId ? handleUpdateDebt : handleAddDebt} className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                    Debt Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Credit Card, Mortgage"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-400">
                    Debt Type
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.entries(DEBT_CATEGORIES).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-400">
                    Current Balance
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount || ''}
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
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-400">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={formData.interestRate || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="minimumPayment" className="block text-sm font-medium text-gray-400">
                    Minimum Monthly Payment
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="minimumPayment"
                      name="minimumPayment"
                      value={formData.minimumPayment || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingDebt(false)}
                  className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  {editingDebtId ? 'Update Debt' : 'Add Debt'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Debts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Debts</h2>
          
          {debts.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-8 text-center">
              <p className="text-gray-400">You haven't added any debts yet.</p>
              <button
                onClick={() => setIsAddingDebt(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Your First Debt
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
                >
                  <div 
                    className="flex items-center justify-between px-6 py-4 cursor-pointer"
                    onClick={() => toggleDebtDetails(debt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${DEBT_CATEGORIES[debt.category].color}20` }}
                      >
                        {getCategoryIcon(debt.category)}
                      </div>
                      <div>
                        <h3 className="font-medium">{debt.name}</h3>
                        <p className="text-sm text-gray-400">{DEBT_CATEGORIES[debt.category].label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(debt.amount)}</p>
                        <p className="text-sm text-gray-400">{debt.interestRate}% APR</p>
                      </div>
                      <div>
                        {expandedDebtId === debt.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedDebtId === debt.id && (
                    <div className="border-t border-gray-800 px-6 py-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-400">Monthly Payment</p>
                          <p className="font-medium">{formatCurrency(debt.minimumPayment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Remaining Payments</p>
                          <p className="font-medium">{debt.remainingPayments}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Next Payment</p>
                          <p className="font-medium">{new Date(debt.nextPaymentDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Interest</p>
                          <p className="font-medium">{formatCurrency(debt.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Payoff Date</p>
                          <p className="font-medium">{new Date(debt.payoffDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-800 bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditDebt(debt.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 