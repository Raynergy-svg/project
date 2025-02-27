import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 3000,
    url: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL!,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  },
  jwt: {
    secret: import.meta.env.VITE_JWT_SECRET!,
    expiresIn: process.env.TOKEN_EXPIRY || '24h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
  stripe: {
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
    mode: import.meta.env.VITE_STRIPE_MODE || 'test',
  },
  security: {
    bcryptSaltRounds: 12,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY!,
  },
}; 