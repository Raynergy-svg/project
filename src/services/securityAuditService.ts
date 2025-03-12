/**
 * Security Audit Service
 * 
 * Provides functions for logging security-related events and monitoring security incidents.
 * All security events should be logged using this service for consistent auditing.
 */
// Import the supabase client from the singleton pattern
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

// Type alias for offline security logs to ensure consistency
export type OfflineSecurityLog = SecurityEvent;

/**
 * Log a security event to the security_audit_log table
 * @param eventOrType - The security event to log or the event type
 * @param details - Additional details about the event (if not using SecurityEvent object)
 * @param severity - The severity level of the event (if not using SecurityEvent object)
 * @param userId - The user ID associated with the event (if not using SecurityEvent object)
 */
export const logSecurityEvent = async (
  eventOrType: SecurityEvent | SecurityEventType,
  details?: string | Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
  userId?: string
): Promise<void> => {
  try {
    // Determine if we're using a SecurityEvent object or individual parameters
    let event: SecurityEvent;
    
    if (typeof eventOrType === 'object') {
      // Using a SecurityEvent object
      event = eventOrType;
    } else {
      // Using individual parameters
      event = createSecurityEvent(eventOrType, details!, severity, userId);
    }
    
    // Try to get the current session
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.access_token) {
        // No valid session, store for offline sync
        console.log('🔒 Security: No active session, storing security event offline');
        storeOfflineSecurityEvent(event);
        return;
      }
      
      // We have a valid session, try to log the event
      try {
        const response = await fetch(
          `${supabase.supabaseUrl}/rest/v1/security_audit_log`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${session.access_token}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              event_type: event.eventType,
              user_id: event.userId,
              ip_address: event.ipAddress,
              user_agent: event.userAgent,
              details: event.details,
              severity: event.severity,
              created_at: event.timestamp || new Date().toISOString()
            })
          }
        );
        
        if (!response.ok) {
          console.warn(`Error logging security event: ${response.status} ${response.statusText}`);
          storeOfflineSecurityEvent(event);
        }
      } catch (fetchError) {
        console.error('Error logging security event:', fetchError);
        storeOfflineSecurityEvent(event);
      }
    } catch (sessionError) {
      console.error('Error checking session for security logging:', sessionError);
      storeOfflineSecurityEvent(event);
    }
  } catch (error) {
    console.error('Error in security event logging:', error);
    // Store event for offline sync
    if (typeof eventOrType === 'object') {
      storeOfflineSecurityEvent(eventOrType);
    } else if (details !== undefined) {
      storeOfflineSecurityEvent(createSecurityEvent(eventOrType, details, severity, userId));
    }
  }
};

/**
 * Store a security event for offline sync
 * @param event - The security event to store
 */
const storeOfflineSecurityEvent = (event: SecurityEvent): void => {
  try {
    // Ensure timestamp is set
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    };
    
    // Get existing offline logs
    const offlineLogsJson = localStorage.getItem('offlineSecurityLogs');
    let offlineLogs: SecurityEvent[] = [];
    
    if (offlineLogsJson) {
      try {
        offlineLogs = JSON.parse(offlineLogsJson);
      } catch (parseError) {
        console.error('Error parsing offline security logs:', parseError);
        // Reset if corrupted
        offlineLogs = [];
      }
    }
    
    // Add new event
    offlineLogs.push(eventWithTimestamp);
    
    // Store back to localStorage
    localStorage.setItem('offlineSecurityLogs', JSON.stringify(offlineLogs));
    console.log('Security event stored for offline sync');
  } catch (error) {
    console.error('Error storing offline security event:', error);
  }
};

/**
 * Sync offline security logs to the server when connection is restored
 */
