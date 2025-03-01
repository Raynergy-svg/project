export const PAYMENT_METHODS = {
  automatic: 'Automatic Payment',
  manual: 'Manual Payment'
} as const;

export const TIME_FRAMES = {
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly'
} as const;

export const ALERT_TYPES = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info'
} as const;

export type DebtCategoryType = 'credit_card' | 'mortgage' | 'auto' | 'student' | 'personal' | 'medical' | 'other';

export const DEBT_CATEGORIES: Record<DebtCategoryType, { label: string; color: string }> = {
  credit_card: { label: 'Credit Card', color: 'blue' },
  mortgage: { label: 'Mortgage', color: 'green' },
  auto: { label: 'Auto Loan', color: 'yellow' },
  student: { label: 'Student Loan', color: 'purple' },
  personal: { label: 'Personal Loan', color: 'orange' },
  medical: { label: 'Medical Debt', color: 'red' },
  other: { label: 'Other', color: 'gray' }
} as const; 