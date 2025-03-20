/**
 * Supabase Error Handling Utilities
 * 
 * This file provides helper functions and utilities for handling errors 
 * from Supabase operations in a consistent way across the application.
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Types of errors that can occur in Supabase operations
 */
export type SupabaseErrorType = 
  | 'auth' 
  | 'database' 
  | 'storage' 
  | 'network' 
  | 'unknown';

/**
 * Structured error response for Supabase operations
 */
export interface StructuredError {
  type: SupabaseErrorType;
  message: string;
  details?: string;
  code?: string | number;
  originalError?: unknown;
}

/**
 * Handles errors from Supabase operations and returns a structured error object
 * 
 * @param error The error to handle
 * @returns A structured error object
 */
export function handleSupabaseError(error: unknown): StructuredError {
  // Handle PostgrestError (from database operations)
  if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'details' in error) {
    const pgError = error as PostgrestError;
    return {
      type: 'database',
      message: pgError.message || 'Database error occurred',
      details: pgError.details || undefined,
      code: pgError.code,
      originalError: error,
    };
  }

  // Handle Auth errors (usually have a statusCode or status field)
  if (error && typeof error === 'object' && 
     (('statusCode' in error && typeof error.statusCode === 'number') || 
      ('status' in error && typeof error.status === 'number'))) {
    const statusCode = 'statusCode' in error ? error.statusCode : 
                      ('status' in error ? error.status : undefined);
    
    return {
      type: 'auth',
      message: error instanceof Error ? error.message : 'Authentication error occurred',
      code: statusCode !== undefined ? String(statusCode) : undefined,
      originalError: error,
    };
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error occurred',
      details: error.message,
      originalError: error,
    };
  }

  // Default case - unknown error
  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    originalError: error,
  };
}

/**
 * Safely executes a Supabase operation and handles any errors
 * 
 * @param operation The Supabase operation to execute
 * @returns The result of the operation or a structured error
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<{ data: T | null; error: StructuredError | null }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return { 
        data: null, 
        error: handleSupabaseError(error)
      };
    }
    
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: handleSupabaseError(error)
    };
  }
}

/**
 * Helper function to log Supabase errors consistently
 * 
 * @param error The error to log
 * @param context Additional context for the error
 */
export function logSupabaseError(error: unknown, context?: string): void {
  const structuredError = handleSupabaseError(error);
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.error(
    `${contextPrefix}Supabase ${structuredError.type} error: ${structuredError.message}`,
    structuredError.code ? `(Code: ${structuredError.code})` : '',
    structuredError.details ? `Details: ${structuredError.details}` : ''
  );
  
  // Log original error in development for debugging
  if (process.env.NODE_ENV === 'development' && structuredError.originalError) {
    console.error('Original error:', structuredError.originalError);
  }
}

export default {
  handleSupabaseError,
  safeSupabaseOperation,
  logSupabaseError
};
