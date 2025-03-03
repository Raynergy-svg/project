// Debt interface for debt management
export interface Debt {
  id: string;
  name: string;
  category: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
}

// Monthly projection data point
export interface ProjectionDataPoint {
  month: number;
  balance: number;
}

// Interface for the debt to target in recommendations
export interface DebtTarget {
  id: string;
  name: string;
  category: string;
  reason: string;
}

// Interface for credit score impact
export interface CreditScoreImpact {
  current: number;
  potential: number;
  changeDescription: string;
}

// Strategy for debt payoff
export interface PayoffStrategy {
  id: string;
  name: string;
  description: string;
  projectedPayoffDate: Date;
  monthlyPayment: number;
  totalInterestPaid: number;
  projectionData: ProjectionDataPoint[];
  
  // Additional properties needed for DebtProjection component
  recommendedExtraPayment?: number;
  bestDebtToTarget?: DebtTarget;
  creditScoreImpact?: CreditScoreImpact;
}

// Debt categories
export const DEBT_CATEGORIES = [
  'Credit Card',
  'Mortgage',
  'Auto Loan',
  'Student Loan',
  'Personal Loan',
  'Medical Debt',
  'Other'
];

// Payment categories
export const PAYMENT_CATEGORIES = [
  'Credit Card',
  'Mortgage',
  'Auto Loan',
  'Student Loan',
  'Personal Loan',
  'Medical',
  'Utilities',
  'Other'
];

// Payment methods
export const PAYMENT_METHODS = [
  'Bank Account',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Other'
]; 