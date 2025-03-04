import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as debtService from '@/lib/supabase/debtService';
import type { Debt, ServiceResponse } from '@/lib/supabase/debtService';

// Mock debts data
const MOCK_DEBTS: Debt[] = [
  {
    id: '1',
    user_id: 'user123',
    name: 'Chase Sapphire Card',
    type: 'credit_card',
    amount: 4500,
    interest_rate: 18.99,
    minimum_payment: 150,
    due_date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    notes: 'Need to pay this off quickly',
    priority: 1,
    created_at: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user123',
    name: 'Student Loan',
    type: 'student_loan',
    amount: 28000,
    interest_rate: 4.5,
    minimum_payment: 350,
    due_date: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
    notes: 'Federal student loan',
    priority: 2,
    created_at: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'user123',
    name: 'Car Loan',
    type: 'loan',
    amount: 15000,
    interest_rate: 5.25,
    minimum_payment: 320,
    due_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    notes: 'Toyota finance',
    priority: 3,
    created_at: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'user123',
    name: 'Medical Bill',
    type: 'medical',
    amount: 1200,
    interest_rate: 0,
    minimum_payment: 100,
    due_date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
    notes: 'Hospital visit payment plan',
    priority: 4,
    created_at: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Generate a mock debt summary based on the mock debts
const generateMockDebtSummary = (debts: Debt[]) => {
  return {
    total_amount: debts.reduce((sum, debt) => sum + debt.amount, 0),
    highest_interest_rate: Math.max(...debts.map(debt => debt.interest_rate)),
    total_minimum_payment: debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
    debt_count: debts.length
  };
};

// Mock debt summary
const MOCK_DEBT_SUMMARY = generateMockDebtSummary(MOCK_DEBTS);

interface UseDebtsState {
  debts: Debt[];
  isLoading: boolean;
  error: Error | null;
  connectionError: boolean;
  tableExists: boolean;
  debtSummary: {
    total_amount: number;
    highest_interest_rate: number;
    total_minimum_payment: number;
    debt_count: number;
  } | null;
}

interface UseDebtsActions {
  refreshDebts: () => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Debt | null>;
  updateDebt: (debtId: string, updates: Partial<Omit<Debt, 'id' | 'user_id' | 'created_at'>>) => Promise<Debt | null>;
  deleteDebt: (debtId: string) => Promise<boolean>;
  getDebtById: (debtId: string) => Promise<Debt | null>;
  resetErrors: () => void;
}

export function useDebts(): UseDebtsState & UseDebtsActions {
  const { user } = useAuth();
  const [state, setState] = useState<UseDebtsState>({
    debts: MOCK_DEBTS, // Initialize with mock data
    isLoading: false,  // No initial loading needed with mock data
    error: null,
    connectionError: false,
    tableExists: true,
    debtSummary: MOCK_DEBT_SUMMARY,
  });

  // Helper functions for error checking (unchanged)
  const isConnectionError = (error: Error | null): boolean => {
    if (!error) return false;
    return error.message.includes('connection') || 
           error.message.includes('fetch') || 
           error.message.includes('network');
  };
  
  const isTableNotFoundError = (error: any): boolean => {
    return error && (
      (error.code === '42P01') || // PostgreSQL code for undefined table
      (error.code === 'PGRST301') || // PostgREST code for nonexistent table
      (error.message && error.message.includes('does not exist')) ||
      (error.details && error.details.includes('does not exist'))
    );
  };
  
  // Reset errors
  const resetErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      connectionError: false
    }));
  }, []);

  // Fetch all debts for the user (now returns mock data)
  const refreshDebts = useCallback(async () => {
    if (!user?.id) {
      console.warn('useDebts: refreshDebts called but no user ID is available');
      setState(prev => ({ ...prev, debts: [], isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, connectionError: false }));
    console.log('useDebts: refreshDebts - Loading mock debt data');

    try {
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock data
      setState(prev => ({
        ...prev,
        debts: MOCK_DEBTS,
        isLoading: false,
        error: null,
        connectionError: false,
        tableExists: true,
        debtSummary: MOCK_DEBT_SUMMARY,
      }));
    } catch (error) {
      console.error('useDebts: Error in mock data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error 
          ? error 
          : new Error('Failed to fetch mock debts.'),
      }));
    }
  }, [user?.id]);

  // Add a new debt
  const addDebt = useCallback(async (
    debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Debt | null> => {
    if (!user?.id) {
      console.warn('useDebts: addDebt called but no user ID is available');
      return null;
    }

    try {
      console.log('useDebts: Adding new mock debt', { debtName: debt.name });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new mock debt
      const newDebt: Debt = {
        ...debt,
        id: `mock_${Math.random().toString(36).substring(2, 11)}`,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Update state with new mock debt
      setState(prev => {
        const updatedDebts = [newDebt, ...prev.debts];
        return {
          ...prev,
          debts: updatedDebts,
          debtSummary: generateMockDebtSummary(updatedDebts)
        };
      });

      return newDebt;
    } catch (error) {
      console.error('useDebts: Error adding mock debt:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to add mock debt'),
      }));
      
      return null;
    }
  }, [user?.id]);

  // Update an existing debt
  const updateDebt = useCallback(async (
    debtId: string, 
    updates: Partial<Omit<Debt, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Debt | null> => {
    if (!user?.id) {
      console.warn('useDebts: updateDebt called but no user ID is available');
      return null;
    }

    try {
      console.log('useDebts: Updating mock debt', { debtId });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if debt exists
      const debtIndex = state.debts.findIndex(d => d.id === debtId);
      if (debtIndex === -1) {
        throw new Error(`Debt with ID ${debtId} not found`);
      }
      
      // Create updated debt
      const updatedDebt: Debt = {
        ...state.debts[debtIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Update state with modified debt
      setState(prev => {
        const updatedDebts = [...prev.debts];
        updatedDebts[debtIndex] = updatedDebt;
        
        return {
          ...prev,
          debts: updatedDebts,
          debtSummary: generateMockDebtSummary(updatedDebts)
        };
      });

      return updatedDebt;
    } catch (error) {
      console.error('useDebts: Error updating mock debt:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to update mock debt'),
      }));
      
      return null;
    }
  }, [user?.id, state.debts]);

  // Delete a debt
  const deleteDebt = useCallback(async (debtId: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('useDebts: deleteDebt called but no user ID is available');
      return false;
    }

    try {
      console.log('useDebts: Deleting mock debt', { debtId });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update state by removing the debt
      setState(prev => {
        const updatedDebts = prev.debts.filter(d => d.id !== debtId);
        return {
          ...prev,
          debts: updatedDebts,
          debtSummary: generateMockDebtSummary(updatedDebts)
        };
      });

      return true;
    } catch (error) {
      console.error('useDebts: Error deleting mock debt:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to delete mock debt'),
      }));
      
      return false;
    }
  }, [user?.id]);

  // Get a debt by ID
  const getDebtById = useCallback(async (debtId: string): Promise<Debt | null> => {
    try {
      console.log('useDebts: Getting mock debt by ID', { debtId });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find debt in state
      const debt = state.debts.find(d => d.id === debtId);
      if (!debt) {
        throw new Error(`Debt with ID ${debtId} not found`);
      }
      
      return debt;
    } catch (error) {
      console.error('useDebts: Error getting mock debt by ID:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to get mock debt'),
      }));
      
      return null;
    }
  }, [state.debts]);

  // Load mock debts on initial render
  useEffect(() => {
    if (user?.id && state.debts.length === 0) {
      refreshDebts();
    }
  }, [user?.id, refreshDebts, state.debts.length]);

  return {
    ...state,
    refreshDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    getDebtById,
    resetErrors,
  };
} 