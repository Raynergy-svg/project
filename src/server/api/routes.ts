import { Router } from 'express';
import { ChatWebhookController } from './chat/webhook.controller';
import { TicketController } from './chat/ticket.controller';

const router = Router();

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

export default router; 