import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';

interface AIResponse {
  message: string;
  suggestedActions?: SuggestedAction[];
  referenceId?: string;
}

interface SuggestedAction {
  id: string;
  label: string;
  value: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

/**
 * AI Agent Service for handling customer support chat interactions
 */
export class AIAgentService {
  private static supabaseClient: SupabaseClient;
  private static apiKey: string = process.env.AI_SERVICE_API_KEY || '';
  private static apiEndpoint: string = process.env.AI_SERVICE_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  private static webhookSecret: string = process.env.AI_WEBHOOK_SECRET || '';

  /**
   * Set the Supabase client for database operations
   */
  static setSupabaseClient(client: SupabaseClient) {
    this.supabaseClient = client;
  }

  /**
   * Get initial greeting message for a new chat session
   */
  static async getInitialGreeting(userId: string): Promise<AIResponse> {
    // Get user info to personalize greeting
    let userName = "there";
    try {
      const { data: userData, error } = await this.supabaseClient
        .from('users')
        .select('first_name')
        .eq('id', userId)
        .single();
      
      if (!error && userData?.first_name) {
        userName = userData.first_name;
      }
    } catch (error) {
      console.error('Error fetching user data for greeting:', error);
    }
    
    return {
      message: `Hello ${userName}! I'm the DebtFlow Assistant, here to help with your debt management questions, account issues, and technical support. How can I assist you today?`,
      suggestedActions: this.getDefaultSuggestedActions()
    };
  }

  /**
   * Process a user message and generate a response
   */
  static async processMessage(
    userId: string, 
    message: string, 
    chatHistory: any[]
  ): Promise<AIResponse> {
    try {
      // Check for keywords to determine intent
      const lowerMessage = message.toLowerCase();
      
      // Handle specific intents based on keywords
      if (this.containsDebtStrategyKeywords(lowerMessage)) {
        return this.handleDebtStrategyIntent(userId, message);
      }
      
      if (this.containsPaymentKeywords(lowerMessage)) {
        return this.handlePaymentIntent(userId, message);
      }
      
      if (this.containsAccountKeywords(lowerMessage)) {
        return this.handleAccountIntent(userId, message);
      }
      
      if (this.containsTechnicalKeywords(lowerMessage)) {
        return this.handleTechnicalIntent(userId, message);
      }
      
      if (this.containsHumanAgentKeywords(lowerMessage)) {
        return this.handleHumanAgentRequest(userId, message);
      }
      
      if (this.containsTicketKeywords(lowerMessage)) {
        return this.handleTicketCreationIntent(userId, message);
      }

      // Use AI model for general responses
      try {
        const aiResponse = await this.callExternalAIService(userId, message, chatHistory);
        return aiResponse;
      } catch (error) {
        console.error('Error calling external AI service:', error);
        // Fallback to generic response
        return {
          message: "I understand you need assistance. To help you better, could you please specify if your question is about debt strategies, payment methods, your account, or technical support?",
          suggestedActions: this.getDefaultSuggestedActions(),
          referenceId: uuidv4()
        };
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "I apologize, but I'm having trouble processing your request. Please try again or select one of the options below.",
        suggestedActions: this.getDefaultSuggestedActions(),
        referenceId: uuidv4()
      };
    }
  }

