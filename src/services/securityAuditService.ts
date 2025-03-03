/**
 * Security Audit Service
 * 
 * Provides functions for logging security-related events and monitoring security incidents.
 * All security events should be logged using this service for consistent auditing.
 */
import { supabase } from '@/utils/supabase/client';

export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SESSION_TIMEOUT = 'session_timeout',
  
  // Data Access Events
  SENSITIVE_DATA_ACCESSED = 'sensitive_data_accessed',
  EXPORT_DATA = 'export_data',
  DELETE_DATA = 'delete_data',
  
  // Admin Events
  ADMIN_ACTION = 'admin_action',
  PERMISSION_CHANGED = 'permission_changed',
  
  // Security Incidents
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_ATTACK_ATTEMPT = 'csrf_attack_attempt',
  XSS_ATTACK_ATTEMPT = 'xss_attack_attempt',
  
  // System Events
  SYSTEM_CONFIGURATION_CHANGED = 'system_configuration_changed'
}

export interface SecurityEvent {
  eventType: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string | Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string;
}

/**
 * Log a security event
 * @param event - The security event to log
 * @returns Promise with success status
 */
export const logSecurityEvent = async (
  eventType: SecurityEventType,
  details: string | object,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
  userId?: string
): Promise<void> => {
  try {
    // Prepare the event object
    const event: SecurityEvent = {
      eventType,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      severity,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress: null,
      userAgent: navigator.userAgent
    };
    
    // Try to get IP address if available (this would be from a service in a real app)
    try {
      // Simplified mock implementation - in a real app, this would use a proper IP detection service
      event.ipAddress = localStorage.getItem('last_known_ip') || '0.0.0.0';
    } catch (e) {
      console.warn('Could not retrieve IP address for security log');
    }

    // First attempt to log to the database
    let dbLoggingSuccessful = false;
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          event_type: event.eventType,
          user_id: event.userId,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          details: event.details,
          severity: event.severity,
          created_at: event.timestamp
        });
      
      if (error) {
        // Log specific error types for better diagnostics
        if (error.code === '42P01') {
          console.warn('Security audit log table does not exist, storing event in localStorage');
        } else if (error.code === '23505') {
          console.warn('Duplicate key violation in security log, possible retry of event');
        } else {
          console.warn('Error logging security event to database:', error);
        }
      } else {
        dbLoggingSuccessful = true;
        console.log(`Security event logged to database: ${eventType}`);
      }
    } catch (dbError) {
      console.warn('Exception when logging security event to database:', dbError);
    }

    // If database logging failed, store in localStorage
    if (!dbLoggingSuccessful) {
      try {
        // Retrieve existing offline logs
        const offlineLogsJSON = localStorage.getItem('offline_security_events') || '[]';
        let offlineLogs: SecurityEvent[] = [];
        
        try {
          offlineLogs = JSON.parse(offlineLogsJSON);
        } catch (parseError) {
          console.error('Error parsing offline security logs, resetting:', parseError);
          offlineLogs = [];
        }
        
        // Add new event to the offline logs
        offlineLogs.push(event);
        
        // Limit the number of stored events to prevent localStorage from getting too large
        if (offlineLogs.length > 100) {
          // Keep only the 100 most recent events
          offlineLogs = offlineLogs.slice(-100);
        }
        
        // Store updated offline logs
        localStorage.setItem('offline_security_events', JSON.stringify(offlineLogs));
        console.log(`Security event stored in localStorage: ${eventType}`);
      } catch (localStorageError) {
        console.error('Failed to store security event in localStorage:', localStorageError);
      }
    }

    // For critical/high severity events, try to notify security admins
    // regardless of where the event was logged
    if (severity === 'critical' || severity === 'high') {
      try {
        // In a real application, this would send an email, SMS, or notification
        // to security administrators
        console.warn(`SECURITY ALERT: ${severity.toUpperCase()} severity event - ${eventType}`);
        
        // Mock notification - in a real app this would be an API call
        // to a notification service
        if (typeof window !== 'undefined') {
          const notificationEvent = new CustomEvent('security-alert', { 
            detail: { 
              severity, 
              eventType,
              timestamp: event.timestamp
            } 
          });
          window.dispatchEvent(notificationEvent);
        }
      } catch (notifyError) {
        console.error('Failed to send security alert notification:', notifyError);
      }
    }
    
  } catch (error) {
    // Catch-all for any unexpected errors
    console.error('Unexpected error in logSecurityEvent:', error);
  }
};

