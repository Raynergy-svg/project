import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Account Management Edge Function
 * 
 * This function provides API endpoints for managing user account data
 * in compliance with GDPR and other data protection regulations:
 * 
 * - GET /account-management/export: Get status of data export requests
 * - POST /account-management/export: Request a data export
 * - GET /account-management/deletion: Get status of account deletion request
 * - POST /account-management/deletion: Request account deletion
 * - DELETE /account-management/deletion/{id}: Cancel account deletion request
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    const { method } = req;
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Data Export Endpoints
    if (path === 'export') {
      // Get export request status
      if (method === 'GET') {
        const { data, error } = await supabaseClient
          .from('data_export_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          data: data.length > 0 ? data[0] : null,
          message: data.length > 0 ? 'Export request found' : 'No export requests found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      // Create new export request
      if (method === 'POST') {
        const requestBody = await req.json();
        const exportFormat = requestBody.format || 'json';
        
        // Get client IP address for audit trail
        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
        
        const { data, error } = await supabaseClient
          .from('data_export_requests')
          .insert({
            user_id: user.id,
            export_format: exportFormat,
            status: 'pending',
            metadata: {
              request_source: requestBody.source || 'api',
              ip_address: ipAddress,
              user_agent: requestBody.userAgent || null,
            },
          })
          .select();
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        // Queue the actual export job (would be implemented separately)
        // This could trigger a background worker or serverless function to
        // collect and package the user's data
        
        return new Response(JSON.stringify({ 
          success: true,
          data: data[0],
          message: 'Data export request submitted successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }
    }
    
    // Account Deletion Endpoints
    if (path === 'deletion' || path?.startsWith('deletion/')) {
      // Get deletion request status
      if (method === 'GET') {
        const { data, error } = await supabaseClient
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          data: data.length > 0 ? data[0] : null,
          message: data.length > 0 ? 'Deletion request found' : 'No deletion requests found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      // Create new deletion request
      if (method === 'POST') {
        const requestBody = await req.json();
        
        // Calculate scheduled deletion date (default 30 days from now, or custom)
        const daysUntilDeletion = requestBody.daysUntilDeletion || 30;
        const scheduledDeletionDate = new Date();
        scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + daysUntilDeletion);
        
        // Get client IP address for audit trail
        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
        
        const { data, error } = await supabaseClient
          .from('account_deletion_requests')
          .insert({
            user_id: user.id,
            status: 'pending',
            scheduled_deletion_date: scheduledDeletionDate.toISOString(),
            reason: requestBody.reason || 'User requested account deletion',
            metadata: {
              request_source: requestBody.source || 'api',
              ip_address: ipAddress,
              user_agent: requestBody.userAgent || null,
            },
          })
          .select();
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          data: data[0],
          message: `Account scheduled for deletion in ${daysUntilDeletion} days`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }
      
      // Cancel deletion request
      if (method === 'DELETE') {
        // Extract the deletion request ID from the path
        const deletionRequestId = path?.replace('deletion/', '');
        
        if (!deletionRequestId || deletionRequestId === 'deletion') {
          // If no ID provided, attempt to cancel the most recent request
          const { data: existingRequests, error: fetchError } = await supabaseClient
            .from('account_deletion_requests')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (fetchError) {
            return new Response(JSON.stringify({ error: fetchError.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }
          
          if (existingRequests.length === 0) {
            return new Response(JSON.stringify({ 
              success: false,
              message: 'No pending deletion request found to cancel'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            });
          }
          
          // Use the most recent pending request
          const requestId = existingRequests[0].id;
          
          const { error: updateError } = await supabaseClient
            .from('account_deletion_requests')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
              metadata: {
                canceled_at: new Date().toISOString(),
                canceled_by: user.id,
                canceled_via: 'api',
              },
            })
            .eq('id', requestId)
            .eq('user_id', user.id); // Ensure the user can only cancel their own requests
          
          if (updateError) {
            return new Response(JSON.stringify({ error: updateError.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }
          
          return new Response(JSON.stringify({ 
            success: true,
            message: 'Account deletion request canceled successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        } else {
          // Cancel a specific deletion request by ID
          const { error } = await supabaseClient
            .from('account_deletion_requests')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
              metadata: {
                canceled_at: new Date().toISOString(),
                canceled_by: user.id,
                canceled_via: 'api',
              },
            })
            .eq('id', deletionRequestId)
            .eq('user_id', user.id); // Ensure the user can only cancel their own requests
          
          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }
          
          return new Response(JSON.stringify({ 
            success: true,
            message: 'Account deletion request canceled successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }
    }
    
    // If no matching endpoint
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/account-management/export' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json'

*/ 