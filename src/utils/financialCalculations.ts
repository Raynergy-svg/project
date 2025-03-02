import { SpendingCategory, IncomeSource, Transaction } from '@/types/financialTypes';

/**
 * Calculate the total income from multiple income sources
 * @param incomeSources - Array of income sources
 * @returns Total income amount
 */
export const calculateTotalIncome = (incomeSources: IncomeSource[]): number => {
  return incomeSources.reduce((sum, source) => sum + source.amount, 0);
};

/**
 * Calculate the total expenses from spending categories
 * @param spendingCategories - Array of spending categories
 * @returns Total expenses amount
 */
export const calculateTotalExpenses = (spendingCategories: SpendingCategory[]): number => {
  return spendingCategories.reduce((sum, category) => sum + category.value, 0);
};

/**
 * Calculate net cash flow (income - expenses)
 * @param totalIncome - Total income amount
 * @param totalExpenses - Total expenses amount
 * @returns Net cash flow amount
 */
export const calculateNetCashFlow = (totalIncome: number, totalExpenses: number): number => {
  return totalIncome - totalExpenses;
};

/**
 * Calculate savings rate as a percentage of income
 * @param netCashFlow - Net cash flow amount
 * @param totalIncome - Total income amount
 * @returns Savings rate as a decimal (0.1 = 10%)
 */
export const calculateSavingsRate = (netCashFlow: number, totalIncome: number): number => {
  return totalIncome > 0 ? netCashFlow / totalIncome : 0;
};

/**
 * Calculate the average daily spend based on total expenses and days
 * @param totalExpenses - Total expenses for the period
 * @param days - Number of days in the period
 * @returns Average daily spend
 */
export const calculateAverageDailySpend = (totalExpenses: number, days: number = 30): number => {
  return totalExpenses / days;
};

/**
 * Group transactions by category
 * @param transactions - Array of transactions
 * @returns Object with category names as keys and total amounts as values
 */
export const groupTransactionsByCategory = (transactions: Transaction[]): Record<string, number> => {
  return transactions.reduce((groups, transaction) => {
    const { category, amount } = transaction;
    groups[category] = (groups[category] || 0) + amount;
    return groups;
  }, {} as Record<string, number>);
};

/**
 * Filter transactions by date range
 * @param transactions - Array of transactions
 * @param daysAgo - Number of days to look back
 * @returns Filtered array of transactions
 */
export const filterTransactionsByDate = (
  transactions: Transaction[],
  daysAgo: number
): Transaction[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= cutoffDate;
  });
};

/**
 * Sort spending categories by value
 * @param categories - Array of spending categories
 * @param ascending - Whether to sort in ascending order
 * @returns Sorted array of categories
 */
export const sortCategoriesByValue = (
  categories: SpendingCategory[],
  ascending: boolean = false
): SpendingCategory[] => {
  return [...categories].sort((a, b) => {
    return ascending ? a.value - b.value : b.value - a.value;
  });
}; 