/**
 * Check for and sync any offline security logs
 */
export const syncOfflineSecurityLogs = async (): Promise<void> => {
  try {
    // Check if we have offline logs to sync
    const offlineLogsJSON = localStorage.getItem('offline_security_events');
    if (!offlineLogsJSON) {
      // No offline logs to sync
      return;
    }
    
    // Parse offline logs
    let offlineLogs: SecurityEvent[] = [];
    try {
      offlineLogs = JSON.parse(offlineLogsJSON);
    } catch (parseError) {
      console.error('Error parsing offline security logs:', parseError);
      return;
    }
    
    if (offlineLogs.length === 0) {
      // No logs to sync
      return;
    }
    
    console.log(`Attempting to sync ${offlineLogs.length} offline security logs...`);
    
    // Check if we can access the security_audit_log table
    try {
      const { error: tableCheckError } = await supabase
        .from('security_audit_log')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        if (tableCheckError.code === '42P01') {
          console.warn('Cannot sync offline logs: security_audit_log table does not exist');
        } else {
          console.warn('Error checking security_audit_log table:', tableCheckError);
        }
        return;
      }
      
      // Table exists, try to sync logs
      let syncCount = 0;
      const failedLogs: SecurityEvent[] = [];
      
      // Process logs in batches to avoid overloading the database
      const batchSize = 10;
      for (let i = 0; i < offlineLogs.length; i += batchSize) {
        const batch = offlineLogs.slice(i, i + batchSize);
        
        // Convert events to database format
        const dbRecords = batch.map(event => ({
          event_type: event.eventType,
          user_id: event.userId || null,
          ip_address: event.ipAddress || null,
          user_agent: event.userAgent || null,
          details: event.details || null,
          severity: event.severity,
          created_at: event.timestamp
        }));
        
        // Insert batch into database
        const { error: insertError } = await supabase
          .from('security_audit_log')
          .insert(dbRecords);
        
        if (insertError) {
          console.warn('Error syncing some offline logs:', insertError);
          failedLogs.push(...batch);
        } else {
          syncCount += batch.length;
        }
      }
      
      console.log(`Successfully synced ${syncCount} of ${offlineLogs.length} offline security logs`);
      
      // Update localStorage with any failed logs
      if (failedLogs.length > 0) {
        localStorage.setItem('offline_security_events', JSON.stringify(failedLogs));
        console.warn(`${failedLogs.length} logs failed to sync and remain in localStorage`);
      } else {
        // All logs synced successfully, clear localStorage
        localStorage.removeItem('offline_security_events');
        console.log('All offline logs synced successfully');
      }
    } catch (syncError) {
      console.error('Error syncing offline security logs:', syncError);
    }
  } catch (error) {
    console.error('Exception in syncOfflineSecurityLogs:', error);
  }
};

/**
 * Get recent security events for a user
 * @param userId - The user ID to get events for
 * @param limit - Maximum number of events to return
 * @returns Array of security events
 */
export const getUserSecurityEvents = async (
  userId: string,
  limit = 50
): Promise<SecurityEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data.map((event) => ({
      eventType: event.event_type as SecurityEventType,
      userId: event.user_id,
      ipAddress: event.ip_address,
      userAgent: event.user_agent,
      details: event.details,
      severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
      timestamp: event.timestamp
    }));
  } catch (error) {
    console.error('Error fetching user security events:', error);
    return [];
  }
};

