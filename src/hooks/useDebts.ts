import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as debtService from '@/lib/supabase/debtService';
import type { Debt, ServiceResponse } from '@/lib/supabase/debtService';

interface UseDebtsState {
  debts: Debt[];
  isLoading: boolean;
  error: Error | null;
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
}

export function useDebts(): UseDebtsState & UseDebtsActions {
  const { user } = useAuth();
  const [state, setState] = useState<UseDebtsState>({
    debts: [],
    isLoading: true,
    error: null,
    debtSummary: null,
  });

  // Fetch all debts for the user
  const refreshDebts = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, debts: [], isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Fetch debts
      const debtsResponse = await debtService.fetchUserDebts(user.id);
      
      // Fetch debt summary
      const summaryResponse = await debtService.getUserDebtSummary(user.id);

      if (debtsResponse.error) {
        throw debtsResponse.error;
      }

      setState({
        debts: debtsResponse.data || [],
        isLoading: false,
        error: null,
        debtSummary: summaryResponse.data,
      });
    } catch (error) {
      console.error('Error fetching debts:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch debts'),
      }));
    }
  }, [user?.id]);

  // Add a new debt
  const addDebt = useCallback(async (
    debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Debt | null> => {
    if (!user?.id) {
      return null;
    }

    try {
      const newDebtData = {
        ...debt,
        user_id: user.id,
      };

      const response = await debtService.createDebt(newDebtData);

      if (response.error) {
        throw response.error;
      }

      if (response.data) {
        // Update the local state with the new debt
        setState(prev => ({
          ...prev,
          debts: [response.data!, ...prev.debts],
        }));

        // Refresh debt summary
        await refreshDebts();
      }

      return response.data;
    } catch (error) {
      console.error('Error adding debt:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to add debt'),
      }));
      return null;
    }
  }, [user?.id, refreshDebts]);

  // Update an existing debt
  const updateDebt = useCallback(async (
    debtId: string,
    updates: Partial<Omit<Debt, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Debt | null> => {
    try {
      const response = await debtService.updateDebt(debtId, updates);

      if (response.error) {
        throw response.error;
      }

      if (response.data) {
        // Update the local state with the updated debt
        setState(prev => ({
          ...prev,
          debts: prev.debts.map(debt => 
            debt.id === debtId ? response.data! : debt
          ),
        }));

        // Refresh debt summary
        await refreshDebts();
      }

      return response.data;
    } catch (error) {
      console.error('Error updating debt:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to update debt'),
      }));
      return null;
    }
  }, [refreshDebts]);

  // Delete a debt
  const deleteDebt = useCallback(async (debtId: string): Promise<boolean> => {
    try {
      const response = await debtService.deleteDebt(debtId);

      if (response.error) {
        throw response.error;
      }

      // Remove the debt from local state
      setState(prev => ({
        ...prev,
        debts: prev.debts.filter(debt => debt.id !== debtId),
      }));

      // Refresh debt summary
      await refreshDebts();
      
      return true;
    } catch (error) {
      console.error('Error deleting debt:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to delete debt'),
      }));
      return false;
    }
  }, [refreshDebts]);

  // Get a single debt by ID
  const getDebtById = useCallback(async (debtId: string): Promise<Debt | null> => {
    try {
      const response = await debtService.fetchDebtById(debtId);

      if (response.error) {
        throw response.error;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching debt by ID:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch debt'),
      }));
      return null;
    }
  }, []);

  // Load debts on mount or when user changes
  useEffect(() => {
    refreshDebts();
  }, [refreshDebts]);

  return {
    ...state,
    refreshDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    getDebtById,
  };
} 