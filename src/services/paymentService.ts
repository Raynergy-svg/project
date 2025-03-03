import { supabase } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import notificationService from './notificationService';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
  recipient?: string;
  payment_date?: string;
  category?: string;
  reminder_settings?: {
    enabled: boolean;
    days_before: number[];
    notification_types: ('email' | 'push' | 'sms' | 'in-app')[];
  };
}

export class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get all payment transactions for a user
  public async getTransactions(userId: string): Promise<PaymentTransaction[]> {
    try {
      if (!userId) throw new Error('User ID is required');
      
      // This will use our mock handler in development if table doesn't exist
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment transactions:', error);
        return this.getMockTransactions(userId);
      }

      return data || this.getMockTransactions(userId);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return this.getMockTransactions(userId);
    }
  }

  // Create a new payment transaction
  public async createTransaction(
    transaction: Omit<PaymentTransaction, 'id' | 'created_at'>, 
    createReminders = true
  ): Promise<PaymentTransaction> {
    try {
      const newTransaction: PaymentTransaction = {
        ...transaction,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment transaction:', error);
        // Return the transaction we tried to create
        return newTransaction; 
      }

      const savedTransaction = data || newTransaction;
      
      // Set up reminders if requested and payment is in the future
      if (createReminders && 
          savedTransaction.payment_date && 
          savedTransaction.reminder_settings?.enabled &&
          new Date(savedTransaction.payment_date) > new Date()) {
        
        await this.setupRemindersForTransaction(savedTransaction);
      }

      return savedTransaction;
    } catch (error) {
      console.error('Error in createTransaction:', error);
      // Return the transaction we tried to create with a generated ID
      return {
        ...transaction,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      };
    }
  }

  // Update a payment transaction
  public async updateTransaction(
    id: string, 
    updates: Partial<PaymentTransaction>,
    updateReminders = true
  ): Promise<PaymentTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment transaction:', error);
        return null;
      }

      // If payment date or reminder settings changed and reminders should be updated
      if (updateReminders && 
          (updates.payment_date || updates.reminder_settings) && 
          data?.reminder_settings?.enabled && 
          data?.payment_date && 
          new Date(data.payment_date) > new Date()) {
        
        // First, delete existing reminders for this transaction
        await this.deleteRemindersForTransaction(id);
        
        // Then create new ones
        await this.setupRemindersForTransaction(data);
      }

      return data;
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      return null;
    }
  }

  // Delete a payment transaction
  public async deleteTransaction(id: string): Promise<boolean> {
    try {
      // First delete any associated reminders
      await this.deleteRemindersForTransaction(id);
      
      // Then delete the transaction itself
      const { error } = await supabase
        .from('payment_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment transaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
      return false;
    }
  }

  // Setup reminders for a transaction
  private async setupRemindersForTransaction(transaction: PaymentTransaction): Promise<void> {
    try {
      if (!transaction.payment_date || !transaction.reminder_settings?.enabled) {
        return;
      }
      
      const { user_id, id: paymentTransactionId, payment_date, reminder_settings } = transaction;
      
      // Create a reminder for each day in days_before
      for (const daysBefore of reminder_settings.days_before) {
        // Create a reminder for each notification type
        for (const notificationType of reminder_settings.notification_types) {
          await notificationService.scheduleReminderForPayment(
            user_id,
            paymentTransactionId,
            {
              recipient: transaction.recipient || 'Unknown Recipient',
              amount: transaction.amount,
              currency: transaction.currency,
              payment_date
            },
            {
              daysBefore,
              notificationType,
              recurrence: 'once' // Only one-time for now, could be configurable
            }
          );
        }
      }
    } catch (error) {
      console.error('Error setting up reminders for transaction:', error);
    }
  }

  // Delete all reminders for a transaction
  private async deleteRemindersForTransaction(transactionId: string): Promise<void> {
    try {
      // Get all reminders for this transaction
      const { data, error } = await supabase
        .from('payment_reminders')
        .select('id')
        .eq('payment_transaction_id', transactionId);
      
      if (error) {
        console.error('Error fetching reminders for transaction:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        return; // No reminders to delete
      }
      
      // Delete all found reminders
      const reminderIds = data.map(reminder => reminder.id);
      for (const id of reminderIds) {
        await notificationService.deletePaymentReminder(id);
      }
    } catch (error) {
      console.error('Error deleting reminders for transaction:', error);
    }
  }

  // Generate mock transactions for development
  private getMockTransactions(userId: string): PaymentTransaction[] {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return [
      {
        id: 'mock-payment-1',
        user_id: userId,
        amount: 250.00,
        currency: 'USD',
        description: 'Monthly credit card payment',
        status: 'completed',
        payment_method: 'bank_transfer',
        created_at: new Date(now.getTime() - oneDay * 2).toISOString(),
        recipient: 'Chase Credit Card',
        payment_date: new Date(now.getTime() - oneDay * 2).toISOString(),
        category: 'credit_card_payment',
        reminder_settings: {
          enabled: true,
          days_before: [1, 3, 7],
          notification_types: ['email', 'in-app']
        }
      },
      {
        id: 'mock-payment-2',
        user_id: userId,
        amount: 1200.00,
        currency: 'USD',
        description: 'Mortgage payment',
        status: 'pending',
        payment_method: 'scheduled',
        created_at: new Date(now.getTime() - oneDay).toISOString(),
        recipient: 'Wells Fargo Home Mortgage',
        payment_date: new Date(now.getTime() + oneDay * 5).toISOString(),
        category: 'mortgage',
        reminder_settings: {
          enabled: true,
          days_before: [1, 3, 7],
          notification_types: ['email', 'in-app']
        }
      },
      {
        id: 'mock-payment-3',
        user_id: userId,
        amount: 180.45,
        currency: 'USD',
        description: 'Car loan payment',
        status: 'completed',
        payment_method: 'bank_transfer',
        created_at: new Date(now.getTime() - oneDay * 7).toISOString(),
        recipient: 'Toyota Financial',
        payment_date: new Date(now.getTime() - oneDay * 7).toISOString(),
        category: 'auto_loan',
        reminder_settings: {
          enabled: true,
          days_before: [1, 3],
          notification_types: ['email']
        }
      },
      {
        id: 'mock-payment-4',
        user_id: userId,
        amount: 500.00,
        currency: 'USD',
        description: 'Extra student loan payment',
        status: 'completed',
        payment_method: 'bank_transfer',
        created_at: new Date(now.getTime() - oneDay * 14).toISOString(),
        recipient: 'Navient',
        payment_date: new Date(now.getTime() - oneDay * 14).toISOString(),
        category: 'student_loan',
        reminder_settings: {
          enabled: false,
          days_before: [],
          notification_types: []
        }
      },
      {
        id: 'mock-payment-5',
        user_id: userId,
        amount: 75.00,
        currency: 'USD',
        description: 'Minimum personal loan payment',
        status: 'completed',
        payment_method: 'bank_transfer',
        created_at: new Date(now.getTime() - oneDay * 21).toISOString(),
        recipient: 'SoFi',
        payment_date: new Date(now.getTime() - oneDay * 21).toISOString(),
        category: 'personal_loan',
        reminder_settings: {
          enabled: true,
          days_before: [1],
          notification_types: ['in-app']
        }
      }
    ];
  }
} 

export default PaymentService.getInstance(); 