/**
 * Get all security events (admin only)
 * @param filters - Optional filters to apply
 * @param limit - Maximum number of events to return
 * @returns Array of security events
 */
export const getAllSecurityEvents = async (
  filters?: Partial<SecurityEvent>,
  limit = 100
): Promise<SecurityEvent[]> => {
  try {
    let query = supabase
      .from('security_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    // Apply filters if provided
    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data.map((event) => ({
      eventType: event.event_type as SecurityEventType,
      userId: event.user_id,
      ipAddress: event.ip_address,
      userAgent: event.user_agent,
      details: event.details,
      severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
      timestamp: event.timestamp
    }));
  } catch (error) {
    console.error('Error fetching security events:', error);
    return [];
  }
};

/**
 * Notify security administrators about critical security events
 * @param event - The security event to notify about
 */
const notifySecurityAdmin = async (event: SecurityEvent): Promise<void> => {
  // In a production app, you might want to:
  // 1. Send an email to security administrators
  // 2. Send a push notification to a security dashboard
  // 3. Trigger an SMS alert
  // 4. Create a ticket in a ticketing system
  
  // For now, we'll just log to console
  console.warn('CRITICAL SECURITY EVENT:', {
    type: event.eventType,
    userId: event.userId,
    timestamp: event.timestamp || new Date().toISOString(),
    details: event.details
  });
  
  // Here you would implement your notification logic
};

/**
 * Checks if the execute_sql function is available on Supabase
 * @returns Promise that resolves to true if the function is available
 */
export const checkSqlExecutionFunction = async (): Promise<boolean> => {
  try {
    console.log('Checking if execute_sql function is available...');
    
    // Try to execute a simple SQL statement
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: 'SELECT 1 as test'
    });
    
    if (error) {
      // Check error code to determine if function doesn't exist
      if (error.code === 'PGRST202' || 
          error.message?.includes('Could not find the function') || 
          error.message?.includes('not found in the schema cache')) {
        console.warn('execute_sql function not found on Supabase');
        return false;
      }
      
      // If error is related to permissions rather than function existence
      if (error.code === '42501' || error.code === '28000') {
        console.warn('Permission denied for execute_sql function');
        return false;
      }
      
      console.warn('Error checking execute_sql function:', error);
      return false;
    }
    
    // Function exists and we have permission to use it
    console.log('execute_sql function is available');
    return true;
  } catch (error) {
    console.error('Exception checking execute_sql function:', error);
    return false;
  }
};

// Create a direct method to create the table without using execute_sql
const createTableDirectly = async (): Promise<boolean> => {
  try {
    console.log('Attempting to create security_audit_log table directly...');
    
    // Check if we can access the table first
    const { error: checkError } = await supabase
      .from('security_audit_log')
      .select('id')
      .limit(1);
    
    // If the table already exists and we can access it, we're good
    if (!checkError) {
      console.log('security_audit_log table exists and is accessible');
      return true;
    }
    
    // If the error is not "relation does not exist", something else is wrong
    if (checkError.code !== '42P01') {
      console.warn('Error checking security_audit_log table:', checkError);
      return false;
    }
    
    // Try to create a test entry - Supabase will create the table if it doesn't exist
    // This is a workaround that sometimes works for minimal table structures
    console.log('Table does not exist, attempting to create it implicitly...');
    const { error: insertError } = await supabase
      .from('security_audit_log')
      .insert({
        event_type: SecurityEventType.SYSTEM_CONFIGURATION_CHANGED,
        details: { action: 'table_creation_attempt' },
        severity: 'low',
        created_at: new Date().toISOString()
      });
    
    if (!insertError) {
      console.log('Successfully created and inserted into security_audit_log table implicitly');
      return true;
    }
    
    console.warn('Could not create security_audit_log table implicitly:', insertError);
    return false;
  } catch (error) {
    console.error('Exception attempting to create table directly:', error);
    return false;
  }
};

