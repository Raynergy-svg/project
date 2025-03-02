/**
 * Utility functions for formatting values consistently across the application
 */

/**
 * Format a number as currency with dollar sign and commas
 * @param amount - The amount to format
 * @param decimalPlaces - Number of decimal places to show (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, decimalPlaces = 2): string => {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  })}`;
};

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string to format
 * @param format - Format style ('short', 'medium', or 'long')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: 'short' | 'medium' | 'long' = 'short'): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'medium':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Format a percentage value
 * @param value - Value to format as percentage (0.1 = 10%)
 * @param decimalPlaces - Number of decimal places to show
 * @param includeSign - Whether to include the % sign
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimalPlaces = 0, includeSign = true): string => {
  const percentage = (value * 100).toFixed(decimalPlaces);
  return includeSign ? `${percentage}%` : percentage;
};

/**
 * Format a number with specified decimal places
 * @param value - The number to format
 * @param decimalPlaces - Number of decimal places to show
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimalPlaces = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
}; 