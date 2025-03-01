import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIAgentService } from '../../services/ai-agent.service';
import { supabase } from '../../supabase';

export class ChatWebhookController {
  /**
   * Creates a new chat session and returns initial greeting
   */
  static async createChatSession(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Generate a unique session ID
      const sessionId = uuidv4();
      
      // Get initial greeting from AI service
      const initialResponse = await AIAgentService.getInitialGreeting(userId);
      
      // Store the initial message in the database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: uuidv4(),
          user_id: userId,
          session_id: sessionId,
          content: initialResponse.message,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          metadata: { suggested_actions: initialResponse.suggestedActions }
        });

      if (error) {
        console.error('Error storing initial message:', error);
        return res.status(500).json({ error: 'Failed to create chat session' });
      }

      return res.status(201).json({
        sessionId,
        message: initialResponse.message,
        suggestedActions: initialResponse.suggestedActions
      });
    } catch (error) {
      console.error('Error creating chat session:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handles incoming chat messages from users
   */
  static async handleChatMessage(req: Request, res: Response) {
    try {
      const { userId, sessionId, message } = req.body;
      
      if (!userId || !sessionId || !message) {
        return res.status(400).json({ error: 'User ID, session ID, and message are required' });
      }

      // Store the user message
      const messageId = uuidv4();
      const { error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          user_id: userId,
          session_id: sessionId,
          content: message,
          role: 'user',
          timestamp: new Date().toISOString()
        });

      if (userMessageError) {
        console.error('Error storing user message:', userMessageError);
        return res.status(500).json({ error: 'Failed to process message' });
      }

      // Get chat history for context
      const { data: chatHistory, error: historyError } = await supabase
        .from('chat_messages')
        .select('content, role, timestamp')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (historyError) {
        console.error('Error retrieving chat history:', historyError);
        return res.status(500).json({ error: 'Failed to retrieve chat context' });
      }

      // Process the message with AI service
      const aiResponse = await AIAgentService.processMessage(userId, message, chatHistory);
      
      // Store the AI response
      const { error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({
          id: uuidv4(),
          user_id: userId,
          session_id: sessionId,
          content: aiResponse.message,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          metadata: { 
            suggested_actions: aiResponse.suggestedActions,
            reference_id: aiResponse.referenceId
          }
        });

      if (aiMessageError) {
        console.error('Error storing AI response:', aiMessageError);
        return res.status(500).json({ error: 'Failed to store AI response' });
      }

      return res.status(200).json({
        message: aiResponse.message,
        suggestedActions: aiResponse.suggestedActions
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Retrieves chat history for a specific session
   */
  static async getChatHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { userId } = req.body;
      
      if (!sessionId || !userId) {
        return res.status(400).json({ error: 'Session ID and user ID are required' });
      }

      // Get chat messages for the session
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, content, role, timestamp, metadata')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error retrieving chat history:', error);
        return res.status(500).json({ error: 'Failed to retrieve chat history' });
      }

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handles webhooks from external AI services
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