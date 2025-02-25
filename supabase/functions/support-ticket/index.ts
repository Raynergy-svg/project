import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";

const REQUIRED_ENV_VARS = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  SMTP_HOST: Deno.env.get('SMTP_HOST'),
  SMTP_PORT: Deno.env.get('SMTP_PORT'),
  SMTP_USER: Deno.env.get('SMTP_USER'),
  SMTP_PASS: Deno.env.get('SMTP_PASS')
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

interface SupportTicket {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  attachments?: string[];
}

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
    const ticket: SupportTicket = await req.json();

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'subject', 'message'];
    const missingFields = requiredFields.filter(field => !ticket[field as keyof SupportTicket]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: `The following fields are required: ${missingFields.join(', ')}`
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ticket.email)) {
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

    // Store support ticket in database
    const { data: storedTicket, error: dbError } = await supabase
      .from('support_tickets')
      .insert([{
        full_name: ticket.fullName,
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority || 'medium',
        category: ticket.category,
        attachments: ticket.attachments,
        status: 'open',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Error storing support ticket:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create support ticket',
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send confirmation emails
    try {
      await Promise.all([
        // Send confirmation to user
        sendEmail({
          to: ticket.email,
          from: 'no-reply@smartdebtflow.com',
          subject: `Support Ticket Received - ${ticket.subject}`,
          html: `
            <h2>Support Ticket Received</h2>
            <p>Dear ${ticket.fullName},</p>
            <p>We have received your support request. Our team will review it and get back to you as soon as possible.</p>
            <h3>Ticket Details:</h3>
            <ul>
              <li><strong>Ticket ID:</strong> ${storedTicket.id}</li>
              <li><strong>Subject:</strong> ${ticket.subject}</li>
              <li><strong>Priority:</strong> ${ticket.priority || 'medium'}</li>
              ${ticket.category ? `<li><strong>Category:</strong> ${ticket.category}</li>` : ''}
            </ul>
            <p>Your message:</p>
            <blockquote>${ticket.message}</blockquote>
            <p>Best regards,<br>Smart Debt Flow Support Team</p>
          `
        }),
        // Send notification to support team
        sendEmail({
          to: 'support@smartdebtflow.com',
          from: 'support@smartdebtflow.com',
          subject: `New Support Ticket - ${ticket.subject}`,
          html: `
            <h2>New Support Ticket</h2>
            <h3>Ticket Details:</h3>
            <ul>
              <li><strong>Ticket ID:</strong> ${storedTicket.id}</li>
              <li><strong>From:</strong> ${ticket.fullName} (${ticket.email})</li>
              <li><strong>Subject:</strong> ${ticket.subject}</li>
              <li><strong>Priority:</strong> ${ticket.priority || 'medium'}</li>
              ${ticket.category ? `<li><strong>Category:</strong> ${ticket.category}</li>` : ''}
            </ul>
            <h3>Message:</h3>
            <blockquote>${ticket.message}</blockquote>
            ${ticket.attachments?.length ? `
              <h3>Attachments:</h3>
              <ul>
                ${ticket.attachments.map(url => `<li><a href="${url}">View Attachment</a></li>`).join('')}
              </ul>
            ` : ''}
          `
        })
      ]);
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Log but don't fail the request
    }

    return new Response(
      JSON.stringify({ 
        message: 'Support ticket created successfully',
        ticketId: storedTicket.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing support ticket:', error);
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
