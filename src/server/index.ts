import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import authRoutes from './routes/auth';
// import userRoutes from './routes/user';
import subscriptionRoutes from './routes/subscription.routes.js';
import chatRoutes from './routes/chat.js';
import { AIAgentService } from './services/ai-agent.service.js';
import { supabase } from './supabase.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// Set the Supabase client for the AI Agent service
AIAgentService.setSupabaseClient(supabase);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 