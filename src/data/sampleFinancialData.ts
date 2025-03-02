import { Transaction, SpendingCategory, IncomeSource } from '@/types/financialTypes';

/**
 * Sample transaction data
 */
export const sampleTransactions: Transaction[] = [
  { id: 1, date: '2023-06-15', name: 'Grocery Store', category: 'Groceries', amount: 78.35, account: 'Bank of America' },
  { id: 2, date: '2023-06-14', name: 'Amazon', category: 'Shopping', amount: 54.99, account: 'Chase Credit' },
  { id: 3, date: '2023-06-13', name: 'Gas Station', category: 'Transportation', amount: 45.20, account: 'Wells Fargo' },
  { id: 4, date: '2023-06-12', name: 'Netflix', category: 'Entertainment', amount: 14.99, account: 'Bank of America' },
  { id: 5, date: '2023-06-11', name: 'Starbucks', category: 'Food & Dining', amount: 6.75, account: 'Chase Credit' },
  { id: 6, date: '2023-06-10', name: 'Rent Payment', category: 'Housing', amount: 1500.00, account: 'Bank of America' },
  { id: 7, date: '2023-06-09', name: 'Mobile Phone', category: 'Bills & Utilities', amount: 85.00, account: 'Wells Fargo' },
  { id: 8, date: '2023-06-08', name: 'Pharmacy', category: 'Health', amount: 32.50, account: 'Chase Credit' },
  { id: 9, date: '2023-06-07', name: 'Gym Membership', category: 'Health', amount: 49.99, account: 'Bank of America' },
  { id: 10, date: '2023-06-06', name: 'Restaurant', category: 'Food & Dining', amount: 65.80, account: 'Chase Credit' },
  { id: 11, date: '2023-06-05', name: 'Uber', category: 'Transportation', amount: 22.15, account: 'Wells Fargo' },
  { id: 12, date: '2023-06-04', name: 'Electric Bill', category: 'Bills & Utilities', amount: 94.32, account: 'Bank of America' },
  { id: 13, date: '2023-06-03', name: 'Target', category: 'Shopping', amount: 103.45, account: 'Chase Credit' },
  { id: 14, date: '2023-06-02', name: 'Spotify', category: 'Entertainment', amount: 9.99, account: 'Wells Fargo' },
  { id: 15, date: '2023-06-01', name: 'Car Insurance', category: 'Insurance', amount: 112.50, account: 'Bank of America' },
];

/**
 * Sample spending categories data
 */
export const sampleSpendingCategories: SpendingCategory[] = [
  { name: 'Housing', value: 1650, color: '#FF8042' },
  { name: 'Food & Dining', value: 480, color: '#00C49F' },
  { name: 'Transportation', value: 320, color: '#FFBB28' },
  { name: 'Entertainment', value: 180, color: '#0088FE' },
  { name: 'Shopping', value: 250, color: '#8884d8' },
  { name: 'Bills & Utilities', value: 420, color: '#FF5294' },
  { name: 'Health', value: 140, color: '#4BC0C0' },
  { name: 'Travel', value: 120, color: '#A28AFA' },
  { name: 'Insurance', value: 210, color: '#82ca9d' },
  { name: 'Education', value: 95, color: '#ffc658' },
];

/**
 * Sample income sources data
 */
export const sampleIncomeSources: IncomeSource[] = [
  { source: 'Primary Job', amount: 4200 },
  { source: 'Side Hustle', amount: 800 },
  { source: 'Investments', amount: 350 },
  { source: 'Rental Income', amount: 1200 },
];

/**
 * Category icons mapping
 */
export const categoryIconsMapping = {
  'Housing': 'Home',
  'Food & Dining': 'Utensils',
  'Transportation': 'Car',
  'Entertainment': 'Smartphone',
  'Shopping': 'ShoppingBag',
  'Bills & Utilities': 'CreditCard',
  'Health': 'HeartPulse',
  'Travel': 'Plane',
  'Insurance': 'Shield',
  'Education': 'GraduationCap',
  'Gifts': 'Gift',
  'Groceries': 'ShoppingCart',
  'Other': 'DollarSign',
}; 