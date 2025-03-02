import type { BankAccount } from '@/hooks/useBankConnection';
import type { Debt } from '@/lib/supabase/debtService';
import * as debtService from '@/lib/supabase/debtService';

/**
 * The DebtAnalyzer is an AI-powered system that identifies potential
 * debts from connected bank accounts and generates smart recommendations
 * for debt management.
 */

interface DebtPrediction {
  name: string;
  type: Debt['type'];
  amount: number;
  interest_rate: number;
  minimum_payment: number;
  confidence: number; // 0-1 score of prediction accuracy
  source: string; // The bank account ID this was identified from
  sourceType: string; // The data point that led to this identification
}

interface DebtAnalysisResult {
  predictions: DebtPrediction[];
  totalDebtAmountFound: number;
  recommendations: string[];
  missingInfoAccounts: string[]; // Accounts where we couldn't accurately predict debts
}

/**
 * Analyze connected bank accounts to identify potential debts
 */
export async function analyzeConnectedAccounts(
  userId: string,
  bankAccounts: BankAccount[],
  existingDebts: Debt[]
): Promise<DebtAnalysisResult> {
  console.log(`AI Debt Analyzer: Starting analysis for ${bankAccounts.length} accounts`);
  
  const predictions: DebtPrediction[] = [];
  const recommendations: string[] = [];
  const missingInfoAccounts: string[] = [];
  let totalDebtAmountFound = 0;
  
  // Skip analysis if no accounts are connected
  if (bankAccounts.length === 0) {
    return {
      predictions: [],
      totalDebtAmountFound: 0,
      recommendations: ['Connect your bank accounts to get AI-powered debt analysis'],
      missingInfoAccounts: []
    };
  }
  
  // Process each bank account
  for (const account of bankAccounts) {
    // Credit accounts with negative balances are likely debts
    if (account.type === 'credit' && account.balance < 0) {
      const absBalance = Math.abs(account.balance);
      
      // Predict minimum payment (typically 1-3% of balance)
      const estimatedMinPayment = absBalance * 0.03;
      
      // Predict interest rate based on account type (simple estimation)
      // In a real app, this would use machine learning or data from Plaid
      const estimatedInterestRate = 19.99; // Default to average credit card rate
      
      predictions.push({
        name: `${account.institution} - ${account.name}`,
        type: 'credit_card', // Default assumption for credit accounts
        amount: absBalance,
        interest_rate: estimatedInterestRate,
        minimum_payment: estimatedMinPayment,
        confidence: 0.9,
        source: account.id,
        sourceType: 'credit_account_negative_balance'
      });
      
      totalDebtAmountFound += absBalance;
    } 
    // Checking accounts with negative balances could be overdrafts
    else if (account.type === 'checking' && account.balance < 0) {
      const absBalance = Math.abs(account.balance);
      
      predictions.push({
        name: `${account.institution} Overdraft - ${account.name}`,
        type: 'other',
        amount: absBalance,
        interest_rate: 25, // Overdraft fees are typically high
        minimum_payment: absBalance, // Typically need to be paid in full
        confidence: 0.85,
        source: account.id,
        sourceType: 'checking_account_overdraft'
      });
      
      totalDebtAmountFound += absBalance;
    }
    // Other account types may have less obvious debt indicators
    else {
      missingInfoAccounts.push(account.id);
    }
  }
  
  // Generate recommendations based on found debts
  if (predictions.length > 0) {
    recommendations.push(
      `Found ${predictions.length} potential debts totaling ${formatCurrency(totalDebtAmountFound)}`
    );
    
    // Suggest highest interest rate debt to pay first (Avalanche method)
    const highestInterestDebt = [...predictions].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    if (highestInterestDebt) {
      recommendations.push(
        `Focus on paying down your ${highestInterestDebt.name} first (${highestInterestDebt.interest_rate}% interest rate)`
      );
    }
  } else {
    recommendations.push(
      "No obvious debts detected in your connected accounts. You might need to connect additional accounts or manually add debts."
    );
  }
  
  // Add recommendation if some accounts couldn't be analyzed properly
  if (missingInfoAccounts.length > 0) {
    recommendations.push(
      `Some accounts couldn't be fully analyzed. Consider updating account details for better predictions.`
    );
  }
  
  return {
    predictions,
    totalDebtAmountFound,
    recommendations,
    missingInfoAccounts
  };
}

/**
 * Synchronize debt predictions with the database, creating or updating debts
 * based on bank account analysis
 */
export async function syncDebtsWithBankData(
  userId: string,
  predictions: DebtPrediction[],
  existingDebts: Debt[],
  autoCreate: boolean = false
): Promise<{
  created: Debt[];
  updated: Debt[];
  unchanged: Debt[];
  errors: any[];
}> {
  const result = {
    created: [] as Debt[],
    updated: [] as Debt[],
    unchanged: [] as Debt[],
    errors: [] as any[]
  };
  
  if (!userId) {
    console.error('Cannot sync debts: No user ID provided');
    return result;
  }
  
  // For each prediction, check if it matches an existing debt
  for (const prediction of predictions) {
    try {
      // Check for matches based on source account ID (most accurate match)
      const matchBySource = existingDebts.find(debt => 
        debt.account_id === prediction.source
      );
      
      // Check for matches based on name (less accurate but useful when account_id isn't available)
      const matchByName = !matchBySource ? existingDebts.find(debt => 
        debt.name.toLowerCase().includes(prediction.name.toLowerCase()) ||
        prediction.name.toLowerCase().includes(debt.name.toLowerCase())
      ) : null;
      
      const matchingDebt = matchBySource || matchByName;
      
      // If we found a match, update it
      if (matchingDebt) {
        // Only update if there are significant changes
        if (
          Math.abs(matchingDebt.amount - prediction.amount) > 5 || // $5 difference in balance
          Math.abs(matchingDebt.interest_rate - prediction.interest_rate) > 0.5 || // 0.5% interest rate difference
          Math.abs(matchingDebt.minimum_payment - prediction.minimum_payment) > 1 // $1 difference in min payment
        ) {
          const response = await debtService.updateDebt(matchingDebt.id!, {
            amount: prediction.amount,
            interest_rate: prediction.interest_rate,
            minimum_payment: prediction.minimum_payment,
            account_id: prediction.source,
            last_updated_from_bank: new Date().toISOString()
          });
          
          if (response.data) {
            result.updated.push(response.data);
          } else if (response.error) {
            result.errors.push(response.error);
          }
        } else {
          // No significant changes
          result.unchanged.push(matchingDebt);
        }
      }
      // If no match and autoCreate is true, create a new debt
      else if (autoCreate && prediction.confidence >= 0.8) { // Only create if confidence is high
        const newDebt: Omit<Debt, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          name: prediction.name,
          type: prediction.type,
          amount: prediction.amount,
          interest_rate: prediction.interest_rate,
          minimum_payment: prediction.minimum_payment,
          notes: `Automatically detected from your bank account. Confidence: ${Math.round(prediction.confidence * 100)}%`,
          account_id: prediction.source,
          institution_id: prediction.sourceType,
          last_updated_from_bank: new Date().toISOString()
        };
        
        const response = await debtService.createDebt(newDebt);
        
        if (response.data) {
          result.created.push(response.data);
        } else if (response.error) {
          result.errors.push(response.error);
        }
      }
    } catch (error) {
      result.errors.push(error);
    }
  }
  
  return result;
}

// Utility function for formatting currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
} 