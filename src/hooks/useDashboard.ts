'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BankConnectionService } from '@/services/bankConnection';
import type { Account, Transaction, DashboardData, BankAccount } from '@/types';
import { createMockDashboardData } from '@/lib/mockDashboardData';
import { supabase } from '@/utils/supabase/client';
import { useBankConnection } from './useBankConnection';

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
    projectedPayoffDate: Date;
    monthlyPayment: number;
    totalInterestPaid: number;
    projectionData: Array<{
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
    creditScoreImpact?: {
      current: number;
      potential: number;
      changeDescription: string;
    };
  }>;
  lastUpdated?: Date;
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

const DASHBOARD_CACHE_KEY = 'dashboard_cache';

export function useDashboard() {
  const { user } = useAuth();
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<Date | null>(null);
  
  // Initialize bank service without storing it
  const bankService = BankConnectionService.getInstance();
  
  // Function to load data from local storage cache
  const loadFromCache = useCallback(() => {
    try {
      if (typeof window === 'undefined') return null;
      
      const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!cachedData) return null;
      
      const parsed = JSON.parse(cachedData);
      
      // Validate cache - only use if less than 5 minutes old
      const cacheTime = new Date(parsed.timestamp || 0);
      const now = new Date();
      const cacheAge = now.getTime() - cacheTime.getTime();
      const maxCacheAge = 5 * 60 * 1000; // 5 minutes
      
      if (cacheAge > maxCacheAge) {
        console.log('Dashboard cache expired, fetching fresh data');
        return null;
      }
      
      console.log('Using cached dashboard data from', cacheTime.toLocaleTimeString());
      return parsed.data;
    } catch (err) {
      console.warn('Error loading dashboard cache:', err);
      return null;
    }
  }, []);
  
  // Function to save data to local storage cache
  const saveToCache = useCallback((data: DashboardState) => {
    try {
      if (typeof window === 'undefined') return;
      
      const cacheData = {
        data,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Error saving dashboard cache:', err);
    }
  }, []);
  
  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First check cache
        const cachedData = loadFromCache();
        if (cachedData) {
          setDashboardState(cachedData);
          setIsLoading(false);
          
          // Still fetch fresh data in the background if cache is more than 1 minute old
          const cacheTime = new Date(cachedData.lastUpdated || 0);
          const now = new Date();
          const cacheAge = now.getTime() - cacheTime.getTime();
          if (cacheAge > 60 * 1000) {
            // Silent background refresh
            setTimeout(() => refreshDashboard(true), 100);
          }
          return;
        }
        
        // Use mock data instead of connecting to real services
        const mockData = createMockDashboardData();
        
        // Add a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Add timestamp
        mockData.lastUpdated = new Date();
        
        // Save to cache
        saveToCache(mockData);
        setDashboardState(mockData);
        lastFetchRef.current = new Date();
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user, loadFromCache, saveToCache]);
  
  // Refresh dashboard data
  const refreshDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsRefreshing(true);
        setError(null);
      }
      
      // Throttle refreshes - prevent more than one refresh per 30 seconds
      const now = new Date();
      const lastFetch = lastFetchRef.current;
      if (lastFetch && (now.getTime() - lastFetch.getTime() < 30 * 1000)) {
        console.log('Throttling dashboard refresh - last fetch was less than 30 seconds ago');
        if (!silent) {
          setIsRefreshing(false);
        }
        return dashboardState;
      }
      
      // Use mock data for refreshing too
      const mockData = createMockDashboardData();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add timestamp
      mockData.lastUpdated = new Date();
      
      // Save to cache
      saveToCache(mockData);
      setDashboardState(mockData);
      lastFetchRef.current = new Date();
      
      return mockData;
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      if (!silent) {
        setError('Failed to refresh dashboard data. Please try again later.');
      }
      throw err;
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }, [dashboardState, saveToCache]);
  
  return {
    dashboardState,
    isLoading,
    isRefreshing,
    error,
    refreshDashboard,
    lastUpdated: dashboardState?.lastUpdated
  };
} 