# AI Chat Support System

This directory contains the implementation of the AI-powered chat support system for Smart Debt Flow.

## Overview

The chat support system provides users with an AI assistant that can help with:
- Account issues
- Payment questions
- Debt strategy advice
- Technical support

## Architecture

The system consists of the following components:

1. **Chat Webhook Controller** (`webhook.controller.ts`): Handles HTTP requests for chat sessions, messages, and external AI service webhooks.

2. **AI Agent Service** (`../../services/ai-agent.service.ts`): Processes user messages, generates responses, and interacts with external AI services.

3. **Chat Routes** (`../../routes/chat.ts`): Defines the API endpoints for the chat functionality.

4. **Database** (Supabase): Stores chat messages, sessions, and related metadata.

## API Endpoints

- `POST /api/chat/session`: Creates a new chat session and returns an initial greeting.
- `POST /api/chat/message`: Processes a user message and returns an AI response.
- `GET /api/chat/history/:sessionId`: Retrieves the chat history for a specific session.
- `POST /api/chat/webhook/external`: Handles callbacks from external AI services.

## Authentication

All endpoints except the external webhook require user authentication via JWT tokens.

## Database Schema

The chat system uses the `chat_messages` table with the following structure:
- `id`: UUID primary key
- `user_id`: Foreign key to the users table
- `session_id`: UUID for grouping messages in a conversation
- `content`: The message content
- `role`: Either 'user' or 'assistant'
- `timestamp`: When the message was sent
- `metadata`: JSON field for additional data like suggested actions

## Development

### Local Testing

For local development, the AI Agent Service provides mock responses when no API key is configured.

### External AI Service Integration

To integrate with an external AI service:
1. Set the `AI_SERVICE_API_KEY` environment variable.
2. Set the `AI_SERVICE_ENDPOINT` environment variable.
3. Set the `AI_WEBHOOK_SECRET` for webhook authentication.

## Security Considerations

- All user data is protected by row-level security in Supabase.
- Authentication is required for all user-facing endpoints.
- The external webhook endpoint uses a secret for validation.

## Future Improvements

- Add support for file attachments in chat
- Implement typing indicators
- Add message read receipts
- Support for human agent handoff
- Analytics for chat interactions 