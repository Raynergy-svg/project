import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
}

interface ConsentRecord extends ConsentPreferences {
  consentVersion: string;
  timestamp?: string;
  userAgent: string;
}

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
    
    // Handle GET request for retrieving user's cookie consent preferences
    if (method === 'GET') {
      const { data, error } = await supabaseClient
        .from('cookie_consent_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      
      // Return the preferences or default values if none exist
      const preferences = data || {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
        third_party: false,
        consent_version: '1.0',
      };
      
      return new Response(JSON.stringify({
        preferences: {
          necessary: preferences.necessary,
          functional: preferences.functional,
          analytics: preferences.analytics,
          marketing: preferences.marketing,
          thirdParty: preferences.third_party,
          consentVersion: preferences.consent_version,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Handle POST request for storing cookie consent preferences
    if (method === 'POST') {
      const { consentData } = await req.json();
      
      if (!consentData) {
        return new Response(JSON.stringify({ error: 'Bad Request', message: 'Missing consent data' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      // Prepare data for insertion
      const { necessary, functional, analytics, marketing, thirdParty, consentVersion, userAgent } = consentData;
      
      // Get client IP address for audit trail
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
      
      // Insert into cookie_consent_preferences table
      const { data: cookiePrefs, error: cookiePrefError } = await supabaseClient
        .from('cookie_consent_preferences')
        .upsert({
          user_id: user.id,
          necessary: necessary,
          functional: functional,
          analytics: analytics,
          marketing: marketing,
          third_party: thirdParty,
          consent_version: consentVersion,
          ip_address: ipAddress,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (cookiePrefError) {
        return new Response(JSON.stringify({ error: cookiePrefError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      
      // Record each type of consent in the user_consent_records table
      const consentTypes = [
        { type: 'cookies.necessary', value: necessary },
        { type: 'cookies.functional', value: functional },
        { type: 'cookies.analytics', value: analytics },
        { type: 'cookies.marketing', value: marketing },
        { type: 'cookies.third_party', value: thirdParty },
      ];
      
      // Use the record_user_consent function for each consent type
      for (const consent of consentTypes) {
        const { data, error } = await supabaseClient.rpc('record_user_consent', {
          p_user_id: user.id,
          p_consent_type: consent.type,
          p_consent_given: consent.value,
          p_consent_version: consentVersion,
          p_consent_method: 'cookie_banner',
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
          p_metadata: {}
        });
        
        if (error) {
          console.error(`Error recording consent for ${consent.type}:`, error);
          // Continue with other consents even if one fails
        }
      }
      
      return new Response(JSON.stringify({ 
        message: 'Consent preferences saved successfully',
        userId: user.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // If not GET or POST, return method not allowed
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