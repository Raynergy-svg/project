import {
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Briefcase
} from 'lucide-react';

export type DebtCategoryType = 'credit_card' | 'mortgage' | 'auto' | 'student' | 'personal';

export const DEBT_CATEGORIES = {
  credit_card: {
    icon: CreditCard,
    label: 'Credit Cards',
    color: '#FF6B6B'
  },
  mortgage: {
    icon: Home,
    label: 'Mortgage',
    color: '#4ECDC4'
  },
  auto: {
    icon: Car,
    label: 'Auto Loan',
    color: '#45B7D1'
  },
  student: {
    icon: GraduationCap,
    label: 'Student Loan',
    color: '#96CEB4'
  },
  personal: {
    icon: Briefcase,
    label: 'Personal Loan',
    color: '#FFEEAD'
  }
} as const;

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