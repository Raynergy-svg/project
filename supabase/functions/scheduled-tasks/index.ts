import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// This function will run on a schedule (e.g., daily) to process account deletion requests
serve(async (req) => {
  try {
    // Verify the request is authorized (from Supabase scheduler)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes(Deno.env.get('CRON_SECRET') || '')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    // Create a Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Get current date for comparison with scheduled deletion dates
    const currentDate = new Date().toISOString();
    
    // Find deletion requests that are due for processing
    const { data: deletionRequests, error: fetchError } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('id, user_id, scheduled_deletion_date')
      .eq('status', 'pending')
      .lte('scheduled_deletion_date', currentDate);
    
    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    if (!deletionRequests || deletionRequests.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending deletion requests to process' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Process each deletion request
    const processingResults = await Promise.all(
      deletionRequests.map(async (request) => {
        try {
          // Update status to processing
          await supabaseAdmin
            .from('account_deletion_requests')
            .update({ 
              status: 'processing',
              updated_at: new Date().toISOString() 
            })
            .eq('id', request.id);
          
          // Step 1: Anonymize user data in various tables
          await anonymizeUserData(supabaseAdmin, request.user_id);
          
          // Step 2: Delete or archive user-specific records
          await deleteUserRecords(supabaseAdmin, request.user_id);
          
          // Step 3: Update deletion request status to completed
          await supabaseAdmin
            .from('account_deletion_requests')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', request.id);
          
          return { 
            requestId: request.id,
            userId: request.user_id,
            status: 'success'
          };
        } catch (error) {
          console.error(`Error processing deletion request ${request.id}:`, error);
          
          // Update deletion request with error status
          await supabaseAdmin
            .from('account_deletion_requests')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
              metadata: { 
                error: error.message,
                errorTimestamp: new Date().toISOString() 
              }
            })
            .eq('id', request.id);
            
          return { 
            requestId: request.id,
            userId: request.user_id,
            status: 'error',
            error: error.message
          };
        }
      })
    );
    
    return new Response(JSON.stringify({
      message: `Processed ${deletionRequests.length} account deletion requests`,
      results: processingResults
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error in scheduled deletion task:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Function to anonymize user data in various tables
async function anonymizeUserData(supabaseAdmin: any, userId: string) {
  // Generate anonymized replacement values
  const anonymizedEmail = `anonymized_${Date.now()}_${Math.floor(Math.random() * 10000)}@deleted.user`;
  const anonymizedName = `DeletedUser_${Date.now()}`;
  
  // Anonymize auth.users table - this requires admin access
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      email: anonymizedEmail,
      password: crypto.randomUUID(), // Random password that can't be used
      user_metadata: { anonymized: true, anonymized_at: new Date().toISOString() }
    }
  );
  
  if (authError) {
    console.error('Error anonymizing auth user:', authError);
    throw new Error(`Failed to anonymize auth user: ${authError.message}`);
  }
  
  // Anonymize profiles table
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      name: anonymizedName,
      email: anonymizedEmail,
      phone_number: null,
      address: null,
      avatar_url: null,
      status: 'deleted',
      anonymized: true,
      anonymized_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (profileError) {
    console.error('Error anonymizing profile:', profileError);
    throw new Error(`Failed to anonymize profile: ${profileError.message}`);
  }
  
  // Anonymize or remove PII from other tables that contain user data
  // For example:
  
  // Anonymize transaction records
  const { error: transactionError } = await supabaseAdmin
    .from('transaction_history')
    .update({
      description: 'Anonymized Transaction',
      metadata: { anonymized: true },
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (transactionError) {
    console.error('Error anonymizing transactions:', transactionError);
  }
  
  // Delete sensitive user consents (or anonymize them)
  const { error: consentError } = await supabaseAdmin
    .from('user_consent_records')
    .update({
      ip_address: '0.0.0.0',
      user_agent: 'Anonymized',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (consentError) {
    console.error('Error anonymizing consents:', consentError);
  }
}

// Function to delete user-specific records that don't need to be retained
async function deleteUserRecords(supabaseAdmin: any, userId: string) {
  // Delete tables that don't need to be retained for compliance/business reasons
  const tablesToClean = [
    'cookie_consent_preferences',
    'data_export_requests'
  ];
  
  for (const table of tablesToClean) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error(`Error deleting records from ${table}:`, error);
      // Continue with other tables even if one fails
    }
  }
} 