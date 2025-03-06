import { Router } from 'express';
import { ChatWebhookController } from './chat/webhook.controller';
import { TicketController } from './chat/ticket.controller';
import chatRoutes from './chat/routes';
import authRoutes from './auth/routes';
import subscriptionRoutes from './subscriptions/routes';
import ipRoutes from './ip/routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoints
router.post('/chat/session', ChatWebhookController.createChatSession);
router.post('/chat/message', ChatWebhookController.handleChatMessage);
router.get('/chat/history', ChatWebhookController.getChatHistory);
router.post('/chat/webhook', ChatWebhookController.handleExternalAIWebhook);

// Ticket endpoints
router.post('/chat/ticket', TicketController.createTicket);
router.get('/tickets', TicketController.getUserTickets);
router.get('/tickets/:ticketId', TicketController.getTicket);
router.post('/tickets/:ticketId/comment', TicketController.addTicketComment);
router.put('/tickets/:ticketId/status', TicketController.updateTicketStatus);

// API routes
router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/ip', ipRoutes);

export default router; 