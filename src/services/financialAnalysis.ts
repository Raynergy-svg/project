import { BankAccount, Transaction } from './bankConnection';
import { MOCK_FINANCIAL_PROFILE } from '@/utils/mockData';

export interface DebtInfo {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  category: 'Credit Card' | 'Student Loan' | 'Auto Loan' | 'Mortgage' | 'Personal Loan' | 'Medical Debt' | 'Other';
}

export interface BudgetCategory {
  name: string;
  amount: number;
  limit: number;
  allocated: number;
  spent: number;
  color: string;
}

export interface MonthlySpending {
  month: string;
  amount: number;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'achievement' | 'warning';
  potentialSavings?: number;
  confidence: number;
}

export interface FinancialProfile {
  totalDebt: number;
  monthlyPayment: number;
  interestPaid: number;
  debtFreeDate: string;
  monthlyChange: number;
  debtToIncomeRatio: number;
  aiOptimizationScore: number;
  debtBreakdown: DebtInfo[];
  savingsOpportunities: number;
  paymentHistory: MonthlySpending[];
  projectedPayoff: MonthlySpending[];
  insights: FinancialInsight[];
  isAIEnabled: boolean;
  budgetCategories: BudgetCategory[];
  monthlySpending: MonthlySpending[];
  monthlyIncome: number;
  creditScore: number;
  totalBudget: number;
  totalSpent: number;
}

export class FinancialAnalysisService {
  private static instance: FinancialAnalysisService;

  private constructor() {}

  public static getInstance(): FinancialAnalysisService {
    if (!FinancialAnalysisService.instance) {
      FinancialAnalysisService.instance = new FinancialAnalysisService();
    }
    return FinancialAnalysisService.instance;
  }

  // Generate a complete financial profile from bank data
  public async generateFinancialProfile(
    userId: string,
    transactions: Transaction[] = []
  ): Promise<FinancialProfile> {
    try {
      console.log(`Generating financial profile for user ${userId} with ${transactions.length} transactions`);
      
      // If no transactions, return a minimal profile to avoid errors
      if (transactions.length === 0) {
        console.log('No transactions available. Returning minimal profile.');
        
        // Create a future date for debt-free date (30 days from now)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const debtFreeDate = futureDate.toISOString().split('T')[0];
        
        return {
          totalDebt: 0,
          monthlyPayment: 0,
          interestPaid: 0,
          debtFreeDate,
          monthlyChange: 0,
          debtToIncomeRatio: 0,
          aiOptimizationScore: 50,
          debtBreakdown: [],
          savingsOpportunities: 0,
          paymentHistory: [],
          projectedPayoff: [],
          insights: [
            {
              id: 'no-data',
              title: 'No Financial Data Available',
              description: 'Connect your bank accounts to see personalized financial insights.',
              type: 'warning',
              confidence: 100
            }
          ],
          isAIEnabled: false,
          budgetCategories: [],
          monthlySpending: [],
          monthlyIncome: 0,
          creditScore: 700,
          totalBudget: 0,
          totalSpent: 0
        };
      }
      
      // For development, create dummy accounts from transactions
      const accounts: BankAccount[] = this.createAccountsFromTransactions(transactions);
      
      // Extract all debts from accounts (credit, loan, mortgage types)
      const debts = this.extractDebts(accounts);
      
      // Calculate monthly income (recurring deposits)
      const monthlyIncome = this.calculateMonthlyIncome(transactions);
      
      // Generate budget categories
      const budgetCategories = this.generateBudgetCategories(transactions);
      
      // Calculate debt metrics
      const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
      const monthlyPayment = this.calculateMonthlyPayment(debts);
      const interestPaid = this.calculateInterestPaid(debts);
      const debtFreeDate = this.calculateDebtFreeDate(debts, monthlyPayment);
      
      // Calculate spending metrics
      const monthlySpending = this.calculateMonthlySpending(transactions);
      const spendingBreakdown = this.calculateSpendingBreakdown(transactions);
      
      // Calculate savings metrics
      const savedLastMonth = this.calculateSavedLastMonth(transactions);
      const projectedSavings = this.calculateProjectedSavings(savedLastMonth, 12);
      
      const profile: FinancialProfile = {
        totalDebt,
        monthlyPayment,
        interestPaid,
        debtFreeDate,
        monthlyChange: this.calculateMonthlyDebtChange(transactions),
        debtToIncomeRatio: monthlyIncome > 0 ? totalDebt / (monthlyIncome * 12) : 0,
        aiOptimizationScore: this.calculateOptimizationScore(
          debts, 
          totalDebt / (monthlyIncome * 12), 
          monthlyIncome,
          monthlySpending
        ),
        debtBreakdown: debts,
        savingsOpportunities: savedLastMonth > 0 ? savedLastMonth : 0,
        paymentHistory: this.generatePaymentHistory(transactions, debts),
        projectedPayoff: this.generateProjectedPayoff(totalDebt, monthlyPayment),
        insights: this.generateInsights(
          transactions,
          monthlyIncome,
          monthlySpending,
          savedLastMonth,
          debts,
          budgetCategories
        ),
        isAIEnabled: true,
        budgetCategories,
        monthlySpending,
        monthlyIncome,
        creditScore: this.estimateCreditScore(debts, transactions),
        totalBudget: this.calculateTotalBudget(budgetCategories),
        totalSpent: this.calculateTotalSpent(transactions)
      };
      
      return profile;
    } catch (error) {
      console.error('Error generating financial profile:', error);
      
      // Create a future date for debt-free date (30 days from now)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const debtFreeDate = futureDate.toISOString().split('T')[0];
      
      // Return a minimal profile to avoid breaking the UI
      return {
        totalDebt: 0,
        monthlyPayment: 0,
        interestPaid: 0,
        debtFreeDate,
        monthlyChange: 0,
        debtToIncomeRatio: 0,
        aiOptimizationScore: 50,
        debtBreakdown: [],
        savingsOpportunities: 0,
        paymentHistory: [],
        projectedPayoff: [],
        insights: [
          {
            id: 'error-recovery',
            title: 'Dashboard Data Issue',
            description: 'We encountered an issue loading your financial data. This might be due to a temporary service disruption or missing data.',
            type: 'warning',
            confidence: 100
          }
        ],
        isAIEnabled: false,
        budgetCategories: [],
        monthlySpending: [],
        monthlyIncome: 0,
        creditScore: 700,
        totalBudget: 0,
        totalSpent: 0
      };
    }
  }

