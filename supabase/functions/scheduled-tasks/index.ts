import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

/**
 * Scheduled Tasks Function
 * 
 * This function runs daily to process:
 * 1. Pending account deletion requests that have reached their scheduled deletion date
 * 2. Pending data export requests that need processing
 * 
 * It uses the service_role key to perform administrative actions.
 */

serve(async (req) => {
  try {
    // Create a Supabase client with the service role to perform admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // Process expired deletion requests
    const deletionResults = await processDeletionRequests(supabaseAdmin);
    
    // Process pending export requests
    const exportResults = await processExportRequests(supabaseAdmin);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled tasks completed successfully',
        timestamp: new Date().toISOString(),
        results: {
          deletions: deletionResults,
          exports: exportResults,
        },
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in scheduled tasks:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

/**
 * Process account deletion requests that have reached their scheduled deletion date
 */
async function processDeletionRequests(supabaseAdmin: any) {
  const today = new Date().toISOString();
  const results = {
    processed: 0,
    errors: 0,
    details: [] as any[],
  };
  
  try {
    // Find deletion requests that are scheduled for today or earlier
    const { data: pendingDeletions, error } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('id, user_id, scheduled_deletion_date, reason')
      .eq('status', 'pending')
      .lte('scheduled_deletion_date', today);
    
    if (error) throw error;
    
    if (!pendingDeletions || pendingDeletions.length === 0) {
      console.log('No pending deletion requests to process');
      return results;
    }
    
    console.log(`Processing ${pendingDeletions.length} deletion requests...`);
    
    // Process each deletion request
    for (const request of pendingDeletions) {
      try {
        // Step 1: Mark the user as to be deleted in auth.users
        // This is a soft delete approach - in a real implementation, you might:
        // - Hash/anonymize personal data
        // - Delete actual user data from various tables
        // - Eventually hard-delete the user record
        
        // Update the request status to 'processing'
        const { error: updateError } = await supabaseAdmin
          .from('account_deletion_requests')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.id);
        
        if (updateError) throw updateError;
        
        // In a real implementation, this would be more comprehensive
        // and process actual user data deletion according to your policies
        console.log(`Processing deletion for user: ${request.user_id}`);
        
        // Simulate actual deletion processing with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mark the deletion request as completed
        const { error: completionError } = await supabaseAdmin
          .from('account_deletion_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.id);
        
        if (completionError) throw completionError;
        
        results.processed++;
        results.details.push({
          requestId: request.id,
          userId: request.user_id,
          success: true,
          message: 'Account deletion processed successfully'
        });
      } catch (requestError) {
        console.error(`Error processing deletion request ${request.id}:`, requestError);
        results.errors++;
        results.details.push({
          requestId: request.id,
          userId: request.user_id,
          success: false,
          error: requestError instanceof Error ? requestError.message : String(requestError)
        });
        
        // Update the request status to 'failed'
        await supabaseAdmin
          .from('account_deletion_requests')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            metadata: {
              error: requestError instanceof Error ? requestError.message : String(requestError),
              error_time: new Date().toISOString()
            }
          })
          .eq('id', request.id);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error processing deletion requests:', error);
    throw error;
  }
}

/**
 * Process pending data export requests
 */
async function processExportRequests(supabaseAdmin: any) {
  const results = {
    processed: 0,
    errors: 0,
    details: [] as any[],
  };
  
  try {
    // Find pending export requests
    const { data: pendingExports, error } = await supabaseAdmin
      .from('data_export_requests')
      .select('id, user_id, export_format, requested_at')
      .eq('status', 'pending');
    
    if (error) throw error;
    
    if (!pendingExports || pendingExports.length === 0) {
      console.log('No pending export requests to process');
      return results;
    }
    
    console.log(`Processing ${pendingExports.length} export requests...`);
    
    // Process each export request
    for (const request of pendingExports) {
      try {
        // Update the request status to 'processing'
        const { error: updateError } = await supabaseAdmin
          .from('data_export_requests')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.id);
        
        if (updateError) throw updateError;
        
        // In a real implementation, you would:
        // 1. Gather all relevant user data from different tables
        // 2. Format the data according to the requested format (JSON, CSV)
        // 3. Store it securely for download (e.g., in Supabase Storage)
        // 4. Send a notification to the user that their export is ready
        
        console.log(`Processing export for user: ${request.user_id}`);
        
        // Simulate processing time for the export
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For this example, we'll just mark it as completed
        const { error: completionError } = await supabaseAdmin
          .from('data_export_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            exported_file_size: Math.floor(Math.random() * 1000000), // Simulated file size
            exported_file_path: `exports/${request.user_id}/${request.id}.${request.export_format}`,
          })
          .eq('id', request.id);
        
        if (completionError) throw completionError;
        
        results.processed++;
        results.details.push({
          requestId: request.id,
          userId: request.user_id,
          success: true,
          format: request.export_format,
          message: 'Data export processed successfully'
        });
      } catch (requestError) {
        console.error(`Error processing export request ${request.id}:`, requestError);
        results.errors++;
        results.details.push({
          requestId: request.id,
          userId: request.user_id,
          success: false,
          error: requestError instanceof Error ? requestError.message : String(requestError)
        });
        
        // Update the request status to 'failed'
        await supabaseAdmin
          .from('data_export_requests')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            metadata: {
              error: requestError instanceof Error ? requestError.message : String(requestError),
              error_time: new Date().toISOString()
            }
          })
          .eq('id', request.id);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error processing export requests:', error);
    throw error;
  }
}

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