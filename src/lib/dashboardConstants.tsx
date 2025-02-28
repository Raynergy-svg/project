import { CreditCard, Home, Car, GraduationCap, Banknote } from 'lucide-react';

export type DebtCategoryType = 'credit_card' | 'mortgage' | 'car_loan' | 'student_loan' | 'personal_loan';

export const DEBT_CATEGORIES = {
  CREDIT_CARD: 'Credit Card',
  PERSONAL_LOAN: 'Personal Loan',
  STUDENT_LOAN: 'Student Loan',
  MORTGAGE: 'Mortgage',
  AUTO_LOAN: 'Auto Loan',
  MEDICAL_DEBT: 'Medical Debt',
  OTHER: 'Other'
} as const;

export const PAYMENT_METHODS = {
  AUTOMATIC: 'Automatic Payment',
  MANUAL: 'Manual Payment'
} as const;

export const TIME_FRAMES = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly'
} as const;

export const ALERT_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
} as const;

export const MOCK_DATA = {
  totalDebt: 45000,
  monthlyChange: -1200,
  debtToIncomeRatio: 0.45,
  aiOptimizationScore: 85,
  nextPaymentDate: '2024-04-15',
  nextPaymentAmount: 1500,
  isAutomatedPayment: true,
  debtBreakdown: [
    {
      category: DEBT_CATEGORIES.CREDIT_CARD,
      amount: 15000,
      interestRate: 0.1499,
      minimumPayment: 450
    },
    {
      category: DEBT_CATEGORIES.STUDENT_LOAN,
      amount: 30000,
      interestRate: 0.0599,
      minimumPayment: 350
    }
  ]
} as const;

export type DebtCategory = typeof DEBT_CATEGORIES[keyof typeof DEBT_CATEGORIES];
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
export type TimeFrame = typeof TIME_FRAMES[keyof typeof TIME_FRAMES];
export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

export interface Debt {
  category: DebtCategory;
  amount: number;
  interestRate: number;
  minimumPayment: number;
} 