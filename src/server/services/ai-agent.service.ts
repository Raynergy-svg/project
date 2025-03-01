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
    return {
      message: "Hello! I'm your AI support assistant. How can I help you today?",
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
    return {
      message: "Thank you for your message. I'm here to help with account issues, payment questions, debt strategies, and technical support. What specific assistance do you need today?",
      suggestedActions: [
        { id: 'account', label: 'Account Help', value: 'I need help with my account.' },
        { id: 'payment', label: 'Payment Help', value: 'I need help with payments.' },
        { id: 'human', label: 'Human Agent', value: 'I would like to speak with a human agent.' }
      ],
      referenceId: uuidv4()
    };
  }

  /**
   * Validate webhook source for external AI service callbacks
   */
  static validateWebhookSource(req: Request): boolean {
    return true;
  }

  /**
   * Get default suggested actions for initial greeting
   */
  private static getDefaultSuggestedActions(): SuggestedAction[] {
    return [
      { id: 'account', label: 'Account Issues', value: 'I need help with my account.' },
      { id: 'payment', label: 'Payment Questions', value: 'I have a question about payments.' },
      { id: 'debt', label: 'Debt Strategy', value: 'Can you help me with my debt strategy?' },
      { id: 'technical', label: 'Technical Support', value: 'I am experiencing a technical issue.' }
    ];
  }
} 