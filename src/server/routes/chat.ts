import express from 'express';
import { ChatWebhookController } from '../api/chat/webhook.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Create a new chat session
router.post('/session', authenticateUser, ChatWebhookController.createChatSession);

// Process a chat message
router.post('/message', authenticateUser, ChatWebhookController.handleChatMessage);

// Get chat history
router.get('/history/:sessionId', authenticateUser, ChatWebhookController.getChatHistory);

// External AI webhook endpoint (no authentication required for external AI service to call)
router.post('/webhook/external', ChatWebhookController.handleExternalAIWebhook);

export default router; 