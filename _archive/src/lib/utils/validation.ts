import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const debtSchema = z.object({
  type: z.enum(['credit_card', 'loan', 'mortgage', 'other']),
  amount: z.number().positive('Amount must be positive'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative'),
  minimumPayment: z.number().positive('Minimum payment must be positive'),
});