/**
 * AIService - Service for interacting with the AI worker
 * This service provides methods to communicate with the AI worker for various AI-powered features
 */

import { toast } from 'react-hot-toast';

// Base URL for the AI API endpoints
const AI_API_BASE_URL = '/api/ai';

// Interfaces for AI requests and responses
export interface AIQueryRequest {
  query: string;
  context?: Record<string, any>;
  user_id?: string;
}

export interface AIQueryResponse {
  success: boolean;
  message: string;
  query: string;
  result?: string;
  recommendations?: string[];
  error?: string;
}

/**
 * Function to query the AI with a specific question or request
 * @param query The user's query or question
 * @param context Additional context to provide to the AI
 * @returns Promise with the AI's response
 */
export async function queryAI(
  query: string,
  context: Record<string, any> = {},
  userId?: string
): Promise<AIQueryResponse> {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        context,
        user_id: userId,
      } as AIQueryRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data as AIQueryResponse;
  } catch (error) {
    console.error('Error querying AI:', error);
    toast.error('Failed to get AI response. Please try again later.');
    
    return {
      success: false,
      message: 'Failed to get AI response',
      query,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get personalized debt recommendations from the AI
 * @param debts Array of user's debts
 * @param income User's monthly income
 * @param userId User ID for context
 * @returns Promise with recommendations
 */
export async function getDebtRecommendations(
  debts: any[],
  income: number,
  userId?: string
): Promise<string[]> {
  try {
    const response = await queryAI(
      'Provide debt management recommendations',
      {
        debts,
        income,
        request_type: 'debt_recommendations',
      },
      userId
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to get recommendations');
    }

    return response.recommendations || [];
  } catch (error) {
    console.error('Error getting debt recommendations:', error);
    return [
      'Unable to generate recommendations at this time. Please try again later.',
    ];
  }
}

/**
 * Analyze financial transactions using the AI
 * @param transactions Array of financial transactions
 * @param userId User ID for context
 * @returns Promise with analysis results
 */
export async function analyzeTransactions(
  transactions: any[],
  userId?: string
): Promise<any> {
  try {
    const response = await queryAI(
      'Analyze my financial transactions',
      {
        transactions,
        request_type: 'transaction_analysis',
      },
      userId
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to analyze transactions');
    }

    return response.result;
  } catch (error) {
    console.error('Error analyzing transactions:', error);
    return {
      error: 'Unable to analyze transactions at this time.',
    };
  }
} 