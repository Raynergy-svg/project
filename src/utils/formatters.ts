/**
 * Utility functions for formatting values
 * 
 * This file contains utility functions for formatting various types of values
 * such as currency, percentages, dates, and other numeric values.
 */

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currency = 'USD', 
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as a percentage
 * @param value - The numeric value to format (e.g., 0.25 for 25%)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  locale = 'en-US',
  decimals = 1
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a date to a readable string
 * @param date - Date to format (Date object or ISO string)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions object
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a date to a short relative time (e.g., "2 days ago")
 * @param date - Date to format (Date object or ISO string)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Relative time string
 */
export const formatRelativeTime = (
  date: Date | string,
  locale = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(dateObj, locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

/**
 * Format a number with commas and optional decimal places
 * @param value - The numeric value to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  locale = 'en-US',
  decimals = 0
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a file size in bytes to a human-readable format
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a duration in seconds to a readable time string
 * @param seconds - The duration in seconds
 * @returns Formatted duration string (e.g., "1h 30m 45s")
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Format a credit card number with mask (e.g., "•••• •••• •••• 1234")
 * @param cardNumber - The credit card number
 * @returns Masked credit card number
 */
export const formatCreditCardNumber = (cardNumber: string): string => {
  const last4 = cardNumber.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

/**
 * Format a phone number to a readable format
 * @param phoneNumber - The phone number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string, locale = 'en-US'): string => {
  // Simple US phone number formatting
  if (locale === 'en-US') {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  // For other locales, just return as is for now
  return phoneNumber;
};

export default {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatFileSize,
  formatDuration,
  formatCreditCardNumber,
  formatPhoneNumber,
}; 