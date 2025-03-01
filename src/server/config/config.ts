import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 3000,
    url: process.env.APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SERVICE_ROLE_KEY!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.TOKEN_EXPIRY || '24h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
  stripe: {
    secretKey: process.env.VITE_STRIPE_SECRET_KEY || '',
    publishableKey: process.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    basicPlanId: process.env.STRIPE_BASIC_PLAN_ID || '',
    proPlanId: process.env.STRIPE_PRO_PLAN_ID || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },
  security: {
    bcryptSaltRounds: 12,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
}; 