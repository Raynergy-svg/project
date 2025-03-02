/**
 * Interface for transaction data
 */
export interface Transaction {
  id: number | string;
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
}

/**
 * Interface for spending categories
 */
export interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

/**
 * Interface for income sources
 */
export interface IncomeSource {
  source: string;
  amount: number;
}

/**
 * Type for date filter options
 */
export type DateFilterOption = '7days' | '30days' | '90days' | 'custom';

/**
 * Interface for chart tooltip props
 */
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: SpendingCategory;
  }>;
  totalValue?: number;
}

/**
 * Interface for transaction filter options
 */
export interface TransactionFilters {
  dateRange: DateFilterOption;
  categories: string[];
  accounts: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  searchTerm: string;
}

/**
 * Interface for sorting configuration
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Type for transaction tabs
 */
export type TransactionTab = 'spending' | 'cashflow' | 'transactions';

/**
 * Interface for currency display options
 */
export interface CurrencyOptions {
  locale: string;
  currency: string;
  decimalPlaces: number;
} 