/**
 * Attempts to create the security audit log table if it doesn't exist
 * @returns A promise that resolves when the table has been created or verified
 */
export const createSecurityAuditLogTable = async (hasSqlFunction: boolean): Promise<void> => {
  try {
    if (!hasSqlFunction) {
      console.warn('SQL execution function not available, displaying setup instructions');
      displaySetupInstructions();
      
      // Try to see if the table exists anyway using direct access
      const { error: tableCheckError } = await supabase
        .from('security_audit_log')
        .select('id')
        .limit(1);
        
      if (tableCheckError) {
        if (tableCheckError.code === '42P01') {
          console.warn('Security audit log table does not exist. Security events will be stored in localStorage until the table is created.');
        } else {
          console.warn('Error checking security audit log table:', tableCheckError);
        }
      } else {
        console.log('Security audit log table exists, can write directly to the table.');
      }
      
      return;
    }
    
    console.log('Creating/verifying security audit log table...');
    
    // Create the table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.security_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type TEXT NOT NULL,
        user_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        severity TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- Create indexes for efficient querying if they don't exist
      CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
      CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON public.security_audit_log(severity);
      CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
      
      -- Enable RLS if not already enabled
      ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
      
      -- Create policies if they don't exist (this is simplified and might need adjustment)
      DO $$
      BEGIN
        -- Admin read policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'security_audit_log' AND policyname = 'admin_read_all_security_logs'
        ) THEN
          CREATE POLICY admin_read_all_security_logs ON public.security_audit_log
            FOR SELECT USING (
              auth.jwt() ->> 'app_metadata' ? 'is_admin' AND 
              auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
            );
        END IF;
        
        -- User read policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'security_audit_log' AND policyname = 'user_read_own_security_logs'
        ) THEN
          CREATE POLICY user_read_own_security_logs ON public.security_audit_log
            FOR SELECT USING (
              auth.uid()::text = user_id
            );
        END IF;
        
        -- Insert policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'security_audit_log' AND policyname = 'insert_security_logs'
        ) THEN
          CREATE POLICY insert_security_logs ON public.security_audit_log
            FOR INSERT WITH CHECK (true);
        END IF;
      END
      $$;
    `;
    
    try {
      // Execute the SQL to create the table
      const { data, error } = await supabase.rpc('execute_sql', {
        sql: createTableSQL
      });
      
      if (error) {
        console.error('Error creating security audit log table:', error);
        // Still display setup instructions as a fallback
        displaySetupInstructions();
      } else {
        console.log('Security audit log table setup completed successfully');
      }
    } catch (error) {
      console.error('Exception executing SQL for security audit table:', error);
      displaySetupInstructions();
    }
  } catch (error) {
    console.error('Error in createSecurityAuditLogTable:', error);
    displaySetupInstructions();
  }
};

/**
 * This function returns SQL instructions that can be run in the Supabase SQL editor
 * to create the execute_sql function needed for the security audit service.
 */
export const getSetupInstructions = (): string => {
  return `
-- Run this SQL in the Supabase SQL Editor to create the execute_sql function

-- Create the execute_sql function that accepts a SQL parameter
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.execute_sql(text) IS 'Executes the provided SQL statement with security definer privileges. Use with caution.';

-- Create the security_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT,
  severity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON public.security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- Add RLS policies
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows admins to see all logs
CREATE POLICY admin_read_all_security_logs ON public.security_audit_log
    FOR SELECT USING (
        auth.jwt() ->> 'app_metadata' ? 'is_admin' AND 
        auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
    );

-- Create a policy that allows users to see only their own logs
CREATE POLICY user_read_own_security_logs ON public.security_audit_log
    FOR SELECT USING (
        auth.uid()::text = user_id
    );

-- Create a policy that allows insertion of logs
CREATE POLICY insert_security_logs ON public.security_audit_log
    FOR INSERT WITH CHECK (true);

