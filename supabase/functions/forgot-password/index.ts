import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

const REQUIRED_ENV_VARS = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  SMTP_HOST: Deno.env.get('SMTP_HOST'),
  SMTP_PORT: Deno.env.get('SMTP_PORT'),
  SMTP_USER: Deno.env.get('SMTP_USER'),
  SMTP_PASS: Deno.env.get('SMTP_PASS'),
  TURNSTILE_SECRET_KEY: Deno.env.get('TURNSTILE_SECRET_KEY')
};

const missingVars = Object.entries(REQUIRED_ENV_VARS)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const supabase = createClient(
  REQUIRED_ENV_VARS.SUPABASE_URL!,
  REQUIRED_ENV_VARS.SUPABASE_SERVICE_ROLE_KEY!
);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: `Method ${req.method} not allowed`,
          details: 'Only POST method is allowed for this endpoint'
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const { email, turnstileToken } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field',
          details: 'Email is required'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email format',
          details: 'Please provide a valid email address'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify Turnstile token if provided and in production environment
    if (turnstileToken && Deno.env.get('ENVIRONMENT') !== 'development') {
      const turnstileVerification = await verifyTurnstileToken(turnstileToken);
      
      if (!turnstileVerification.success) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid verification',
            details: 'Human verification failed. Please try again.'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    // We'll continue even if the user is not found, to prevent email enumeration attacks
    // But we'll log the error for our records
    if (userError) {
      console.log('User not found for password reset:', email);
      
      // For security, we'll still return a success response
      return new Response(
        JSON.stringify({ 
          message: 'Password reset instructions sent',
          details: 'If this email is registered, you will receive instructions to reset your password'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate password reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store reset token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert([{
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      }]);

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          details: 'Failed to process password reset request'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send password reset email
    const resetUrl = `${new URL(req.url).origin}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      from: 'no-reply@smartdebtflow.com',
      subject: 'Password Reset Request - Smart Debt Flow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${new URL(req.url).origin}/logo.png" alt="Smart Debt Flow Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. To create a new password, click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Your Password</a>
          </div>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn't request this password reset, you can safely ignore this email. Your account security is important to us, and your password will remain unchanged.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Smart Debt Flow. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `
    });

    return new Response(
      JSON.stringify({ 
        message: 'Password reset instructions sent',
        details: 'Please check your email for further instructions'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing password reset:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
