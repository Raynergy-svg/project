/**
 * Application Error System
 * 
 * This module provides a comprehensive error handling system for the application.
 * It defines various error types for different kinds of errors that can occur,
 * making it easier to handle errors in a consistent way throughout the application.
 */

/**
 * Base application error class that all other error types extend
 */
export class AppError extends Error {
  public readonly isAppError = true;
  public readonly errorCode: string;
  public readonly timestamp: Date;

  constructor(message: string, errorCode = 'APP_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.timestamp = new Date();
    
    // This is needed to make instanceof work correctly with ES5
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert the error to a user-friendly message
   */
  toUserMessage(): string {
    return 'An application error occurred. Please try again.';
  }

  /**
   * Convert the error to a format suitable for logging
   */
  toLogFormat(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Error related to API calls
 */
export class ApiError extends AppError {
  public readonly statusCode: number;
  public readonly endpoint: string;
  
  constructor(message: string, statusCode: number, endpoint: string, errorCode = 'API_ERROR') {
    super(message, errorCode);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  override toUserMessage(): string {
    if (this.statusCode >= 500) {
      return 'Server error. Please try again later.';
    } else if (this.statusCode === 404) {
      return 'The requested resource was not found.';
    } else if (this.statusCode === 403) {
      return 'You do not have permission to access this resource.';
    } else if (this.statusCode === 401) {
      return 'Authentication required. Please log in and try again.';
    } else if (this.statusCode === 400) {
      return 'Invalid request. Please check your input and try again.';
    }
    return 'An error occurred while communicating with the server.';
  }

  override toLogFormat(): Record<string, unknown> {
    return {
      ...super.toLogFormat(),
      statusCode: this.statusCode,
      endpoint: this.endpoint
    };
  }
}

/**
 * Error related to authentication
 */
export class AuthError extends AppError {
  constructor(message: string, errorCode = 'AUTH_ERROR') {
    super(message, errorCode);
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  override toUserMessage(): string {
    if (this.errorCode === 'AUTH_INVALID_CREDENTIALS') {
      return 'Invalid email or password. Please check your credentials and try again.';
    } else if (this.errorCode === 'AUTH_SESSION_EXPIRED') {
      return 'Your session has expired. Please log in again.';
    } else if (this.errorCode === 'AUTH_EMAIL_NOT_VERIFIED') {
      return 'Please verify your email address before signing in.';
    }
    return 'Authentication error. Please try logging in again.';
  }
}

/**
 * Error related to database operations
 */
export class DatabaseError extends AppError {
  public readonly operation: string;
  
  constructor(message: string, operation: string, errorCode = 'DB_ERROR') {
    super(message, errorCode);
    this.operation = operation;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  override toUserMessage(): string {
    if (this.errorCode === 'DB_CONNECTION_ERROR') {
      return 'Unable to connect to the database. Please try again later.';
    } else if (this.errorCode === 'DB_CONSTRAINT_VIOLATION') {
      return 'The operation could not be completed due to data constraints.';
    }
    return 'A database error occurred. Please try again later.';
  }

  override toLogFormat(): Record<string, unknown> {
    return {
      ...super.toLogFormat(),
      operation: this.operation
    };
  }
}

/**
 * Error related to validation
 */
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string>;
  
  constructor(message: string, fieldErrors: Record<string, string>, errorCode = 'VALIDATION_ERROR') {
    super(message, errorCode);
    this.fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  override toUserMessage(): string {
    return 'Please check your input and try again.';
  }

  override toLogFormat(): Record<string, unknown> {
    return {
      ...super.toLogFormat(),
      fieldErrors: this.fieldErrors
    };
  }
}

/**
 * Error related to payment processing
 */
export class PaymentError extends AppError {
  public readonly transactionId?: string;
  
  constructor(message: string, transactionId?: string, errorCode = 'PAYMENT_ERROR') {
    super(message, errorCode);
    this.transactionId = transactionId;
    Object.setPrototypeOf(this, PaymentError.prototype);
  }

  override toUserMessage(): string {
    if (this.errorCode === 'PAYMENT_DECLINED') {
      return 'Your payment was declined. Please check your payment information and try again.';
    } else if (this.errorCode === 'PAYMENT_INSUFFICIENT_FUNDS') {
      return 'Insufficient funds for this transaction.';
    } else if (this.errorCode === 'PAYMENT_METHOD_INVALID') {
      return 'The payment method is invalid or expired.';
    }
    return 'An error occurred while processing your payment. Please try again.';
  }

  override toLogFormat(): Record<string, unknown> {
    return {
      ...super.toLogFormat(),
      transactionId: this.transactionId
    };
  }
}

/**
 * Error related to network issues
 */
export class NetworkError extends ApiError {
  constructor(message: string, endpoint: string) {
    super(message, 0, endpoint, 'NETWORK_ERROR');
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  override toUserMessage(): string {
    return 'Network error. Please check your internet connection and try again.';
  }
}

/**
 * Error handler function
 * @param error The error to handle
 * @param logError Whether to log the error
 * @returns A user-friendly error message
 */
export function handleError(error: unknown, logError = true): string {
  let appError: AppError;
  
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message);
  } else {
    appError = new AppError(String(error));
  }
  
  if (logError) {
    console.error('Application error:', appError.toLogFormat());
  }
  
  return appError.toUserMessage();
}

/**
 * Helper to create API errors from HTTP responses
 */
export async function createApiError(response: Response, endpoint: string): Promise<ApiError> {
  let errorMessage: string;
  let errorCode = 'API_ERROR';
  
  try {
    const data = await response.json();
    errorMessage = data.message || data.error || `HTTP error ${response.status}`;
    errorCode = data.code || errorCode;
  } catch (e) {
    errorMessage = `HTTP error ${response.status}`;
  }
  
  return new ApiError(errorMessage, response.status, endpoint, errorCode);
} 