import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase';

/**
 * Controller for handling support ticket operations
 */
export class TicketController {
  /**
   * Create a new support ticket
   */
  static async createTicket(req: Request, res: Response) {
    try {
      const { userId, sessionId, subject, description, category, priority } = req.body;

      if (!userId || !subject || !description) {
        return res.status(400).json({ error: 'User ID, subject, and description are required' });
      }

      // Generate ticket ID
      const ticketId = uuidv4();
      const status = 'open';
      const createdAt = new Date().toISOString();

      // Store ticket in database
      const { error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          id: ticketId,
          user_id: userId,
          subject,
          description,
          status,
          priority: priority || 'medium',
          category: category || 'general',
          created_at: createdAt
        });

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        return res.status(500).json({ error: 'Failed to create support ticket' });
      }

      // If a session ID is provided, add a reference to the chat
      if (sessionId) {
        const { error: chatRefError } = await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            user_id: userId,
            sender: 'system',
            content: `Support ticket #${ticketId} created`,
            metadata: { ticketId }
          });

        if (chatRefError) {
          console.error('Error creating chat reference:', chatRefError);
          // Continue anyway as the ticket was created successfully
        }
      }

      // Send email notification (in a real implementation)
      // await sendTicketNotification(ticketId, userId, subject);

      return res.status(201).json({ 
        ticketId,
        message: 'Support ticket created successfully'
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return res.status(500).json({ error: 'Failed to create support ticket' });
    }
  }

  /**
   * Get a user's support tickets
   */
  static async getUserTickets(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get tickets from database
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error retrieving tickets:', error);
        return res.status(500).json({ error: 'Failed to retrieve tickets' });
      }

      return res.status(200).json({ tickets });
    } catch (error) {
      console.error('Error retrieving tickets:', error);
      return res.status(500).json({ error: 'Failed to retrieve tickets' });
    }
  }

  /**
   * Get a specific ticket by ID
   */
  static async getTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { userId } = req.query;

      if (!ticketId || !userId) {
        return res.status(400).json({ error: 'Ticket ID and User ID are required' });
      }

      // Get ticket from database
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error retrieving ticket:', error);
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Get ticket comments
      const { data: comments, error: commentsError } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error retrieving ticket comments:', commentsError);
        // Continue anyway as we have the ticket
      }

      return res.status(200).json({ 
        ticket, 
        comments: comments || [] 
      });
    } catch (error) {
      console.error('Error retrieving ticket:', error);
      return res.status(500).json({ error: 'Failed to retrieve ticket' });
    }
  }

  /**
   * Add a comment to a ticket
   */
  static async addTicketComment(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { userId, content, isStaff } = req.body;

      if (!ticketId || !userId || !content) {
        return res.status(400).json({ error: 'Ticket ID, User ID, and content are required' });
      }

      // Add comment to database
      const { data: comment, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          user_id: userId,
          content,
          is_staff: isStaff || false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ error: 'Failed to add comment' });
      }

      return res.status(201).json({ comment });
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { userId, status } = req.body;

      if (!ticketId || !userId || !status) {
        return res.status(400).json({ error: 'Ticket ID, User ID, and status are required' });
      }

      // Validate status
      const validStatuses = ['open', 'in_progress', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Update ticket status
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating ticket status:', error);
        return res.status(500).json({ error: 'Failed to update ticket status' });
      }

      return res.status(200).json({ ticket });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return res.status(500).json({ error: 'Failed to update ticket status' });
    }
  }
} 