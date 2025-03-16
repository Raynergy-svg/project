'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BankConnectionService } from '@/services/bankConnection';
import type { Account, Transaction, DashboardData, BankAccount } from '@/types';
import { createMockDashboardData } from '@/lib/mockDashboardData';
import { supabase } from '@/utils/supabase/client';
import { useBankConnection } from './useBankConnection';

// Create stable service instance
const bankService = BankConnectionService.getInstance();

// Export interfaces for type safety
export interface BankConnection {
  id: string;
  name: string;
  logoUrl?: string;
  lastSynced?: Date;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  accountCount: number;
}

export interface NextPayment {
  dueDate: Date;
  amount: number;
  payeeName: string;
  category: string;
}

export interface DashboardState {
  totalDebt: number;
  monthlyPayment: number;
  monthlyChange: number;
  nextPayment?: {
    dueDate: string;
    amount: number;
    payeeName: string;
    category: string;
  };
  debts: DebtAccount[];
  bankConnections: {
    id: string;
    institutionName: string;
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      balance: number;
      lastUpdated: string;
    }>;
    status: 'connected' | 'disconnected' | 'error' | 'syncing';
  }[];
  payoffStrategies: Array<{
    id: string;
    name: string;
    description: string;
    monthsToPayoff: number;
    interestSaved: number;
    monthlyPayment: number;
    projectedPayoffDate?: Date;
    totalInterestPaid?: number;
    projectionData?: Array<{
      month: number;
      balance: number;
    }>;
    recommendedExtraPayment?: number;
    bestDebtToTarget?: {
      id: string;
      name: string;
      category: string;
      reason: string;
    };
  }>;
}

export interface DebtAccount {
  id: string;
  name: string;
  category: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
  lender?: string;
  paymentFrequency?: string;
}

export function useDashboard() {
  const { user } = useAuth();
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use mock data instead of connecting to real services
        const mockData = createMockDashboardData();
        
        // Add a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setDashboardState(mockData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);
  
  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Use mock data for refreshing too
      const mockData = createMockDashboardData();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardState(mockData);
      return mockData;
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data. Please try again later.');
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  }, []);
  
  return {
    dashboardState,
    isLoading,
    isRefreshing,
    error,
    refreshDashboard
  };
} 