  /**
   * Call external AI service for processing messages
   */
  private static async callExternalAIService(
    userId: string,
    message: string,
    chatHistory: any[]
  ): Promise<AIResponse> {
    // For now, return a placeholder response
    // In a real implementation, this would make an API call to a service like OpenAI
    return {
      message: "I understand your question. Let me provide some information about managing your debt effectively. First, it's important to prioritize high-interest debts while maintaining minimum payments on others. Would you like me to explain more about specific debt reduction strategies like the avalanche or snowball method?",
      suggestedActions: [
        { id: 'avalanche', label: 'Avalanche Method', value: 'Tell me about the avalanche method.' },
        { id: 'snowball', label: 'Snowball Method', value: 'How does the snowball method work?' },
        { id: 'custom', label: 'Custom Plan', value: 'I need a custom debt plan.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Handle debt strategy related queries
   */
  private static handleDebtStrategyIntent(userId: string, message: string): AIResponse {
    return {
      message: "I'd be happy to help with your debt strategy. Smart Debt Flow offers both the Avalanche method (focusing on high-interest debt first) and the Snowball method (paying off smaller debts first). Which approach interests you more?",
      suggestedActions: [
        { id: 'avalanche', label: 'Avalanche Method', value: 'Tell me more about the Avalanche method.' },
        { id: 'snowball', label: 'Snowball Method', value: 'I want to learn about the Snowball method.' },
        { id: 'comparison', label: 'Compare Methods', value: 'What's the difference between these methods?' },
        { id: 'custom', label: 'Custom Strategy', value: 'I need a personalized debt strategy.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Handle payment related queries
   */
  private static handlePaymentIntent(userId: string, message: string): AIResponse {
    return {
      message: "I can help with payment questions. Smart Debt Flow accepts credit cards, debit cards, and ACH transfers. What specific information do you need about payments?",
      suggestedActions: [
        { id: 'methods', label: 'Payment Methods', value: 'What payment methods do you accept?' },
        { id: 'update', label: 'Update Payment', value: 'I need to update my payment method.' },
        { id: 'failed', label: 'Failed Payment', value: 'My payment failed to process.' },
        { id: 'subscription', label: 'Subscription Cost', value: 'How much does the service cost?' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Handle account related queries
   */
  private static handleAccountIntent(userId: string, message: string): AIResponse {
    return {
      message: "I can help with your account. What specifically would you like to do with your Smart Debt Flow account?",
      suggestedActions: [
        { id: 'settings', label: 'Account Settings', value: 'I need to update my account settings.' },
        { id: 'password', label: 'Reset Password', value: 'How do I reset my password?' },
        { id: 'delete', label: 'Delete Account', value: 'I want to delete my account.' },
        { id: 'upgrade', label: 'Upgrade Account', value: 'I want to upgrade my account.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Handle technical support queries
   */
  private static handleTechnicalIntent(userId: string, message: string): AIResponse {
    return {
      message: "I'm sorry you're experiencing technical issues. I can help with common problems, or connect you with our technical support team for more complex issues.",
      suggestedActions: [
        { id: 'login', label: 'Login Issues', value: 'I can't log in to my account.' },
        { id: 'data', label: 'Data Not Loading', value: 'My debt data isn't loading correctly.' },
        { id: 'connection', label: 'Connection Issues', value: 'I'm having connection problems.' },
        { id: 'ticket', label: 'Create Support Ticket', value: 'I need to create a technical support ticket.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Handle requests for human agent
   */
  private static handleHumanAgentRequest(userId: string, message: string): AIResponse {
    // In a real implementation, this would create a ticket or alert a human agent
    return {
      message: "I understand you'd like to speak with a human agent. Our support team is available Monday-Friday, 9am-5pm ET. Would you like me to create a support ticket so a team member can get back to you as soon as possible?",
      suggestedActions: [
        { id: 'create_ticket', label: 'Create Ticket', value: 'Yes, please create a support ticket.' },
        { id: 'contact_options', label: 'Other Options', value: 'What other ways can I contact support?' },
        { id: 'continue_ai', label: 'Continue with AI', value: 'Let me try with the AI assistant first.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Handle ticket creation intent
   */
  private static handleTicketCreationIntent(userId: string, message: string): AIResponse {
    // In a real implementation, this would guide the user through creating a ticket
    return {
      message: "I'd be happy to help you create a support ticket. Please let me know the category of your issue, and provide a brief description of what you need help with.",
      suggestedActions: [
        { id: 'account_ticket', label: 'Account Issue', value: 'I have an account issue.' },
        { id: 'payment_ticket', label: 'Payment Issue', value: 'I have a payment issue.' },
        { id: 'technical_ticket', label: 'Technical Issue', value: 'I have a technical issue.' },
        { id: 'other_ticket', label: 'Other', value: 'My issue is something else.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Validate webhook source for external AI service callbacks
   */
  static validateWebhookSource(req: Request): boolean {
    // In a production environment, you would implement proper webhook validation
    // For example, by checking signatures or API keys
    return true;
  }

  /**
   * Get default suggested actions for initial greeting
   */
  private static getDefaultSuggestedActions(): SuggestedAction[] {
    return [
      { id: 'debt', label: 'Debt Strategies', value: 'I need help with my debt strategy.' },
      { id: 'payment', label: 'Payment Help', value: 'I have a question about payments.' },
      { id: 'account', label: 'Account Help', value: 'I need help with my account.' },
      { id: 'technical', label: 'Technical Support', value: 'I'm experiencing a technical issue.' }
    ];
  }

  /**
   * Check if message contains debt strategy related keywords
   */
  private static containsDebtStrategyKeywords(message: string): boolean {
    const keywords = ['debt', 'strategy', 'snowball', 'avalanche', 'interest', 'payoff', 'pay off', 'loans'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message contains payment related keywords
   */
  private static containsPaymentKeywords(message: string): boolean {
    const keywords = ['payment', 'pay', 'subscription', 'cost', 'price', 'billing', 'invoice', 'card', 'credit'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message contains account related keywords
   */
  private static containsAccountKeywords(message: string): boolean {
    const keywords = ['account', 'profile', 'settings', 'password', 'login', 'sign in', 'email', 'username'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message contains technical support related keywords
   */
  private static containsTechnicalKeywords(message: string): boolean {
    const keywords = ['bug', 'error', 'problem', 'issue', 'doesn\'t work', 'not working', 'technical', 'broken'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message contains keywords related to human agent requests
   */
  private static containsHumanAgentKeywords(message: string): boolean {
    const keywords = ['human', 'agent', 'person', 'representative', 'speak to someone', 'real person', 'support team'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message contains keywords related to ticket creation
   */
  private static containsTicketKeywords(message: string): boolean {
    const keywords = ['ticket', 'create ticket', 'support ticket', 'report', 'open case'];
    return keywords.some(keyword => message.includes(keyword));
  }
} 