  // Extract debt accounts from bank accounts
  private extractDebts(accounts: BankAccount[]): DebtInfo[] {
    const debtAccounts = accounts.filter(account => 
      account.type === 'credit' || 
      account.type === 'loan' || 
      account.type === 'mortgage'
    );

    return debtAccounts.map((account, index) => {
      // Map account types to debt categories
      let category: DebtInfo['category'] = 'Other';
      let interestRate = 0;
      let minimumPayment = 0;

      if (account.type === 'credit') {
        category = 'Credit Card';
        interestRate = 19.99; // Estimated interest rate
        minimumPayment = Math.max(25, Math.abs(account.balance) * 0.03); // Minimum 3% of balance
      } else if (account.type === 'loan') {
        category = 'Personal Loan';
        interestRate = 8.5; // Estimated interest rate
        minimumPayment = Math.abs(account.balance) * 0.02; // Estimated monthly payment
      } else if (account.type === 'mortgage') {
        category = 'Mortgage';
        interestRate = 4.5; // Estimated interest rate
        minimumPayment = Math.abs(account.balance) * 0.005; // Estimated monthly payment
      }

      return {
        id: account.id,
        name: account.name,
        amount: Math.abs(account.balance), // Convert negative balance to positive debt amount
        interestRate,
        minimumPayment,
        category
      };
    });
  }

  // Calculate monthly income from transactions
  private calculateMonthlyIncome(transactions: Transaction[]): number {
    const incomeTransactions = transactions.filter(t => t.isIncome);
    
    // If we have less than 30 days of data, estimate monthly income
    if (transactions.length === 0) return 0;
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Get date range of transactions
    const dates = transactions.map(t => new Date(t.date).getTime());
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    
    const daysDifference = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDifference < 25) {
      // Extrapolate to a month
      return (totalIncome / daysDifference) * 30;
    }
    
