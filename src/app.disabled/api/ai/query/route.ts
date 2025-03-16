import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/auth';

// Environment variables for AI integration
const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const AI_API_KEY = process.env.AI_API_KEY;

// Mock data for development and when AI is disabled
const useMock = !AI_ENABLED || process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { query, context, history } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Log the request (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Query Request:', { query, userId: user.id });
    }

    let response;
    
    // Use mock responses for development or when AI is disabled
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      response = generateMockResponse(query, history);
    } else {
      // In production, call the actual AI provider
      response = await callAIProvider(query, context, history, user.id);
    }
    
    // Return the response
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing AI query:', error);
    
    return NextResponse.json(
      { error: 'Failed to process AI query' },
      { status: 500 }
    );
  }
}

/**
 * Generate a mock response for development
 */
function generateMockResponse(query: string, history?: any[]): string {
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
  
  if (lowercaseQuery.includes('hello') || lowercaseQuery.includes('hi')) {
    return "Hello! I'm your financial AI assistant. I can help with debt management strategies, budgeting advice, and financial planning based on your specific situation. How can I assist you today?";
  }
  
  // Default response if no keywords match
  return "I'm your financial AI assistant. I can help with debt management strategies, budgeting advice, and financial planning based on your specific situation. Could you provide more details about your question or financial goals?";
}

/**
 * Call the actual AI provider in production
 */
async function callAIProvider(
  query: string, 
  context: any = {}, 
  history: any[] = [],
  userId: string
): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI API key is not configured');
  }
  
  if (AI_PROVIDER === 'openai') {
    // Implementation for OpenAI
    // This would integrate with the OpenAI API
    throw new Error('OpenAI implementation not yet completed');
  } else if (AI_PROVIDER === 'claude') {
    // Implementation for Anthropic's Claude
    // This would integrate with the Claude API
    throw new Error('Claude implementation not yet completed');
  } else {
    throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
  }
} 