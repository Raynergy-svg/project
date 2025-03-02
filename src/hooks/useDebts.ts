import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as debtService from '@/lib/supabase/debtService';
import type { Debt, ServiceResponse } from '@/lib/supabase/debtService';

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
    debts: [],
    isLoading: true,
    error: null,
    connectionError: false,
    tableExists: true,
    debtSummary: null,
  });

  // Helper to check if an error is a connection-related error
  const isConnectionError = (error: Error | null): boolean => {
    if (!error) return false;
    return error.message.includes('connection') || 
           error.message.includes('fetch') || 
           error.message.includes('network');
  };
  
  // Helper to check if an error is due to missing table
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

  // Fetch all debts for the user
  const refreshDebts = useCallback(async () => {
    if (!user?.id) {
      console.warn('useDebts: refreshDebts called but no user ID is available', { 
        userExists: !!user,
        userId: user?.id
      });
      setState(prev => ({ ...prev, debts: [], isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, connectionError: false }));
    console.log('useDebts: refreshDebts - Starting to fetch debts for user', user.id);

    try {
      // First check Supabase connection
      const isConnected = await debtService.checkSupabaseConnection();
      if (!isConnected) {
        console.error('useDebts: Supabase connection check failed');
        setState(prev => ({
          ...prev,
          isLoading: false,
          connectionError: true,
          error: new Error('Cannot connect to the database. Please check your internet connection and try again.')
        }));
        return;
      }
      
      // Fetch debts
      const debtsResponse = await debtService.fetchUserDebts(user.id);
      
      // Check if table doesn't exist (404 error with specific code)
      if (debtsResponse.error && isTableNotFoundError(debtsResponse.error)) {
        console.log('useDebts: Debts table does not exist yet');
        setState(prev => ({
          ...prev,
          isLoading: false,
          tableExists: false,
          debts: [],
          error: new Error('Debts table has not been set up yet. Please follow the setup instructions.')
        }));
        return;
      }
      
      // For other errors, handle normally
      if (debtsResponse.error) {
        console.error('useDebts: Error in debtsResponse', debtsResponse.error);
        
        // Check if this is a connection error
        const connError = isConnectionError(debtsResponse.error);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          connectionError: connError,
          error: debtsResponse.error
        }));
        return;
      }

      // Table exists and we got data, try to get the summary
      try {
        const summaryResponse = await debtService.getUserDebtSummary(user.id);

        if (summaryResponse.error) {
          console.warn('useDebts: Warning - summary fetch failed but debts succeeded', summaryResponse.error);
          // Continue anyway, just log the warning
        }
        
        console.log(`useDebts: Successfully fetched ${debtsResponse.data?.length || 0} debts and summary`);
        
        setState(prev => ({
          ...prev,
          debts: debtsResponse.data || [],
          isLoading: false,
          error: null,
          connectionError: false,
          tableExists: true, // Table definitely exists at this point
          debtSummary: summaryResponse.data,
        }));
      } catch (summaryError) {
        // If only the summary fails, still update with debt data
        console.warn('useDebts: Error fetching summary:', summaryError);
        setState(prev => ({
          ...prev,
          debts: debtsResponse.data || [],
          isLoading: false,
          error: null,
          connectionError: false,
          tableExists: true,
          debtSummary: null,
        }));
      }
    } catch (error) {
      console.error('useDebts: Error fetching debts:', error);
      
      // Check if this is due to missing table
      if (error instanceof Error && isTableNotFoundError(error)) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          tableExists: false,
          error: new Error('The debts table has not been set up in the database.')
        }));
        return;
      }
      
      // Check if this is a connection error
      const isConnError = error instanceof Error && isConnectionError(error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        connectionError: isConnError,
        error: error instanceof Error 
          ? error 
          : new Error('Failed to fetch debts. Please try again later.'),
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
      console.log('useDebts: Adding new debt', { debtName: debt.name });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      const newDebtData = {
        ...debt,
        user_id: user.id,
      };

      const response = await debtService.createDebt(newDebtData);

      if (response.error) {
        console.error('useDebts: Error in createDebt response', response.error);
        
        // Check if this is a connection error
        const connError = isConnectionError(response.error);
        
        setState(prev => ({
          ...prev,
          connectionError: connError,
          error: response.error
        }));
        
        throw response.error;
      }

      if (response.data) {
        console.log('useDebts: Successfully added new debt', { debtId: response.data.id });
        
        // Update the local state with the new debt
        setState(prev => ({
          ...prev,
          debts: [response.data!, ...prev.debts],
        }));

        // Refresh debt summary
        await refreshDebts();
      } else {
        console.warn('useDebts: createDebt returned no data but no error');
      }

      return response.data;
    } catch (error) {
      console.error('useDebts: Error adding debt:', error);
      
      // Check if this is a connection error
      const isConnError = error instanceof Error && isConnectionError(error);
      
      setState(prev => ({
        ...prev,
        connectionError: isConnError,
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
      console.log('useDebts: Updating debt', { debtId, updates });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      const response = await debtService.updateDebt(debtId, updates);

      if (response.error) {
        console.error('useDebts: Error in updateDebt response', response.error);
        
        // Check if this is a connection error
        const connError = isConnectionError(response.error);
        
        setState(prev => ({
          ...prev,
          connectionError: connError,
          error: response.error
        }));
        
        throw response.error;
      }

      if (response.data) {
        console.log('useDebts: Successfully updated debt', { debtId });
        
        // Update the local state with the updated debt
        setState(prev => ({
          ...prev,
          debts: prev.debts.map(debt => 
            debt.id === debtId ? response.data! : debt
          ),
        }));

        // Refresh debt summary
        await refreshDebts();
      } else {
        console.warn('useDebts: updateDebt returned no data but no error');
      }

      return response.data;
    } catch (error) {
      console.error('useDebts: Error updating debt:', error);
      
      // Check if this is a connection error
      const isConnError = error instanceof Error && isConnectionError(error);
      
      setState(prev => ({
        ...prev,
        connectionError: isConnError,
        error: error instanceof Error ? error : new Error('Failed to update debt'),
      }));
      return null;
    }
  }, [refreshDebts]);

  // Delete a debt
  const deleteDebt = useCallback(async (debtId: string): Promise<boolean> => {
    try {
      console.log('useDebts: Deleting debt', { debtId });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      const response = await debtService.deleteDebt(debtId);

      if (response.error) {
        console.error('useDebts: Error in deleteDebt response', response.error);
        
        // Check if this is a connection error
        const connError = isConnectionError(response.error);
        
        setState(prev => ({
          ...prev,
          connectionError: connError,
          error: response.error
        }));
        
        throw response.error;
      }

      console.log('useDebts: Successfully deleted debt', { debtId });
      
      // Remove the debt from local state
      setState(prev => ({
        ...prev,
        debts: prev.debts.filter(debt => debt.id !== debtId),
      }));

      // Refresh debt summary
      await refreshDebts();
      
      return true;
    } catch (error) {
      console.error('useDebts: Error deleting debt:', error);
      
      // Check if this is a connection error
      const isConnError = error instanceof Error && isConnectionError(error);
      
      setState(prev => ({
        ...prev,
        connectionError: isConnError,
        error: error instanceof Error ? error : new Error('Failed to delete debt'),
      }));
      return false;
    }
  }, [refreshDebts]);

  // Get a single debt by ID
  const getDebtById = useCallback(async (debtId: string): Promise<Debt | null> => {
    try {
      console.log('useDebts: Fetching debt by ID', { debtId });
      
      // Reset any previous errors
      setState(prev => ({ ...prev, error: null, connectionError: false }));
      
      const response = await debtService.fetchDebtById(debtId);

      if (response.error) {
        console.error('useDebts: Error in fetchDebtById response', response.error);
        
        // Check if this is a connection error
        const connError = isConnectionError(response.error);
        
        setState(prev => ({
          ...prev,
          connectionError: connError,
          error: response.error
        }));
        
        throw response.error;
      }

      console.log('useDebts: Successfully fetched debt by ID', { 
        debtId, 
        found: !!response.data 
      });
      
      return response.data;
    } catch (error) {
      console.error('useDebts: Error fetching debt by ID:', error);
      
      // Check if this is a connection error
      const isConnError = error instanceof Error && isConnectionError(error);
      
      setState(prev => ({
        ...prev,
        connectionError: isConnError,
        error: error instanceof Error ? error : new Error('Failed to fetch debt'),
      }));
      return null;
    }
  }, []);

  // Load debts on mount or when user changes
  useEffect(() => {
    console.log('useDebts: User ID changed or component mounted, refreshing debts', { 
      userExists: !!user,
      userId: user?.id
    });
    refreshDebts();
  }, [refreshDebts]);

  return {
    ...state,
    refreshDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    getDebtById,
    resetErrors
  };
} 