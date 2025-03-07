import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface AccountDeletionRequest {
  reason?: string;
  metadata?: Record<string, any>;
}

interface DataExportRequest {
  format: 'json' | 'csv';
  metadata?: Record<string, any>;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    // Parse request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Get the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token and get the user ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid token' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Handle requests for account deletion
    if (path === 'delete-account') {
      if (req.method === 'POST') {
        const { deletionRequest } = await req.json() as { deletionRequest: AccountDeletionRequest };
        
        // Calculate 30 days from now for scheduled deletion
        const scheduledDeletionDate = new Date();
        scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 30);
        
        // Insert into account_deletion_requests table
        const { data, error } = await supabaseClient
          .from('account_deletion_requests')
          .insert({
            user_id: user.id,
            scheduled_deletion_date: scheduledDeletionDate.toISOString(),
            reason: deletionRequest.reason || null,
            status: 'pending',
            metadata: deletionRequest.metadata || {},
            updated_at: new Date().toISOString(),
          });
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        // Mark the user as deactivated in the profiles table
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({ 
            status: 'deactivated',
            updated_at: new Date().toISOString(),
            deactivated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (profileError) {
          console.error('Error updating profile status:', profileError);
        }
        
        // Return success response
        return new Response(JSON.stringify({ 
          message: 'Account deletion request submitted successfully',
          scheduledDeletionDate: scheduledDeletionDate.toISOString(),
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      if (req.method === 'GET') {
        // Check if there's an existing deletion request
        const { data, error } = await supabaseClient
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        return new Response(JSON.stringify({ 
          deletionRequest: data || null
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      if (req.method === 'DELETE') {
        // Cancel an existing deletion request
        const { data, error } = await supabaseClient
          .from('account_deletion_requests')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('status', 'pending');
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        // Reactivate the user's profile
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString(),
            deactivated_at: null
          })
          .eq('id', user.id);
        
        if (profileError) {
          console.error('Error updating profile status:', profileError);
        }
        
        return new Response(JSON.stringify({ 
          message: 'Account deletion request canceled successfully'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // Handle requests for data export
    if (path === 'export-data') {
      if (req.method === 'POST') {
        const { exportRequest } = await req.json() as { exportRequest: DataExportRequest };
        
        // Create a data export request
        const { data, error } = await supabaseClient
          .from('data_export_requests')
          .insert({
            user_id: user.id,
            export_format: exportRequest.format || 'json',
            status: 'pending',
            metadata: exportRequest.metadata || {},
            updated_at: new Date().toISOString(),
          });
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        // The actual data export is processed asynchronously by a background job
        // For immediate exports of smaller datasets, we can handle it directly here:
        
        try {
          // Collect user data from various tables
          const [
            profileData, 
            consentData, 
            debtData,
            transactionData
          ] = await Promise.all([
            supabaseClient.from('profiles').select('*').eq('id', user.id).single(),
            supabaseClient.from('user_consent_records').select('*').eq('user_id', user.id),
            supabaseClient.from('debts').select('*').eq('user_id', user.id),
            supabaseClient.from('transaction_history').select('*').eq('user_id', user.id),
          ]);
          
          // Compile the exported data
          const exportedData = {
            userInfo: {
              id: user.id,
              email: user.email,
              createdAt: user.created_at,
              profile: profileData.data || null,
            },
            consentRecords: consentData.data || [],
            financialData: {
              debts: debtData.data || [],
              transactions: transactionData.data || [],
            },
            exportTimestamp: new Date().toISOString(),
          };
          
          // Format the data based on the requested format
          let formattedData: string;
          let contentType: string;
          
          if (exportRequest.format === 'csv') {
            formattedData = convertToCSV(exportedData);
            contentType = 'text/csv';
          } else {
            formattedData = JSON.stringify(exportedData, null, 2);
            contentType = 'application/json';
          }
          
          // Update the export request to completed status
          await supabaseClient
            .from('data_export_requests')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              exported_file_size: formattedData.length,
            })
            .eq('user_id', user.id)
            .eq('status', 'pending');
          
          // Return the data directly for smaller datasets
          return new Response(formattedData, {
            headers: { 
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="data-export-${user.id}.${exportRequest.format}"` 
            },
            status: 200,
          });
        } catch (exportError) {
          console.error('Error processing data export:', exportError);
          
          // Update the export request to failed status
          await supabaseClient
            .from('data_export_requests')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
              metadata: { error: exportError.message },
            })
            .eq('user_id', user.id)
            .eq('status', 'pending');
          
          return new Response(JSON.stringify({ 
            message: 'Data export request submitted but processing failed',
            error: exportError.message
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      }
      
      if (req.method === 'GET') {
        // Check status of pending exports
        const { data, error } = await supabaseClient
          .from('data_export_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        return new Response(JSON.stringify({ 
          exportRequests: data || []
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // If not handled by any of the above paths/methods
    return new Response(JSON.stringify({ error: 'Method Not Allowed or Invalid Path' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Utility function to convert JSON data to CSV format
function convertToCSV(data: any): string {
  // Flatten the object structure for CSV format
  const flattenedData = flattenObject(data);
  
  // Get all column headers
  const headers = Object.keys(flattenedData);
  
  // Create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    headers.map(header => {
      const value = flattenedData[header];
      // Handle strings with commas, quotes, etc. by wrapping in quotes
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  ];
  
  return csvRows.join('\n');
}

// Helper function to flatten a nested object structure
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else if (Array.isArray(obj[key])) {
      // For arrays, serialize to JSON string
      acc[pre + key] = JSON.stringify(obj[key]);
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
} 