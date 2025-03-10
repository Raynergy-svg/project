/**
 * AIService - Service for interacting with the AI worker
 * This service provides methods to communicate with the AI worker for various AI-powered features
 */

import { toast } from 'react-hot-toast';

// Determine the base URL for the AI API endpoints based on environment
// Use a relative path that will be served by the development server's proxy
// This avoids CSP issues by removing the need for cross-origin requests
const isDev = process.env.NODE_ENV === 'development';
const AI_API_BASE_URL = '/api/ai';  // Use relative path for both dev and prod

// Enable local mock mode - Set this to true to bypass the worker completely in development
const USE_LOCAL_MOCK = isDev; 

// Log the API base URL to help with debugging
console.log(`AI Service configured with base URL: ${AI_API_BASE_URL}, using ${USE_LOCAL_MOCK ? 'local mock' : 'worker'} in ${isDev ? 'development' : 'production'}`);

// Type definitions for AI query and response
export interface AIQueryOptions {
  query: string;
  userId?: string;
  context?: Record<string, any>;
  history?: AIMessage[];
}

export interface AIMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

/**
 * Query the AI with a user message
 * @param options Query options including the message and optional context
 * @returns Promise with the AI response
 */
export async function queryAI(options: AIQueryOptions): Promise<string> {
  try {
    if (USE_LOCAL_MOCK) {
      // In development with mock mode enabled, return a simulated response
      console.log('Using mock AI response in development mode');
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay
      return generateMockResponse(options.query);
    }

    // Make the actual API call to the worker
    const response = await fetch(`${AI_API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI query failed:', error);
    toast.error('Sorry, I had trouble answering that. Please try again.');
    throw error;
  }
}

/**
 * Generate a simulated response for development testing
 */
function generateMockResponse(query: string): string {
  // List of mock responses for development testing
  const lowercaseQuery = query.toLowerCase();
  
  if (lowercaseQuery.includes('credit score')) {
    return "To improve your credit score, focus on these key factors: payment history (35%), credit utilization (30%), credit history length (15%), credit mix (10%), and new credit inquiries (10%). Consistently paying bills on time and keeping your credit card balances below 30% of your limits will have the biggest impact.";
  }
  
  if (lowercaseQuery.includes('consolidat')) {
    return "Debt consolidation might be a good option if you can secure a lower interest rate than your current debts. It simplifies your payments into one monthly bill and could lower your overall interest costs. However, be cautious about fees, and make sure you address the spending habits that led to the debt in the first place.";
  }
  
  if (lowercaseQuery.includes('budget') || lowercaseQuery.includes('spending')) {
    return "A solid budget starts with tracking all your income and expenses. Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. With your current debt situation, you might want to temporarily adjust to 50/20/30 to accelerate your debt payoff.";
  }
  
  if (lowercaseQuery.includes('credit card') || lowercaseQuery.includes('interest')) {
    return "For credit card debt, I recommend either the avalanche method (paying highest interest first) or the snowball method (paying smallest balance first). Based on your profile, the avalanche method would save you more in interest, but the snowball method might provide psychological wins to keep you motivated.";
  }
  
  // Default response if no keywords match
  return "I'm your financial AI assistant. I can help with debt management strategies, budgeting advice, and financial planning based on your specific situation. Could you provide more details about your question or financial goals?";
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