export const syncOfflineSecurityLogs = async (): Promise<void> => {
  try {
    const offlineLogsJson = localStorage.getItem('offlineSecurityLogs');
    if (!offlineLogsJson) return;

    const offlineLogs = JSON.parse(offlineLogsJson) as OfflineSecurityLog[];
    if (!offlineLogs.length) return;

    // Get the current session to ensure we have a valid token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session for syncing offline logs:', sessionError);
      return;
    }
    
    if (!session || !session.access_token) {
      console.log('🔒 Security: No active session, cannot sync offline security logs');
      return;
    }

    console.log(`Syncing ${offlineLogs.length} offline security logs`);

    // Process logs in batches to avoid overwhelming the server
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < offlineLogs.length; i += batchSize) {
      batches.push(offlineLogs.slice(i, i + batchSize));
    }

    let successCount = 0;
    
    for (const batch of batches) {
      const promises = batch.map(async (log) => {
        try {
          // Use direct fetch for more reliable authentication
          const response = await fetch(
            `${supabase.supabaseUrl}/rest/v1/security_audit_log`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabase.supabaseKey,
                'Authorization': `Bearer ${session.access_token}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                event_type: log.eventType,
                user_id: log.userId,
                ip_address: log.ipAddress,
                user_agent: log.userAgent,
                details: log.details,
                severity: log.severity,
                created_at: log.timestamp
              })
            }
          );
          
          if (!response.ok) {
            console.warn(`Failed to sync offline log: ${response.status} ${response.statusText}`);
            
            // Try with Supabase client as fallback
            const { error } = await supabase.from('security_audit_log').insert({
              event_type: log.eventType,
              user_id: log.userId,
              ip_address: log.ipAddress,
              user_agent: log.userAgent,
              details: log.details,
              severity: log.severity,
              created_at: log.timestamp
            });
            
            if (error) {
              console.error('Failed to sync offline log via Supabase client:', error);
              return false;
            }
            
            return true;
          }
          
          return true;
        } catch (error) {
          console.error('Error syncing offline log:', error);
          return false;
        }
      });

      const results = await Promise.all(promises);
      successCount += results.filter(Boolean).length;
    }

    console.log(`Successfully synced ${successCount}/${offlineLogs.length} offline security logs`);

    // Remove synced logs
    if (successCount > 0) {
      if (successCount === offlineLogs.length) {
        localStorage.removeItem('offlineSecurityLogs');
      } else {
        // Keep only the failed logs
        const remainingLogs = offlineLogs.slice(successCount);
        localStorage.setItem('offlineSecurityLogs', JSON.stringify(remainingLogs));
      }
    }
  } catch (error) {
    console.error('Error syncing offline security logs:', error);
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
    // Get the current session to ensure we have a valid token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session for security event retrieval:', sessionError);
      return [];
    }
    
    if (!session || !session.access_token) {
      console.warn('No active session or access token found for security event retrieval');
      return [];
    }
    
    // Use a direct fetch call with explicit headers
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/security_audit_log?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        console.warn(`Error fetching security events: ${response.status} ${response.statusText}`);
        
        // Try with the Supabase client as a fallback
        const { data, error } = await supabase
          .from('security_audit_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          console.error('Error fetching user security events via Supabase client:', error);
          return [];
        }
        
        return data.map((event) => ({
          eventType: event.event_type as SecurityEventType,
          userId: event.user_id,
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          details: event.details,
          severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
          timestamp: event.created_at
        }));
      }
      
      const data = await response.json();
      return data.map((event: any) => ({
        eventType: event.event_type as SecurityEventType,
        userId: event.user_id,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        details: event.details,
        severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
        timestamp: event.created_at
      }));
    } catch (fetchError) {
      console.error('Error fetching security events via direct fetch:', fetchError);
      
      // Try with the Supabase client as a fallback
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching user security events via Supabase client:', error);
        return [];
      }
      
      return data.map((event) => ({
        eventType: event.event_type as SecurityEventType,
        userId: event.user_id,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        details: event.details,
        severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
        timestamp: event.created_at
      }));
    }
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
    // Get the current session to ensure we have a valid token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session for security event retrieval:', sessionError);
      return [];
    }
    
    if (!session || !session.access_token) {
      console.warn('No active session or access token found for security event retrieval');
      return [];
    }
    
    // Build the query string for filters
    let queryParams = `order=created_at.desc&limit=${limit}`;
    if (filters?.eventType) {
      queryParams += `&event_type=eq.${encodeURIComponent(filters.eventType)}`;
    }
    if (filters?.userId) {
      queryParams += `&user_id=eq.${encodeURIComponent(filters.userId)}`;
    }
    if (filters?.severity) {
      queryParams += `&severity=eq.${encodeURIComponent(filters.severity)}`;
    }
    
    // Use a direct fetch call with explicit headers
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/security_audit_log?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        console.warn(`Error fetching security events: ${response.status} ${response.statusText}`);
        
        // Try with the Supabase client as a fallback
        let query = supabase
          .from('security_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
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
          console.error('Error fetching security events via Supabase client:', error);
          return [];
        }
        
        return data.map((event) => ({
          eventType: event.event_type as SecurityEventType,
          userId: event.user_id,
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          details: event.details,
          severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
          timestamp: event.created_at
        }));
      }
      
      const data = await response.json();
      return data.map((event: any) => ({
        eventType: event.event_type as SecurityEventType,
        userId: event.user_id,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        details: event.details,
        severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
        timestamp: event.created_at
      }));
    } catch (fetchError) {
      console.error('Error fetching security events via direct fetch:', fetchError);
      
      // Try with the Supabase client as a fallback
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
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
        console.error('Error fetching security events via Supabase client:', error);
        return [];
      }
      
      return data.map((event) => ({
        eventType: event.event_type as SecurityEventType,
        userId: event.user_id,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        details: event.details,
        severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
        timestamp: event.created_at
      }));
    }
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
    console.log('Checking if SQL execution function is available...');
    
    // First try the new security_execute_sql function
    try {
      const { data, error } = await supabase.rpc('security_execute_sql', {
        sql: 'SELECT 1 as test'
      });
      
      if (!error) {
        console.log('security_execute_sql function is available');
        return true;
      }
    } catch (e) {
      console.warn('security_execute_sql not available, trying execute_sql...');
    }
    
    // Fall back to the original execute_sql function
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: 'SELECT 1 as test'
    });
    
    if (error) {
      // Try with the sql_query parameter name
      try {
        const { data: data2, error: error2 } = await supabase.rpc('execute_sql', {
          sql_query: 'SELECT 1 as test'
        });
        
        if (!error2) {
          console.log('execute_sql function with sql_query parameter is available');
          return true;
        }
      } catch (e) {
        // Continue to error handling
      }
      
      // Check error code to determine if function doesn't exist
      if (error.code === 'PGRST202' || 
          error.message?.includes('Could not find the function') || 
          error.message?.includes('not found in the schema cache')) {
        console.warn('SQL execution function not found on Supabase');
        return false;
      }
      
      // If error is related to permissions rather than function existence
      if (error.code === '42501' || error.code === '28000' || error.status === 401) {
        console.warn('Permission denied for SQL execution function');
        return false;
      }
      
      console.warn('Error checking SQL execution function:', error);
      return false;
    }
    
    // Function exists and we have permission to use it
    console.log('execute_sql function is available');
    return true;
  } catch (error) {
    console.error('Exception checking SQL execution function:', error);
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
          WHERE tablename = 'security_audit_log' AND policyname = 'insert_security_audit_logs'
        ) THEN
          CREATE POLICY insert_security_audit_logs ON public.security_audit_log
            FOR INSERT WITH CHECK (true);
        END IF;
      END
      $$;
    `;
    
    try {
      // Execute the SQL to create the table
      const { data, error } = await supabase.rpc('security_execute_sql', {
        sql: createTableSQL
      });
      
      if (error) {
        console.error('Error creating security audit log table:', error);
        
        // Try with the original execute_sql function as fallback
        try {
          const { data: data2, error: error2 } = await supabase.rpc('execute_sql', {
            sql: createTableSQL
          });
          
          if (error2) {
            // Try with sql_query parameter as a last resort
            const { data: data3, error: error3 } = await supabase.rpc('execute_sql', {
              sql_query: createTableSQL
            });
            
            if (error3) {
              console.error('All SQL execution attempts failed:', error3);
              // Still display setup instructions as a fallback
              displaySetupInstructions();
            } else {
              console.log('Security audit log table setup completed successfully using sql_query parameter');
            }
          } else {
            console.log('Security audit log table setup completed successfully using execute_sql');
          }
        } catch (e) {
          console.error('Exception in fallback SQL execution:', e);
          displaySetupInstructions();
        }
      } else {
        console.log('Security audit log table setup completed successfully using security_execute_sql');
      }
    } catch (error) {
      console.error('Exception executing SQL for security audit log table:', error);
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
-- Run this SQL in the Supabase SQL Editor to create the necessary functions

-- Create the security_execute_sql function that accepts a SQL parameter named 'sql'
CREATE OR REPLACE FUNCTION public.security_execute_sql("sql" text)
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

-- Grant execute permission to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.security_execute_sql("sql" text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.security_execute_sql("sql" text) TO anon;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.security_execute_sql("sql" text) IS 'Executes the provided SQL statement with security definer privileges. Parameter named sql to match client code.';

-- Also create the original execute_sql function for backward compatibility
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

-- Grant execute permission on the function to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;

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
CREATE POLICY insert_security_audit_logs ON public.security_audit_log
    FOR INSERT WITH CHECK (true);
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
      -- Create a function to securely execute SQL with named parameter 'sql'
      CREATE OR REPLACE FUNCTION public.security_execute_sql("sql" text)
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
      
      -- Grant execute permission to both authenticated and anonymous users
      GRANT EXECUTE ON FUNCTION public.security_execute_sql("sql" text) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.security_execute_sql("sql" text) TO anon;
      
      -- Also create the original execute_sql function for backward compatibility
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
      
      -- Grant execute permission to both authenticated and anonymous users
      GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;

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

/**
 * Create a security event with default values
 * @param eventType - The type of security event
 * @param details - Additional details about the event
 * @param severity - The severity level of the event
 * @param userId - The user ID associated with the event
 * @returns A SecurityEvent object with default values filled in
 */
export const createSecurityEvent = (
  eventType: SecurityEventType,
  details: string | Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
  userId?: string
): SecurityEvent => {
  return {
    eventType,
    details: typeof details === 'string' ? details : JSON.stringify(details),
    severity,
    userId,
    timestamp: new Date().toISOString(),
    ipAddress: null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  };
}; 