-- Expose the table and function through the API
BEGIN;
  -- Check if public is in the exposed schemas
  INSERT INTO "storage"."buckets" ("id", "name") 
  VALUES ('security-audit-logs', 'security-audit-logs')
  ON CONFLICT DO NOTHING;
  
  COMMIT;
END;
  `;
};

/**
 * Display setup instructions in the console for the developer
 */
export const displaySetupInstructions = (): void => {
  console.warn(`
========================================================================
SECURITY AUDIT SERVICE SETUP REQUIRED
========================================================================
The security audit service requires a special function in your Supabase database.
Please run the following SQL in the Supabase SQL Editor:

${getSetupInstructions()}

After running this SQL, restart your application.
========================================================================
  `);
};

// Update initSecurityAuditService to use our enhanced functions
export const initSecurityAuditService = async (): Promise<void> => {
  // First, check if the SQL function exists
  let hasSqlFunction = false;
  try {
    hasSqlFunction = await checkSqlExecutionFunction();
    console.log('SQL function check result:', hasSqlFunction ? 'Available' : 'Not available');
  } catch (error) {
    console.warn('Error checking SQL execution function:', error);
    hasSqlFunction = false;
  }

  // Try to create the table if we have SQL function access
  if (hasSqlFunction) {
    try {
      await createSecurityAuditLogTable(hasSqlFunction);
      console.log('Security audit log table check completed');
    } catch (error) {
      console.error('Error creating/checking security audit log table:', error);
    }
  } else {
    console.warn('SQL function not available, will use direct table access if possible');
  }

  // Add a small delay before syncing to ensure other app components are initialized
  setTimeout(async () => {
    try {
      // Attempt to sync any offline logs
      await syncOfflineSecurityLogs();
    } catch (error) {
      console.error('Error syncing offline logs during initialization:', error);
    }
  }, 3000);

  // Log that the security audit service has been initialized
  console.log('Security audit service initialized');
};

// Add a simple helper function to create the security audit log RPC function
export const createSecurityAuditFunctions = async (): Promise<boolean> => {
  try {
    // Try to create the functions using a simple SQL statement
    // This is a one-time operation you can run manually via Supabase SQL editor
    const sql = `
      -- Create a function to securely execute SQL (should be run by an admin)
      CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
        RETURN json_build_object('success', true);
      EXCEPTION
        WHEN OTHERS THEN
          RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', SQLSTATE
          );
      END;
      $$;

      -- Create a function specifically for creating the security audit log table
      CREATE OR REPLACE FUNCTION public.create_security_audit_log_table()
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Create the table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.security_audit_log (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_type TEXT NOT NULL,
          user_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          details JSONB,
          severity TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
        );
        
        -- Add indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON public.security_audit_log(severity);
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
        
        -- Add basic RLS policies
        ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
        
        -- Allow any authenticated user to insert logs
        DROP POLICY IF EXISTS security_audit_log_insert_policy ON public.security_audit_log;
        CREATE POLICY security_audit_log_insert_policy ON public.security_audit_log
          FOR INSERT WITH CHECK (true);
          
        -- Allow users to see only their own audit logs
        DROP POLICY IF EXISTS security_audit_log_select_policy ON public.security_audit_log;
        CREATE POLICY security_audit_log_select_policy ON public.security_audit_log
          FOR SELECT USING (auth.uid()::text = user_id);
        
        RETURN json_build_object('success', true);
      EXCEPTION
        WHEN OTHERS THEN
          RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', SQLSTATE
          );
      END;
      $$;
    `;
    
    // Display SQL that needs to be executed (will be shown in console for manual execution)
    console.log('To create the necessary functions, run the following SQL in your Supabase SQL Editor:');
    console.log(sql);
    
    return true;
  } catch (error) {
    console.error('Error generating SQL for security audit functions:', error);
    return false;
  }
}; 