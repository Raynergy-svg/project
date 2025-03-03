import { supabase } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentReminder {
  id: string;
  user_id: string;
  payment_transaction_id?: string;
  title: string;
  message: string;
  reminder_date: string; // ISO string format
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'pending' | 'sent' | 'cancelled';
  created_at: string;
  updated_at: string;
  notification_type: 'email' | 'push' | 'sms' | 'in-app';
  days_before_due: number; // Days before due date to send reminder
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Creates a payment reminder
   */
  public async createPaymentReminder(
    reminder: Omit<PaymentReminder, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PaymentReminder> {
    try {
      const now = new Date().toISOString();
      const newReminder: PaymentReminder = {
        ...reminder,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('payment_reminders')
        .insert([newReminder])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment reminder:', error);
        // For development or if table doesn't exist, return the mock data
        return newReminder;
      }

      return data || newReminder;
    } catch (error) {
      console.error('Error in createPaymentReminder:', error);
      const now = new Date().toISOString();
      return {
        ...reminder,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };
    }
  }

  /**
   * Gets all payment reminders for a user
   */
  public async getPaymentReminders(userId: string): Promise<PaymentReminder[]> {
    try {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .from('payment_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_date', { ascending: true });

      if (error) {
        console.error('Error fetching payment reminders:', error);
        return this.getMockReminders(userId);
      }

      return data || this.getMockReminders(userId);
    } catch (error) {
      console.error('Error in getPaymentReminders:', error);
      return this.getMockReminders(userId);
    }
  }

  /**
   * Updates a payment reminder
   */
  public async updatePaymentReminder(
    id: string, 
    updates: Partial<Omit<PaymentReminder, 'id' | 'created_at'>>
  ): Promise<PaymentReminder | null> {
    try {
      const now = new Date().toISOString();
      const updatedReminder = {
        ...updates,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('payment_reminders')
        .update(updatedReminder)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment reminder:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePaymentReminder:', error);
      return null;
    }
  }

  /**
   * Deletes a payment reminder
   */
  public async deletePaymentReminder(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePaymentReminder:', error);
      return false;
    }
  }

  /**
   * Schedules a payment reminder for a transaction
   */
  public async scheduleReminderForPayment(
    userId: string,
    paymentTransactionId: string,
    paymentDetails: {
      recipient: string;
      amount: number;
      currency: string;
      payment_date: string; // ISO string format
    },
    options: {
      daysBefore: number;
      notificationType: 'email' | 'push' | 'sms' | 'in-app';
      recurrence?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    }
  ): Promise<PaymentReminder> {
    // Calculate the reminder date based on payment date and days before
    const paymentDate = new Date(paymentDetails.payment_date);
    const reminderDate = new Date(paymentDate);
    reminderDate.setDate(paymentDate.getDate() - options.daysBefore);

    // Format currency amount
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: paymentDetails.currency,
    });
    const formattedAmount = formatter.format(paymentDetails.amount);

    // Create the reminder
    const reminder: Omit<PaymentReminder, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      payment_transaction_id: paymentTransactionId,
      title: `Payment Reminder: ${paymentDetails.recipient}`,
      message: `Your payment of ${formattedAmount} to ${paymentDetails.recipient} is due in ${options.daysBefore} days.`,
      reminder_date: reminderDate.toISOString(),
      recurrence: options.recurrence || 'once',
      status: 'pending',
      notification_type: options.notificationType,
      days_before_due: options.daysBefore,
    };

    return this.createPaymentReminder(reminder);
  }

  /**
   * Registers a client for push notifications
   */
  public async registerForPushNotifications(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // This should be your VAPID public key from environment variables
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Store subscription on server
      const { error } = await supabase.functions.invoke('register-push-subscription', {
        body: { subscription },
      });

      if (error) {
        console.error('Error registering push subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return false;
    }
  }

  /**
   * Private helper to convert base64 to Uint8Array for VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  /**
   * Check and process due reminders (for testing/development)
   */
  public async processDueReminders(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Get reminders that are due
      const { data, error } = await supabase
        .from('payment_reminders')
        .select('*')
        .eq('status', 'pending')
        .lte('reminder_date', now);
      
      if (error) {
        console.error('Error fetching due reminders:', error);
        return 0;
      }
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      // Process each reminder
      const processPromises = data.map(async (reminder) => {
        // Mark as sent
        await this.updatePaymentReminder(reminder.id, { status: 'sent' });
        
        // Handle recurrence - create next reminder if needed
        if (reminder.recurrence !== 'once') {
          await this.createRecurringReminder(reminder);
        }
        
        return reminder;
      });
      
      const processed = await Promise.all(processPromises);
      return processed.length;
    } catch (error) {
      console.error('Error processing due reminders:', error);
      return 0;
    }
  }
  
  /**
   * Helper to create the next reminder in a recurring series
   */
  private async createRecurringReminder(reminder: PaymentReminder): Promise<void> {
    try {
      const reminderDate = new Date(reminder.reminder_date);
      let nextDate: Date;
      
      // Calculate next reminder date based on recurrence
      switch (reminder.recurrence) {
        case 'daily':
          nextDate = new Date(reminderDate);
          nextDate.setDate(reminderDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate = new Date(reminderDate);
          nextDate.setDate(reminderDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate = new Date(reminderDate);
          nextDate.setMonth(reminderDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate = new Date(reminderDate);
          nextDate.setFullYear(reminderDate.getFullYear() + 1);
          break;
        default:
          return; // No recurrence
      }
      
      // Create new reminder
      const newReminder: Omit<PaymentReminder, 'id' | 'created_at' | 'updated_at'> = {
        ...reminder,
        reminder_date: nextDate.toISOString(),
        status: 'pending',
      };
      
      await this.createPaymentReminder(newReminder);
    } catch (error) {
      console.error('Error creating recurring reminder:', error);
    }
  }

  /**
   * Generate mock reminders for development
   */
  private getMockReminders(userId: string): PaymentReminder[] {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return [
      {
        id: 'mock-reminder-1',
        user_id: userId,
        payment_transaction_id: 'mock-payment-2',
        title: 'Mortgage Payment Reminder',
        message: 'Your mortgage payment of $1,200.00 to Wells Fargo Home Mortgage is due in 5 days.',
        reminder_date: new Date(now.getTime() + oneDay).toISOString(),
        recurrence: 'monthly',
        status: 'pending',
        created_at: new Date(now.getTime() - oneDay * 2).toISOString(),
        updated_at: new Date(now.getTime() - oneDay * 2).toISOString(),
        notification_type: 'email',
        days_before_due: 5
      },
      {
        id: 'mock-reminder-2',
        user_id: userId,
        payment_transaction_id: 'mock-payment-3',
        title: 'Car Loan Payment Reminder',
        message: 'Your car loan payment of $180.45 to Toyota Financial is due in 3 days.',
        reminder_date: new Date(now.getTime() + oneDay * 3).toISOString(),
        recurrence: 'monthly',
        status: 'pending',
        created_at: new Date(now.getTime() - oneDay * 3).toISOString(),
        updated_at: new Date(now.getTime() - oneDay * 3).toISOString(),
        notification_type: 'email',
        days_before_due: 3
      },
      {
        id: 'mock-reminder-3',
        user_id: userId,
        payment_transaction_id: 'mock-payment-5',
        title: 'Personal Loan Payment Reminder',
        message: 'Your personal loan payment of $75.00 to SoFi is due tomorrow.',
        reminder_date: new Date(now.getTime() + oneDay * 1).toISOString(),
        recurrence: 'monthly',
        status: 'pending',
        created_at: new Date(now.getTime() - oneDay * 5).toISOString(),
        updated_at: new Date(now.getTime() - oneDay * 5).toISOString(),
        notification_type: 'in-app',
        days_before_due: 1
      }
    ];
  }
}

export default NotificationService.getInstance(); 