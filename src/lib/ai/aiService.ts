/**
 * AIService - Service for interacting with the AI worker
 * This service provides methods to communicate with the AI worker for various AI-powered features
 */

import { toast } from 'react-hot-toast';

// Determine the base URL for the AI API endpoints based on environment
// Use a relative path that will be served by the development server's proxy
// This avoids CSP issues by removing the need for cross-origin requests
const isDev = import.meta.env.DEV;
const AI_API_BASE_URL = '/api/ai';  // Use relative path for both dev and prod

// Enable local mock mode - Set this to true to bypass the worker completely in development
const USE_LOCAL_MOCK = isDev; 

// Log the API base URL to help with debugging
console.log(`AI Service configured with base URL: ${AI_API_BASE_URL}, using ${USE_LOCAL_MOCK ? 'local mock' : 'worker'} in ${isDev ? 'development' : 'production'}`);

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
 * Generate a mock AI response for development fallback
 * @param query The user's query
 * @param context Additional context provided
 * @returns A mock AI response
 */
function generateMockAIResponse(query: string, context: Record<string, any> = {}): AIQueryResponse {
  console.log('Generating mock AI response for:', query, context);
  
  const mockResponses: Record<string, string> = {
    "hello": "Hello! I'm your AI financial assistant. How can I help you with your financial planning today?",
    "help": "I can help you with debt management, budgeting, financial planning, and analyzing your spending patterns. What would you like assistance with?",
    "debt": "Based on your debts, I recommend focusing on high-interest accounts first. You might want to consider the debt snowball or avalanche method for faster payoff.",
    "budget": "Creating a budget starts with tracking your income and expenses. Try allocating 50% to needs, 30% to wants, and 20% to savings and debt repayment.",
    "default": `I'm currently running in offline mode, but I can still provide general guidance. For your query "${query}", I would typically analyze your financial situation and offer personalized advice. In the meantime, consider reviewing your budget and prioritizing high-interest debt payments.`
  };
  
  // Check if the query contains any keywords we can respond to
  const matchingKey = Object.keys(mockResponses).find(key => 
    query.toLowerCase().includes(key.toLowerCase())
  ) || "default";
  
  return {
    success: true,
    message: "AI response generated (mock)",
    query,
    result: mockResponses[matchingKey]
  };
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
  // For development, if local mock is enabled, don't even try to contact the worker
  if (USE_LOCAL_MOCK) {
    console.log('Using local mock AI response:', { query, context });
    
    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return generateMockAIResponse(query, context);
  }
  
  try {
    console.log(`Sending AI query to ${AI_API_BASE_URL}/query`, { query });
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
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
      signal: controller.signal,
    });
    
    // Clear the timeout since request completed
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `AI request failed: ${response.status}`;
      try {
        // Try to get more detailed error information from the response
        const errorBody = await response.text();
        console.error('AI error response:', errorBody);
        
        try {
          // Check if the error is in JSON format
          const errorJson = JSON.parse(errorBody);
          if (errorJson.message || errorJson.error) {
            errorMessage += ` - ${errorJson.message || errorJson.error}`;
          }
        } catch (parseError) {
          // If not JSON, use the raw text
          if (errorBody.trim()) {
            errorMessage += ` - ${errorBody}`;
          }
        }
      } catch (responseError) {
        console.error('Failed to read error response:', responseError);
      }
      
      // In development, fall back to mock response on error
      if (isDev) {
        console.warn('Falling back to mock response due to error:', errorMessage);
        return generateMockAIResponse(query, context);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as AIQueryResponse;
  } catch (error) {
    console.error('Error querying AI:', error);
    
    // In development mode, provide mock responses instead of failing
    if (isDev) {
      console.warn('Using mock AI response in development due to error:', error.message);
      return generateMockAIResponse(query, context);
    }
    
    // Provide more helpful error messages based on the type of error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      toast.error('Could not connect to AI service. Please check your network connection.');
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      toast.error('AI service request timed out. Please try again later.');
    } else if (error instanceof Error && error.message.includes('Content Security Policy')) {
      console.error('CSP Error:', error.message);
      toast.error('Security policy prevented connection to AI service. Please contact support.');
    } else {
      toast.error('Failed to get AI response. Please try again later.');
    }
    
    // Rethrow the error for handling by the caller
    throw error;
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