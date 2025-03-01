import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind classes properly.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts.
 * 
 * @example
 * cn('px-2 py-1', 'bg-red-500', { 'text-white': true })
 * // => 'px-2 py-1 bg-red-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 