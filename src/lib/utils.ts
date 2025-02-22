import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Generic utility functions
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Financial utilities
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

interface DebtPayoffResult {
  months: number;
  totalInterest: number;
  monthlyPayments: Array<{
    month: number;
    payment: number;
    remainingBalance: number;
    interestPaid: number;
  }>;
}

interface DebtInfo {
  amount: number;
  interestRate: number;
  minimumPayment: number;
}

export function calculateDebtPayoff(
  debts: DebtInfo[],
  strategy: 'snowball' | 'avalanche',
  additionalPayment = 0
): DebtPayoffResult {
  const sortedDebts = [...debts].sort((a, b) =>
    strategy === 'snowball'
      ? a.amount - b.amount
      : b.interestRate - a.interestRate
  );

  let months = 0;
  let totalInterest = 0;
  const monthlyPayments: DebtPayoffResult['monthlyPayments'] = [];
  let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
  let availablePayment = additionalPayment;

  while (remainingDebts.length > 0) {
    months++;
    let monthInterest = 0;
    let monthPayment = 0;

    // Calculate minimum payments and interest
    remainingDebts = remainingDebts.map(debt => {
      const monthlyInterest = (debt.amount * debt.interestRate) / 12;
      const payment = Math.min(
        debt.amount + monthlyInterest,
        debt.minimumPayment + (debt === remainingDebts[0] ? availablePayment : 0)
      );

      monthInterest += monthlyInterest;
      monthPayment += payment;

      return {
        ...debt,
        amount: Math.max(0, debt.amount + monthlyInterest - payment)
      };
    }).filter(debt => debt.amount > 0);

    totalInterest += monthInterest;

    monthlyPayments.push({
      month: months,
      payment: monthPayment,
      remainingBalance: remainingDebts.reduce((sum, debt) => sum + debt.amount, 0),
      interestPaid: monthInterest
    });

    // Update available payment for next iteration
    if (remainingDebts.length > 0) {
      const freedPayments = sortedDebts.length - remainingDebts.length;
      availablePayment = additionalPayment + freedPayments * sortedDebts[0].minimumPayment;
    }
  }

  return { months, totalInterest, monthlyPayments };
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

// Number formatting utilities
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}