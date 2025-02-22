import { supabase } from '@/lib/supabase/client';

interface ErrorNotification {
  error: Error;
  errorInfo?: {
    componentStack?: string;
  };
  location: string;
  timestamp: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  sessionData: Record<string, any>;
}

export async function sendErrorNotification(notification: ErrorNotification) {
  try {
    // Store error locally first
    storeErrorLocally(notification);
    
    // Send to Supabase Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('analyze-error', {
      body: {
        error: {
          message: notification.error.message,
          stack: notification.error.stack,
          name: notification.error.name
        },
        errorInfo: notification.errorInfo,
        location: notification.location,
        timestamp: notification.timestamp,
        userAgent: notification.userAgent,
        viewport: notification.viewport,
        sessionData: notification.sessionData
      }
    });

    if (error) throw error;

    // Store AI analysis result
    if (data?.analysis) {
      const storedErrors = JSON.parse(
        localStorage.getItem('errorLogs') || '[]'
      );
      
      const lastError = storedErrors[storedErrors.length - 1];
      if (lastError) {
        lastError.aiAnalysis = data.analysis;
        localStorage.setItem('errorLogs', JSON.stringify(storedErrors));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send error notification:', error);
    // Store failed notification for retry
    storeFailedNotification(notification);
    return false;
  }
}

function storeErrorLocally(notification: ErrorNotification) {
  try {
    const storedErrors = JSON.parse(
      localStorage.getItem('errorLogs') || '[]'
    );
    
    storedErrors.push({
      ...notification,
      stored_at: new Date().toISOString()
    });
    
    // Keep only last 50 errors
    if (storedErrors.length > 50) {
      storedErrors.shift();
    }
    
    localStorage.setItem('errorLogs', JSON.stringify(storedErrors));
  } catch (error) {
    console.error('Failed to store error locally:', error);
  }
}

function storeFailedNotification(notification: ErrorNotification) {
  try {
    const failedNotifications = JSON.parse(
      localStorage.getItem('failedErrorNotifications') || '[]'
    );
    
    failedNotifications.push({
      notification,
      failed_at: new Date().toISOString(),
      retry_count: 0
    });
    
    localStorage.setItem(
      'failedErrorNotifications', 
      JSON.stringify(failedNotifications)
    );
  } catch (error) {
    console.error('Failed to store failed notification:', error);
  }
}

// Retry failed notifications periodically
export function initializeErrorRetry(intervalMs = 300000) { // 5 minutes
  setInterval(async () => {
    const failedNotifications = JSON.parse(
      localStorage.getItem('failedErrorNotifications') || '[]'
    );

    if (failedNotifications.length === 0) return;

    const updatedNotifications = [];
    
    for (const failed of failedNotifications) {
      if (failed.retry_count >= 3) continue; // Max 3 retries
      
      try {
        const success = await sendErrorNotification(failed.notification);
        if (!success) {
          failed.retry_count++;
          updatedNotifications.push(failed);
        }
      } catch {
        failed.retry_count++;
        updatedNotifications.push(failed);
      }
    }

    localStorage.setItem(
      'failedErrorNotifications',
      JSON.stringify(updatedNotifications)
    );
  }, intervalMs);
}