    return totalIncome;
  }

  // Calculate monthly spending by category
  private calculateMonthlySpending(transactions: Transaction[]): MonthlySpending[] {
    if (transactions.length === 0) return [];
    
    // Group transactions by month
    const spendingByMonth = new Map<string, number>();
    
    transactions.forEach(transaction => {
      if (transaction.isIncome) return; // Skip income transactions
      
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const currentAmount = spendingByMonth.get(monthName) || 0;
      spendingByMonth.set(monthName, currentAmount + Math.abs(transaction.amount));
    });
    
    // Convert map to array
    return Array.from(spendingByMonth.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  // Generate budget categories from transactions
  private generateBudgetCategories(transactions: Transaction[]): BudgetCategory[] {
    if (transactions.length === 0) return [];
    
    // Group transactions by category
    const spendingByCategory = new Map<string, number>();
    
    transactions.forEach(transaction => {
      if (transaction.isIncome) return; // Skip income transactions
      
      const category = transaction.category || 'Uncategorized';
      const currentAmount = spendingByCategory.get(category) || 0;
      spendingByCategory.set(category, currentAmount + Math.abs(transaction.amount));
    });
    
    // Define colors for categories
    const categoryColors: Record<string, string> = {
      'Housing': '#4F46E5',
      'Transportation': '#10B981',
      'Food': '#F59E0B',
      'Utilities': '#3B82F6',
      'Healthcare': '#EC4899',
      'Entertainment': '#8B5CF6',
      'Shopping': '#EF4444',
      'Personal': '#14B8A6',
      'Debt Payments': '#F97316',
      'Savings': '#84CC16',
      'Uncategorized': '#6B7280'
    };
    
    // Convert map to array and add budget limits
    return Array.from(spendingByCategory.entries()).map(([name, spent]) => {
      // Set a reasonable budget limit based on spending
      const allocated = Math.ceil(spent * 1.1 / 100) * 100; // Round up to nearest 100
      
      return {
        name,
        amount: spent,
        limit: allocated,
        allocated,
        spent,
        color: categoryColors[name] || '#6B7280'
      };
    });
  }

  // Calculate interest paid on debts
  private calculateInterestPaid(debts: DebtInfo[]): number {
    // In a real implementation, this would analyze transaction history
    // For now, estimate based on debt amounts and interest rates
    return debts.reduce((sum, debt) => {
      const monthlyInterest = (debt.amount * (debt.interestRate / 100)) / 12;
      return sum + monthlyInterest;
    }, 0);
  }

  // Calculate projected debt-free date
  private calculateDebtFreeDate(debts: DebtInfo[], monthlyPayment: number): string {
    if (debts.length === 0 || monthlyPayment <= 0) {
      return 'N/A';
    }
    
    // Simple calculation assuming constant payment and no additional interest
    const monthsToPayoff = Math.ceil(debts.reduce((sum, debt) => sum + debt.amount, 0) / monthlyPayment);
    
    const today = new Date();
    today.setMonth(today.getMonth() + monthsToPayoff);
    
    return today.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // Calculate monthly change in debt
  private calculateMonthlyDebtChange(transactions: Transaction[]): number {
    // In a real implementation, this would analyze transaction history
    // For now, return a reasonable estimate
    const debtPayments = transactions.filter(t => 
      !t.isIncome && 
      (t.category === 'Debt Payments' || t.description.toLowerCase().includes('payment'))
    );
    
    return -debtPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  // Calculate AI optimization score
  private calculateOptimizationScore(
    debts: DebtInfo[], 
    debtToIncomeRatio: number, 
    monthlyIncome: number,
    monthlySpending: MonthlySpending[]
  ): number {
    // Start with a base score
    let score = 50;
    
    // Adjust based on debt-to-income ratio (lower is better)
    if (debtToIncomeRatio < 0.1) score += 20;
    else if (debtToIncomeRatio < 0.2) score += 15;
    else if (debtToIncomeRatio < 0.3) score += 10;
    else if (debtToIncomeRatio < 0.4) score += 5;
    else if (debtToIncomeRatio > 0.5) score -= 10;
    
    // Adjust based on high-interest debt
    const highInterestDebt = debts.filter(d => d.interestRate > 15);
    if (highInterestDebt.length === 0) score += 10;
    else score -= Math.min(15, highInterestDebt.length * 5);
    
    // Adjust based on income vs spending
    const totalMonthlySpending = monthlySpending.reduce((sum, month) => sum + month.amount, 0);
    const monthCount = Math.max(1, monthlySpending.length);
    const avgMonthlySpending = totalMonthlySpending / monthCount;
    
    if (monthlyIncome > avgMonthlySpending * 1.5) score += 15;
    else if (monthlyIncome > avgMonthlySpending * 1.2) score += 10;
    else if (monthlyIncome > avgMonthlySpending) score += 5;
    else score -= 10;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  // Generate financial insights
  private generateInsights(
    transactions: Transaction[],
    monthlyIncome: number,
    monthlySpending: MonthlySpending[],
    savedLastMonth: number,
    debts: DebtInfo[],
    budgetCategories: BudgetCategory[]
  ): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Check for high-interest debt
    const highInterestDebt = debts.find(d => d.interestRate > 18);
    if (highInterestDebt) {
      insights.push({
        id: 'insight_1',
        title: 'High Interest Debt Alert',
        description: `Your ${highInterestDebt.name} has a high interest rate of ${highInterestDebt.interestRate}%. Consider paying this off first or transferring to a lower-rate option.`,
        type: 'opportunity',
        potentialSavings: Math.round(highInterestDebt.amount * (highInterestDebt.interestRate - 10) / 100),
        confidence: 0.9
      });
    }
    
    // Check for debt consolidation opportunity
    if (debts.length > 1) {
      const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
      const avgInterestRate = debts.reduce((sum, debt) => sum + (debt.amount * debt.interestRate), 0) / totalDebt;
      
      if (avgInterestRate > 10) {
        insights.push({
          id: 'insight_2',
          title: 'Debt Consolidation Opportunity',
          description: `You could save by consolidating your ${debts.length} debts with an average rate of ${avgInterestRate.toFixed(1)}% to a personal loan with a lower rate.`,
          type: 'opportunity',
          potentialSavings: Math.round(totalDebt * (avgInterestRate - 8) / 100),
          confidence: 0.85
        });
      }
    }
    
    // Check for overspending in categories
    const overspentCategories = budgetCategories.filter(cat => cat.spent > cat.allocated);
    if (overspentCategories.length > 0) {
      insights.push({
        id: 'insight_3',
        title: 'Budget Alert',
        description: `You've exceeded your budget in ${overspentCategories.length} categories. The largest overspend is in ${overspentCategories[0].name}.`,
        type: 'warning',
        confidence: 0.95
      });
    }
    
    // Check for savings opportunity
    const foodCategory = budgetCategories.find(cat => cat.name === 'Food' || cat.name === 'Dining');
    if (foodCategory && foodCategory.spent > 500) {
      insights.push({
        id: 'insight_4',
        title: 'Dining Savings Opportunity',
        description: 'You could save approximately $200/month by reducing restaurant spending and cooking more meals at home.',
        type: 'opportunity',
        potentialSavings: 200,
        confidence: 0.8
      });
    }
    
    // Check for positive achievement
    const savingsTransactions = transactions.filter(t => 
      t.category === 'Savings' || 
      t.description.toLowerCase().includes('save') ||
      t.description.toLowerCase().includes('invest')
    );
    
    if (savingsTransactions.length > 0) {
      const totalSaved = savingsTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      if (totalSaved > 0) {
        insights.push({
          id: 'insight_5',
          title: 'Savings Achievement',
          description: `Great job! You've saved $${totalSaved.toFixed(0)} recently. Keep up the good work!`,
          type: 'achievement',
          confidence: 1.0
        });
      }
    }
    
    return insights;
  }

  // Get payment history from transactions
  private generatePaymentHistory(transactions: Transaction[], debts: DebtInfo[]): MonthlySpending[] {
    if (transactions.length === 0) return [];
    
    // Group debt payment transactions by month
    const paymentsByMonth = new Map<string, number>();
    
    const debtPayments = transactions.filter(t => 
      !t.isIncome && 
      (t.category === 'Debt Payments' || t.description.toLowerCase().includes('payment'))
    );
    
    debtPayments.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const currentAmount = paymentsByMonth.get(monthName) || 0;
      paymentsByMonth.set(monthName, currentAmount + Math.abs(transaction.amount));
    });
    
    // Convert map to array
    return Array.from(paymentsByMonth.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  // Generate projected payoff data
  private generateProjectedPayoff(totalDebt: number, monthlyPayment: number): MonthlySpending[] {
    if (totalDebt <= 0 || monthlyPayment <= 0) {
      return [];
    }
    
    const projections: MonthlySpending[] = [];
    let remainingDebt = totalDebt;
    const today = new Date();
    
    // Generate 12 months of projections
    for (let i = 0; i < 12; i++) {
      const projectionDate = new Date(today);
      projectionDate.setMonth(today.getMonth() + i);
      
      const monthName = projectionDate.toLocaleString('default', { month: 'short' });
      
      remainingDebt = Math.max(0, remainingDebt - monthlyPayment);
      
      projections.push({
        month: monthName,
        amount: Math.round(remainingDebt)
      });
      
      if (remainingDebt === 0) break;
    }
    
    return projections;
  }

  // Estimate credit score based on financial data
  private estimateCreditScore(debts: DebtInfo[], transactions: Transaction[]): number {
    // This is a simplified estimation - in reality, credit scores are complex
    // Start with a base score
    let score = 650;
    
    // Calculate credit utilization
    const creditCards = debts.filter(d => d.category === 'Credit Card');
    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.amount, 0);
    const assumedCreditLimit = totalCreditCardDebt * 3; // Assume credit limit is 3x current debt
    
    if (assumedCreditLimit > 0) {
      const utilization = totalCreditCardDebt / assumedCreditLimit;
      
      // Adjust score based on utilization (lower is better)
      if (utilization < 0.1) score += 50;
      else if (utilization < 0.3) score += 30;
      else if (utilization < 0.5) score += 10;
      else if (utilization > 0.7) score -= 30;
    }
    
    // Check for on-time payments
    const paymentTransactions = transactions.filter(t => 
      !t.isIncome && 
      (t.category === 'Debt Payments' || t.description.toLowerCase().includes('payment'))
    );
    
    if (paymentTransactions.length > 5) score += 20;
    else if (paymentTransactions.length > 0) score += 10;
    
    // Adjust based on debt diversity
    const debtCategories = new Set(debts.map(d => d.category));
    if (debtCategories.size >= 3) score += 20;
    else if (debtCategories.size >= 2) score += 10;
    
    // Ensure score is within valid range (300-850)
    return Math.max(300, Math.min(850, score));
  }

  private createAccountsFromTransactions(transactions: Transaction[]): BankAccount[] {
    // Group transactions by account ID
    const accountMap: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      if (!accountMap[transaction.accountId]) {
        accountMap[transaction.accountId] = [];
      }
      accountMap[transaction.accountId].push(transaction);
    });
    
    // Create accounts from transaction groups
    return Object.entries(accountMap).map(([accountId, txs]) => {
      // Determine if this is likely a credit account based on transactions
      const hasNegativeBalance = txs.some(tx => tx.amount < 0);
      const totalBalance = txs.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Try to determine account type from transaction patterns
      let type: BankAccount['type'];
      if (txs.some(tx => tx.description.toLowerCase().includes('mortgage') || 
                        tx.description.toLowerCase().includes('home loan'))) {
        type = 'mortgage';
      } else if (txs.some(tx => tx.description.toLowerCase().includes('auto') || 
                             tx.description.toLowerCase().includes('car loan'))) {
        type = 'loan';
      } else if (hasNegativeBalance || totalBalance < 0) {
        type = 'credit';
      } else {
        type = 'checking';
      }
      
      return {
        id: accountId,
        name: `Account ${accountId.substring(0, 4)}`,
        type,
        balance: totalBalance,
        availableBalance: totalBalance > 0 ? totalBalance : 0,
        currency: 'USD',
        lastUpdated: new Date(),
        institution: {
          id: 'unknown',
          name: 'Bank',
        }
      };
    });
  }

  private calculateMonthlyPayment(debts: DebtInfo[]): number {
    // Sum up all minimum payments for existing debts
    return debts.reduce((total, debt) => total + debt.minimumPayment, 0);
  }

  private calculateSpendingBreakdown(transactions: Transaction[]): Record<string, number> {
    // Group spending by category
    const breakdown: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only include spending (negative amounts)
        const category = transaction.category || 'Uncategorized';
        breakdown[category] = (breakdown[category] || 0) + Math.abs(transaction.amount);
      }
    });
    
    return breakdown;
  }

  private calculateSavedLastMonth(transactions: Transaction[]): number {
    // Get current date
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Filter transactions from last month
    const lastMonthTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= lastMonthStart && txDate <= lastMonthEnd;
    });
    
    // Calculate income and expenses
    const income = lastMonthTransactions
      .filter(t => t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = lastMonthTransactions
      .filter(t => !t.isIncome)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Return money saved (income - expenses)
    return income - expenses;
  }

  private calculateProjectedSavings(monthlySavings: number, months: number): number {
    // Simple projection of savings over time
    return monthlySavings * months;
  }

  private calculateTotalBudget(categories: BudgetCategory[]): number {
    return categories.reduce((total, category) => total + category.limit, 0);
  }

  private calculateTotalSpent(transactions: Transaction[]): number {
    return transactions.filter(t => t.amount < 0).reduce((total, t) => total + Math.abs(t.amount), 0);
  }
}

// React hook for financial analysis
export function useFinancialAnalysis() {
  const analysisService = FinancialAnalysisService.getInstance();
  
  const generateProfile = (userId: string, transactions: Transaction[] = []): Promise<FinancialProfile> => {
    return analysisService.generateFinancialProfile(userId, transactions);
  };
  
  return {
    generateProfile
  };
} 