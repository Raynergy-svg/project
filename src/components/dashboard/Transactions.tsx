import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Transaction, SpendingCategory, IncomeSource, TransactionTab } from '@/types/financialTypes';
import { sampleTransactions, sampleSpendingCategories, sampleIncomeSources } from '@/data/sampleFinancialData';

// Import subcomponents
import HeaderSection from './transactions/HeaderSection';
import SpendingTab from './transactions/SpendingTab';
import CashFlowTab from './transactions/CashFlowTab';
import TransactionsTab from './transactions/TransactionsTab';
import LoadingState from './transactions/LoadingState';
import ErrorState from './transactions/ErrorState';

export interface TransactionsProps {
  className?: string;
  transactions?: Transaction[];
  spendingCategories?: SpendingCategory[];
  incomeSources?: IncomeSource[];
  connectedAccountsCount?: number;
  initialTab?: TransactionTab;
  onViewAllTransactions?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function Transactions({ 
  className,
  transactions = sampleTransactions,
  spendingCategories = sampleSpendingCategories,
  incomeSources = sampleIncomeSources,
  connectedAccountsCount = 3,
  initialTab = 'spending',
  onViewAllTransactions,
  isLoading = false,
  error = null,
  onRetry
}: TransactionsProps) {
  const [activeTab, setActiveTab] = useState<TransactionTab>(initialTab);

  // Reset to initial tab when it changes externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TransactionTab);
  };

  // If loading
  if (isLoading) {
    return <LoadingState className={className} />;
  }

  // If error
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} className={className} />;
  }

  return (
    <Card className={cn("rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm", className)}>
      <HeaderSection 
        title="Transactions" 
        connectedAccountsCount={connectedAccountsCount} 
      />
      
      <div className="p-5">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="bg-white/5 border border-white/10 mb-5">
            <TabsTrigger 
              value="spending" 
              className="data-[state=active]:bg-[#88B04B]/20 data-[state=active]:text-[#88B04B]"
              aria-label="View spending breakdown"
            >
              Spending
            </TabsTrigger>
            <TabsTrigger 
              value="cashflow" 
              className="data-[state=active]:bg-[#88B04B]/20 data-[state=active]:text-[#88B04B]"
              aria-label="View cash flow analysis"
            >
              Cash Flow
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-[#88B04B]/20 data-[state=active]:text-[#88B04B]"
              aria-label="View recent transactions"
            >
              Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="spending" className="mt-0">
            <SpendingTab spendingCategories={spendingCategories} />
          </TabsContent>
          
          <TabsContent value="cashflow" className="mt-0">
            <CashFlowTab 
              incomeSources={incomeSources} 
              spendingCategories={spendingCategories} 
            />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-0">
            <TransactionsTab 
              transactions={transactions} 
              onViewAll={onViewAllTransactions} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
} 