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
  
  // In development mode, use mock data instead of making real API calls
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('Using mock debt analysis in development mode');
    // Simulate a delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return generateMockAnalysis(bankAccounts, existingDebts);
  }
  
  try {
    // In a real implementation, this would call an AI service
    // For example, using OpenAI to analyze the accounts and generate predictions
    
    // For now, we're using mock data in all environments
    // This would be replaced with actual AI service calls in production
    return generateMockAnalysis(bankAccounts, existingDebts);
  } catch (error) {
    console.error('Error in AI debt analysis:', error);
    
    // Return a graceful fallback
    return {
      predictions: [],
      totalDebtAmountFound: 0,
      recommendations: [
        'We encountered an error analyzing your accounts.',
        'Try reconnecting your accounts or try again later.'
      ],
      missingInfoAccounts: []
    };
  }
}

/**
 * Sync detected debts with the user's debt database
 */
export async function syncDebtsWithBankData(
  userId: string,
  detectedDebts: DebtPrediction[],
  existingDebts: Debt[],
  createNew: boolean
): Promise<{
  created: number;
  updated: number;
  unchanged: number;
  errors: number;
}> {
  console.log(`Syncing ${detectedDebts.length} detected debts with ${existingDebts.length} existing debts`);
  
  // Track results
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  // In development mode, use mock behavior
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('Using mock debt sync in development mode');
    // Simulate a delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simulate creating/updating debts
    if (createNew) {
      created = Math.min(3, detectedDebts.length);
      updated = Math.min(2, existingDebts.length);
      unchanged = detectedDebts.length - created;
    } else {
      updated = Math.min(3, existingDebts.length);
      unchanged = detectedDebts.length - updated;
    }
    
    return { created, updated, unchanged, errors };
  }
  
  try {
    // In a real implementation, we would:
    // 1. Match detected debts with existing ones based on name/type
    // 2. Update existing debts with new information
    // 3. Create new debts if createNew is true
    
    // For each detected debt
    for (const detectedDebt of detectedDebts) {
      try {
        // Find matching existing debt by name (case insensitive)
        const matchingDebt = existingDebts.find(debt => 
          debt.name.toLowerCase() === detectedDebt.name.toLowerCase() &&
          debt.type === detectedDebt.type
        );
        
      if (matchingDebt) {
          // Compare if any values are different
          const hasDifferences = 
            matchingDebt.amount !== detectedDebt.amount ||
            matchingDebt.interest_rate !== detectedDebt.interest_rate ||
            matchingDebt.minimum_payment !== detectedDebt.minimum_payment;
          
          if (hasDifferences) {
            // Update the existing debt
            await debtService.updateDebt(userId, matchingDebt.id, {
              amount: detectedDebt.amount,
              interest_rate: detectedDebt.interest_rate,
              minimum_payment: detectedDebt.minimum_payment,
              last_synced: new Date().toISOString()
            });
            updated++;
          } else {
            unchanged++;
          }
        } else if (createNew) {
          // Create a new debt
          await debtService.createDebt(userId, {
            name: detectedDebt.name,
            type: detectedDebt.type,
            amount: detectedDebt.amount,
            interest_rate: detectedDebt.interest_rate,
            minimum_payment: detectedDebt.minimum_payment,
            due_day: 1, // Default to 1st of month
            last_synced: new Date().toISOString()
          });
          created++;
        } else {
          unchanged++;
        }
      } catch (error) {
        console.error('Error syncing individual debt:', error);
        errors++;
      }
    }
    
    return { created, updated, unchanged, errors };
  } catch (error) {
    console.error('Error in AI debt sync:', error);
    throw error;
  }
}

/**
 * Generate a realistic mock analysis for development and demo
 */
