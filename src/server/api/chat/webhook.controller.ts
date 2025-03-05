import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIAgentService } from '../../services/ai-agent.service';
import { supabase } from '../../supabase';

/**
 * Controller for handling chat webhooks
 */
export class ChatWebhookController {
  /**
   * Create a new chat session
   */
  static async createChatSession(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Generate session ID
      const sessionId = uuidv4();

      // Get initial greeting from AI
      const aiResponse = await AIAgentService.getInitialGreeting(userId);

      // Store initial message in database
      const { error: dbError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          sender: 'assistant',
          content: aiResponse.message,
          suggested_actions: aiResponse.suggestedActions
        });

      if (dbError) {
        console.error('Error storing initial message:', dbError);
        return res.status(500).json({ error: 'Failed to initialize chat session' });
      }

      // Return session ID and initial message
      return res.status(200).json({
        sessionId,
        initialMessage: {
          content: aiResponse.message,
          suggestedActions: aiResponse.suggestedActions
        }
      });
    } catch (error) {
      console.error('Error creating chat session:', error);
      return res.status(500).json({ error: 'Failed to create chat session' });
    }
  }

  /**
   * Handle incoming chat message
   */
  static async handleChatMessage(req: Request, res: Response) {
    try {
      const { userId, sessionId, message } = req.body;

      if (!userId || !sessionId || !message) {
        return res.status(400).json({ error: 'User ID, Session ID, and message are required' });
      }

      // Store user message
      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          sender: 'user',
          content: message
        });

      if (userMsgError) {
        console.error('Error storing user message:', userMsgError);
        return res.status(500).json({ error: 'Failed to process message' });
      }

      // Get chat history for context
      const { data: chatHistory, error: historyError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (historyError) {
        console.error('Error retrieving chat history:', historyError);
        return res.status(500).json({ error: 'Failed to process message' });
      }

      // Check if message is a ticket creation request
      const isTicketRequest = message.toLowerCase().includes('ticket') || 
                              message.toLowerCase().includes('support request');

      let aiResponse;
      
      if (isTicketRequest) {
        // Handle ticket creation 
        aiResponse = await this.handleTicketCreation(userId, sessionId, message, chatHistory);
      } else {
        // Process message with AI service
        aiResponse = await AIAgentService.processMessage(userId, message, chatHistory);
      }

      // Store AI response
      const { error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          sender: 'assistant',
          content: aiResponse.message,
          suggested_actions: aiResponse.suggestedActions,
          reference_id: aiResponse.referenceId
        });

      if (aiMsgError) {
        console.error('Error storing AI response:', aiMsgError);
        return res.status(500).json({ error: 'Failed to process message' });
      }

      // Return AI response
      return res.status(200).json({
        response: {
          content: aiResponse.message,
          suggestedActions: aiResponse.suggestedActions
        }
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
      return res.status(500).json({ error: 'Failed to process message' });
    }
  }

  /**
   * Handle ticket creation
   */
  static async handleTicketCreation(
    userId: string, 
    sessionId: string, 
    message: string, 
    chatHistory: any[]
  ) {
    try {
      // Extract potential ticket information from message and chat history
      const ticketInfo = this.extractTicketInfo(message, chatHistory);
      
      // Create support ticket in database
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          subject: ticketInfo.subject,
          description: ticketInfo.description,
          status: 'open',
          priority: ticketInfo.priority || 'medium',
          category: ticketInfo.category || 'general',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Error creating support ticket:', ticketError);
        return {
          message: "I apologize, but I couldn't create your support ticket due to a system error. Please try again later or contact our support team directly at support@debtflow.com.",
          suggestedActions: [
            { id: 'retry', label: 'Try Again', value: 'Let me try creating a ticket again.' },
            { id: 'email', label: 'Email Support', value: 'I'll email support instead.' }
          ],
          referenceId: uuidv4()
        };
      }

      // Return success response
      return {
        message: `Thank you! I've created support ticket #${ticket.id}. Our team will review your issue and get back to you within 24 hours. You can check the status of your ticket on your account dashboard under "Support Tickets".`,
        suggestedActions: [
          { id: 'check_status', label: 'Check Status', value: 'How can I check my ticket status?' },
          { id: 'add_details', label: 'Add Details', value: 'I want to add more details to my ticket.' },
          { id: 'continue', label: 'Continue', value: 'Let me ask you something else.' }
        ],
        referenceId: uuidv4()
      };
    } catch (error) {
      console.error('Error in ticket creation:', error);
      return {
        message: "I'm sorry, I wasn't able to create your support ticket. Please try describing your issue again, or contact our support team directly.",
        suggestedActions: [
          { id: 'retry', label: 'Try Again', value: 'Let me try creating a ticket again.' },
          { id: 'contact', label: 'Contact Support', value: 'How can I contact support directly?' }
        ],
        referenceId: uuidv4()
      };
    }
  }

  /**
   * Extract ticket information from message and chat history
   */
  private static extractTicketInfo(message: string, chatHistory: any[]) {
    // Default values
    let subject = "Support Request";
    let description = message;
    let priority = "medium";
    let category = "general";

    // Extract category from message
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('account')) {
      category = 'account';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
      category = 'payment';
    } else if (lowerMessage.includes('technical') || lowerMessage.includes('error') || 
               lowerMessage.includes('bug') || lowerMessage.includes('not working')) {
      category = 'technical';
    } else if (lowerMessage.includes('debt') || lowerMessage.includes('strategy')) {
      category = 'debt_strategy';
    }

    // Extract priority from message
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || 
        lowerMessage.includes('critical') || lowerMessage.includes('immediately')) {
      priority = 'high';
    } else if (lowerMessage.includes('minor') || lowerMessage.includes('when you can') || 
               lowerMessage.includes('not urgent')) {
      priority = 'low';
    }

    // Extract subject from first few words (up to 10 words) if message is long enough
    const words = message.split(' ');
    if (words.length > 5) {
      subject = words.slice(0, Math.min(10, words.length)).join(' ');
      if (!subject.endsWith('.') && !subject.endsWith('?') && !subject.endsWith('!')) {
        subject += '...';
      }
    }

    return { subject, description, priority, category };
  }

  /**
   * Get chat history for a specific session
   */
  static async getChatHistory(req: Request, res: Response) {
    try {
      const { sessionId, userId } = req.query;

      if (!sessionId || !userId) {
        return res.status(400).json({ error: 'Session ID and User ID are required' });
      }

      // Query database for chat messages
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error retrieving chat history:', error);
        return res.status(500).json({ error: 'Failed to retrieve chat history' });
      }

      // Format messages for response
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.created_at,
        suggestedActions: msg.suggested_actions
      }));

      return res.status(200).json({ messages: formattedMessages });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  }
  
  /**
   * Get user's support tickets
   */
  static async getUserTickets(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Query database for user's tickets
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error retrieving user tickets:', error);
        return res.status(500).json({ error: 'Failed to retrieve tickets' });
      }

      return res.status(200).json({ tickets });
    } catch (error) {
      console.error('Error getting user tickets:', error);
      return res.status(500).json({ error: 'Failed to retrieve tickets' });
    }
  }

  /**
   * Handle external AI webhook callbacks
   */
  static async handleExternalAIWebhook(req: Request, res: Response) {
    try {
      const { referenceId, response, userId, sessionId } = req.body;
      
      if (!referenceId || !response || !userId || !sessionId) {
        return res.status(400).json({ error: 'Reference ID, response, user ID, and session ID are required' });
      }

      // Validate the webhook source (implement proper authentication in production)
      // This is a placeholder for actual authentication logic
      const isValidSource = AIAgentService.validateWebhookSource(req);
      if (!isValidSource) {
        return res.status(403).json({ error: 'Unauthorized webhook source' });
      }

      // Store the AI response from the external service
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: uuidv4(),
          user_id: userId,
          session_id: sessionId,
          content: response.message,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          metadata: { 
            suggested_actions: response.suggestedActions,
            reference_id: referenceId,
            source: 'external_ai'
          }
        });

      if (error) {
        console.error('Error storing external AI response:', error);
        return res.status(500).json({ error: 'Failed to store external AI response' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing external AI webhook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 