import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a percentage string
 * @param value - The decimal value to format (e.g., 0.75 for 75%)
 * @returns Formatted percentage string (e.g., "75%")
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

/**
 * Format a number as a currency string
 * @param value - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