function generateMockAnalysis(accounts: BankAccount[], existingDebts: Debt[]): DebtAnalysisResult {
  const result: DebtAnalysisResult = {
    predictions: [],
    totalDebtAmountFound: 0,
    recommendations: [],
    missingInfoAccounts: []
  };
  
  // Look for credit cards and loans in the accounts
  const creditCardAccounts = accounts.filter(a => 
    a.type === 'credit' || 
    a.subtype === 'credit_card' || 
    a.name.toLowerCase().includes('credit') ||
    a.name.toLowerCase().includes('card')
  );
  
  const loanAccounts = accounts.filter(a => 
    a.type === 'loan' || 
    a.subtype?.includes('loan') || 
    a.name.toLowerCase().includes('loan') ||
    a.name.toLowerCase().includes('mortgage')
  );
  
  // Generate credit card debt predictions
  creditCardAccounts.forEach(account => {
    // Credit cards typically have negative balances when debt is owed
    const amount = Math.abs(account.balances.current || 0);
    
    if (amount > 0) {
      // Generate a realistic interest rate
      const interestRate = 14 + Math.random() * 12; // Between 14% and 26%
      
      // Calculate a realistic minimum payment
      const minimumPayment = Math.max(25, Math.round(amount * 0.02)); // Greater of $25 or 2%
      
      result.predictions.push({
        name: account.name,
        type: 'credit_card',
        amount,
        interest_rate: parseFloat(interestRate.toFixed(2)),
        minimum_payment: minimumPayment,
        confidence: 0.85 + (Math.random() * 0.15), // High confidence
        source: account.account_id,
        sourceType: 'balance'
      });
      
      result.totalDebtAmountFound += amount;
    }
  });
  
  // Generate loan debt predictions
  loanAccounts.forEach(account => {
    const amount = Math.abs(account.balances.current || 0);
    
    if (amount > 0) {
      // Determine loan type and interest rate based on name
      let type: Debt['type'] = 'personal_loan';
      let interestRate = 8 + Math.random() * 12; // Default 8-20%
      
      if (account.name.toLowerCase().includes('mortgage')) {
        type = 'mortgage';
        interestRate = 3 + Math.random() * 3; // 3-6%
      } else if (account.name.toLowerCase().includes('auto') || account.name.toLowerCase().includes('car')) {
        type = 'auto_loan';
        interestRate = 4 + Math.random() * 4; // 4-8%
      } else if (account.name.toLowerCase().includes('student')) {
        type = 'student_loan';
        interestRate = 3.5 + Math.random() * 4; // 3.5-7.5%
      }
      
      // Calculate minimum payment (more complex formula for loans)
      // For demonstration, using a simplified calculation
      const term = type === 'mortgage' ? 360 : 60; // 30 years for mortgage, 5 years for others
      const monthlyRate = interestRate / 100 / 12;
      const minimumPayment = Math.round(
        amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
        (Math.pow(1 + monthlyRate, term) - 1)
      );
      
      result.predictions.push({
        name: account.name,
        type,
        amount,
        interest_rate: parseFloat(interestRate.toFixed(2)),
        minimum_payment: minimumPayment,
        confidence: 0.75 + (Math.random() * 0.2), // Good confidence
        source: account.account_id,
        sourceType: 'balance'
      });
      
      result.totalDebtAmountFound += amount;
    }
  });
  
  // Generate recommendations based on the findings
  if (result.predictions.length === 0) {
    result.recommendations.push(
      'No debt accounts were detected from your connected accounts.',
      'If you have debts, make sure the accounts are connected and up to date.'
    );
  } else {
    // Calculate total debt and minimum payments
    const totalDebt = result.totalDebtAmountFound;
    const totalMinimumPayments = result.predictions.reduce(
      (sum, debt) => sum + debt.minimum_payment, 0
    );
    
    // Add general recommendations
    result.recommendations.push(
      `You have approximately $${totalDebt.toLocaleString()} in total debt across ${result.predictions.length} accounts.`,
      `Your monthly minimum payments total $${totalMinimumPayments.toLocaleString()}.`
    );
    
    // Add specific recommendations
    
    // High interest credit card debt
    const highInterestCards = result.predictions.filter(
      d => d.type === 'credit_card' && d.interest_rate > 18
    );
    
    if (highInterestCards.length > 0) {
      result.recommendations.push(
        `Consider prioritizing ${highInterestCards.length > 1 ? 'these' : 'this'} high-interest credit card${highInterestCards.length > 1 ? 's' : ''}: ${highInterestCards.map(c => c.name).join(', ')}.`
      );
    }
    
    // Multiple credit cards
    const creditCards = result.predictions.filter(d => d.type === 'credit_card');
    if (creditCards.length > 1) {
      result.recommendations.push(
        `You have ${creditCards.length} credit cards. Consider using either the avalanche method (highest interest first) or snowball method (smallest balance first) to pay them down efficiently.`
      );
    }
    
    // Refinance suggestions
    const highInterestLoans = result.predictions.filter(
      d => d.type !== 'credit_card' && d.interest_rate > 8
    );
    
    if (highInterestLoans.length > 0) {
      result.recommendations.push(
        `You might be able to save money by refinancing ${highInterestLoans.length > 1 ? 'these' : 'this'} higher-interest loan${highInterestLoans.length > 1 ? 's' : ''}: ${highInterestLoans.map(l => l.name).join(', ')}.`
      );
    }
  }
  
  // Find accounts where we couldn't determine debt
  const unknownAccounts = accounts.filter(a => 
    !creditCardAccounts.includes(a) && 
    !loanAccounts.includes(a) &&
    (a.type === 'credit' || a.type === 'loan' || a.balances.current < 0)
  );
  
  result.missingInfoAccounts = unknownAccounts.map(a => a.account_id);
  
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