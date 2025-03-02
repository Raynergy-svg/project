import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Plus,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowRight,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Home,
  GraduationCap,
  Car,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  WifiOff,
  Database,
  ScrollText,
  Package,
  Banknote,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useDebts } from '@/hooks/useDebts';
import { Debt } from '@/lib/supabase/debtService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DebtCategoryType, DEBT_CATEGORIES } from '@/lib/constants';
import { DebtAIModule } from '@/components/ai/DebtAIModule';

// Map debt types between our UI and database
const mapCategoryToType = (category: DebtCategoryType): Debt['type'] => {
  const mapping: Record<DebtCategoryType, Debt['type']> = {
    credit_card: 'credit_card',
    mortgage: 'mortgage',
    auto: 'auto_loan',
    student: 'student_loan',
    personal: 'loan',
    medical: 'medical',
    other: 'other'
  };
  return mapping[category] || 'other';
};

const mapTypeToCategory = (type: Debt['type']): DebtCategoryType => {
  const mapping: Record<Debt['type'], DebtCategoryType> = {
    credit_card: 'credit_card',
    mortgage: 'mortgage',
    auto_loan: 'auto',
    student_loan: 'student',
    loan: 'personal',
    medical: 'medical',
    other: 'other'
  };
  return mapping[type] || 'other';
};

interface DebtFormData {
  name: string;
  category: DebtCategoryType;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
  notes?: string;
}

