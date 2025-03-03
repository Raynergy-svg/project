import React, { useState, useMemo } from 'react';
import { ArrowRight, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Transaction, DateFilterOption, SortConfig } from '@/types/financialTypes';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { filterTransactionsByDate } from '@/utils/financialCalculations';
import EmptyState from './EmptyState';

interface TransactionsTabProps {
  transactions: Transaction[];
  onViewAll?: () => void;
  className?: string;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  onViewAll,
  className = '',
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('7days');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  // Memoize filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    // First filter by date
    let results = transactions;
    
    if (dateFilter === '7days') {
      results = filterTransactionsByDate(results, 7);
    } else if (dateFilter === '30days') {
      results = filterTransactionsByDate(results, 30);
    } else if (dateFilter === '90days') {
      results = filterTransactionsByDate(results, 90);
    }
    
    // Then filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(transaction => 
        transaction.name.toLowerCase().includes(term) || 
        transaction.category.toLowerCase().includes(term) ||
        transaction.account.toLowerCase().includes(term)
      );
    }
    
    // Sort results
    return [...results].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Transaction];
      const bValue = b[sortConfig.key as keyof Transaction];
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
        
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [transactions, dateFilter, searchTerm, sortConfig]);

  // Handle sort click
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort indicator
  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // If no transactions
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ArrowRight className="h-10 w-10" />}
        message="No transactions found for this period"
        actionText="Connect an account"
        onAction={() => console.log('Connect account')}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {showSearchInput ? (
              <div className="relative">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transactions..."
                  className="h-7 w-48 text-xs bg-white/5 border-white/10 placeholder:text-white/40"
                  autoFocus
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchInput(false);
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearchInput(true)}
                className="gap-1 text-xs h-7 px-2 bg-white/5 text-white/70 border-white/10"
                aria-label="Search transactions"
              >
                <Search className="w-3 h-3" /> Search
              </Button>
            )}
          </div>
          
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-7 px-2 bg-white/5 text-white/70 border-white/10"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <Filter className="w-3 h-3" /> 
              {dateFilter === '7days' && 'Last 7 days'}
              {dateFilter === '30days' && 'Last 30 days'}
              {dateFilter === '90days' && 'Last 90 days'}
            </Button>
            
            <div className="absolute right-0 mt-1 hidden group-hover:block z-10 bg-gray-800 border border-white/10 rounded-md shadow-lg py-1 min-w-[120px]">
              <button 
                className={`block w-full text-left px-4 py-1 text-sm ${dateFilter === '7days' ? 'text-[#88B04B]' : 'text-white/70'} hover:bg-white/5`}
                onClick={() => setDateFilter('7days')}
              >
                Last 7 days
              </button>
              <button 
                className={`block w-full text-left px-4 py-1 text-sm ${dateFilter === '30days' ? 'text-[#88B04B]' : 'text-white/70'} hover:bg-white/5`}
                onClick={() => setDateFilter('30days')}
              >
                Last 30 days
              </button>
              <button 
                className={`block w-full text-left px-4 py-1 text-sm ${dateFilter === '90days' ? 'text-[#88B04B]' : 'text-white/70'} hover:bg-white/5`}
                onClick={() => setDateFilter('90days')}
              >
                Last 90 days
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Recent transactions">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white/70 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date{getSortIndicator('date')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white/70 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Merchant{getSortIndicator('name')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white/70 cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  Category{getSortIndicator('category')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white/70 cursor-pointer"
                  onClick={() => handleSort('account')}
                >
                  Account{getSortIndicator('account')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-white/70 cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  Amount{getSortIndicator('amount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-white/5 hover:bg-white/5"
                    tabIndex={0}
                  >
                    <td className="px-4 py-3 text-sm text-white/80">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3 text-sm text-white">{transaction.name}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-white/10 text-white/80 font-normal">
                        {transaction.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">{transaction.account}</td>
                    <td className="px-4 py-3 text-sm text-white text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/60">
                    No transactions found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {onViewAll && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="gap-1 bg-white/5 text-white hover:bg-white/10 border-white/20"
          >
            View All Transactions <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab; 