export function Debts() {
  const { user } = useAuth();
  const {
    debts,
    isLoading,
    error,
    connectionError,
    debtSummary,
    addDebt: addDebtToSupabase,
    updateDebt: updateDebtInSupabase,
    deleteDebt: deleteDebtFromSupabase,
    refreshDebts,
    resetErrors,
    tableExists
  } = useDebts();

  const [activeTab, setActiveTab] = useState<'all' | 'credit-cards' | 'loans' | 'other'>('all');
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DebtFormData>({
    name: '',
    category: 'credit_card',
    amount: 0,
    interestRate: 0,
    minimumPayment: 0,
    dueDate: undefined,
    notes: undefined
  });
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a retry function for connection errors
  const handleRetryConnection = () => {
    resetErrors();
    refreshDebts();
  };

  // Filter debts based on active tab
  const filteredDebts = debts.filter(debt => {
    if (activeTab === 'all') return true;
    if (activeTab === 'credit-cards') return debt.type === 'credit_card';
    if (activeTab === 'loans') return ['loan', 'student_loan', 'auto_loan', 'mortgage'].includes(debt.type);
    if (activeTab === 'other') return ['medical', 'other'].includes(debt.type);
    return true;
  });

  // Calculate totals for the filtered debts
  const totalDebt = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalMonthlyPayment = filteredDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const avgInterestRate = filteredDebts.length > 0
    ? filteredDebts.reduce((sum, debt) => sum + (debt.interest_rate * debt.amount), 0) / totalDebt
    : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['amount', 'interestRate', 'minimumPayment'].includes(name)
        ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      const newDebt = {
        user_id: user.id,
        name: formData.name,
        type: mapCategoryToType(formData.category),
        amount: formData.amount,
        interest_rate: formData.interestRate,
        minimum_payment: formData.minimumPayment,
        due_date: formData.dueDate || null,
        notes: formData.notes || null
      };

      const result = await addDebtToSupabase(newDebt);

      if (result) {
        toast({
          title: "Debt added successfully",
          description: `${formData.name} has been added to your debt list.`,
        });

        setFormData({
          name: '',
          category: 'credit_card',
          amount: 0,
          interestRate: 0,
          minimumPayment: 0,
          dueDate: undefined,
          notes: undefined
        });
        setShowAddDebt(false);
      } else {
        toast({
          title: "Error adding debt",
          description: "There was a problem adding your debt. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding debt:', error);
      toast({
        title: "Error adding debt",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDebt = (debtId: string) => {
    const debtToEdit = debts.find(debt => debt.id === debtId);
    if (debtToEdit) {
      setFormData({
        name: debtToEdit.name,
        category: mapTypeToCategory(debtToEdit.type),
        amount: debtToEdit.amount,
        interestRate: debtToEdit.interest_rate,
        minimumPayment: debtToEdit.minimum_payment,
        dueDate: debtToEdit.due_date || undefined,
        notes: debtToEdit.notes || undefined
      });
      setEditingDebtId(debtId);
      setShowAddDebt(true);
    }
  };

  const handleUpdateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDebtId) return;

    setIsSubmitting(true);

    try {
      const updatedDebt = {
        name: formData.name,
        type: mapCategoryToType(formData.category),
        amount: formData.amount,
        interest_rate: formData.interestRate,
        minimum_payment: formData.minimumPayment,
        due_date: formData.dueDate || null,
        notes: formData.notes || null
      };

      const result = await updateDebtInSupabase(editingDebtId, updatedDebt);

      if (result) {
        toast({
          title: "Debt updated successfully",
          description: `${formData.name} has been updated.`,
        });

        setEditingDebtId(null);
        setFormData({
          name: '',
          category: 'credit_card',
          amount: 0,
          interestRate: 0,
          minimumPayment: 0,
          dueDate: undefined,
          notes: undefined
        });
        setShowAddDebt(false);
      } else {
        toast({
          title: "Error updating debt",
          description: "There was a problem updating your debt. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating debt:', error);
      toast({
        title: "Error updating debt",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (confirm("Are you sure you want to delete this debt?")) {
      try {
        const success = await deleteDebtFromSupabase(debtId);

        if (success) {
          toast({
            title: "Debt deleted successfully",
            description: "The debt has been removed from your list.",
          });
        } else {
          toast({
            title: "Error deleting debt",
            description: "There was a problem deleting your debt. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting debt:', error);
        toast({
          title: "Error deleting debt",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    }
  };

  const toggleDebtDetails = (debtId: string) => {
    setExpandedDebtId(expandedDebtId === debtId ? null : debtId);
  };

  const getCategoryIcon = (type: Debt['type']) => {
    const category = mapTypeToCategory(type);
    const icons = {
      credit_card: <CreditCard className="h-5 w-5" />,
      mortgage: <Home className="h-5 w-5" />,
      auto: <Car className="h-5 w-5" />,
      student: <GraduationCap className="h-5 w-5" />,
      personal: <Briefcase className="h-5 w-5" />,
      medical: <AlertCircle className="h-5 w-5" />,
      other: <DollarSign className="h-5 w-5" />
    };
    return icons[category];
  };

  // Calculate estimated payoff data
  const calculatePayoffDate = (debt: Debt) => {
    const monthlyRate = debt.interest_rate / 100 / 12;
    const totalPayments = Math.log(debt.minimum_payment / (debt.minimum_payment - debt.amount * monthlyRate)) / Math.log(1 + monthlyRate);
    const months = isFinite(totalPayments) ? Math.ceil(totalPayments) : 0;

    const today = new Date();
    const payoffDate = new Date(today);
    payoffDate.setMonth(today.getMonth() + months);

    return payoffDate.toLocaleDateString();
  };

  const calculateTotalInterest = (debt: Debt) => {
    const monthlyRate = debt.interest_rate / 100 / 12;
    const totalPayments = Math.log(debt.minimum_payment / (debt.minimum_payment - debt.amount * monthlyRate)) / Math.log(1 + monthlyRate);
    const months = isFinite(totalPayments) ? Math.ceil(totalPayments) : 0;

    return (debt.minimum_payment * months) - debt.amount;
  };

  // Add the connection error UI section after the return statement
  // Check for errors and display appropriate messages
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading your debt information...</h3>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
        <WifiOff className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Connection Error</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We're having trouble connecting to the database. This could be due to network issues or server maintenance.
        </p>
        <Button 
          onClick={handleRetryConnection}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!tableExists) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
        <Database className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Database Setup Required</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          The debts table doesn't exist in your Supabase project yet. To fix this, you need to run a SQL setup script in your Supabase dashboard.
        </p>
        <div className="bg-black/30 p-4 rounded-md mb-6 text-left text-xs max-w-xl overflow-auto">
          <pre className="whitespace-pre-wrap">
{`-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(6,2) NOT NULL,
  minimum_payment DECIMAL(15,2) NOT NULL,
  due_date DATE,
  notes TEXT,
  priority INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  institution_id TEXT,
  account_id TEXT,
  plaid_item_id TEXT,
  last_updated_from_bank TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON public.debts (user_id);
CREATE INDEX IF NOT EXISTS debts_type_idx ON public.debts (type);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY select_own_debts ON public.debts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY insert_own_debts ON public.debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY update_own_debts ON public.debts
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY delete_own_debts ON public.debts
  FOR DELETE USING (auth.uid() = user_id);`}
          </pre>
        </div>
        <Button 
          onClick={handleRetryConnection}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry After Setup
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Debts</h3>
        <p className="text-gray-500 mb-6">{error.message}</p>
        <Button
          onClick={handleRetryConnection}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Debt Management</h2>
        <Button onClick={() => setShowAddDebt(true)} className="bg-primary hover:bg-primary/90">
          Add Debt
        </Button>
      </div>

      {/* AI Module - Add this new section */}
      <DebtAIModule />
      
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
          {isLoading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-3xl font-bold text-white">{formatCurrency(totalDebt)}</div>
              <div className="text-sm text-white/60 mt-1">
                Across {filteredDebts.length} accounts
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span>Debt Breakdown</span>
                  <span>{filteredDebts.length} accounts</span>
                </div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-gray-800">
                  {filteredDebts.map((debt) => (
                    <div
                      key={debt.id}
                      className="h-full"
                      style={{
                        width: `${(debt.amount / totalDebt) * 100}%`,
                        backgroundColor: DEBT_CATEGORIES[mapTypeToCategory(debt.type)]?.color || "#666"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
          {isLoading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-3xl font-bold text-white">{formatCurrency(totalMonthlyPayment)}</div>
              <div className="text-sm text-white/60 mt-1">
                Minimum required payments
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span>Percentage of Income</span>
                  <span>TBD</span>
                </div>
                <Progress className="mt-2" value={30} />
              </div>
            </div>
          )}
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
          {isLoading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-3xl font-bold text-white">{avgInterestRate.toFixed(2)}%</div>
              <div className="text-sm text-white/60 mt-1">
                Weighted average APR
              </div>
              {filteredDebts.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs text-[#88B04B]">
                    Highest: {Math.max(...filteredDebts.map(d => d.interest_rate))}%
                  </div>
                </div>
              )}
            </div>
          )}
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
            onClick={() => {
              setShowAddDebt(true);
              setEditingDebtId(null);
              setFormData({
                name: '',
                category: 'credit_card',
                amount: 0,
                interestRate: 0,
                minimumPayment: 0,
                dueDate: undefined,
                notes: undefined
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Debt
          </Button>
        </div>

        {/* Debt Form */}
        {showAddDebt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden mb-6"
          >
            <div className="border-b border-gray-800 px-6 py-4">
              <h3 className="text-lg font-medium text-white">
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

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-400">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-400">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Additional information about this debt"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowAddDebt(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingDebtId ? 'Update Debt' : 'Add Debt'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredDebts.length === 0 ? (
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
                className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleDebtDetails(debt.id!)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 bg-${DEBT_CATEGORIES[mapTypeToCategory(debt.type)]?.color || "gray"}-500/20`}>
                        {getCategoryIcon(debt.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{debt.name}</h4>
                        <p className="text-sm text-white/60">
                          {DEBT_CATEGORIES[mapTypeToCategory(debt.type)]?.label || "Other"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                      <div>
                        <p className="text-xs text-white/50">Balance</p>
                        <p className="font-medium text-white">{formatCurrency(debt.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Interest Rate</p>
                        <p className="font-medium text-white">{debt.interest_rate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Min. Payment</p>
                        <p className="font-medium text-white">{formatCurrency(debt.minimum_payment)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
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
                        <p className="font-medium text-white">{formatCurrency(debt.minimum_payment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Estimated Payoff Date</p>
                        <p className="font-medium text-white">{calculatePayoffDate(debt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Interest</p>
                        <p className="font-medium text-white">{formatCurrency(calculateTotalInterest(debt))}</p>
                      </div>
                    </div>

                    {debt.notes && (
                      <div className="mt-4 rounded bg-gray-800/50 p-3">
                        <p className="text-sm text-white">{debt.notes}</p>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <Button
                        onClick={() => handleDeleteDebt(debt.id!)}
                        variant="outline"
                        className="bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        onClick={() => handleEditDebt(debt.id!)}
                        variant="outline"
                        className="bg-white/5 hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
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
              <h4 className="font-medium text-white">AI Recommendation</h4>
              <p className="text-sm text-white/70 mt-1">
                Based on your specific debt profile, our AI recommends a hybrid approach. Focus on your high-interest credit card debt first, while maintaining minimum payments on all other debts.
              </p>
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                See Detailed Plan
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 