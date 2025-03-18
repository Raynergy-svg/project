import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/email.ts';

// Validate environment variables
const requiredEnvVars = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  SMTP_HOST: Deno.env.get('SMTP_HOST'),
  SMTP_PORT: Deno.env.get('SMTP_PORT'),
  SMTP_USER: Deno.env.get('SMTP_USER'),
  SMTP_PASS: Deno.env.get('SMTP_PASS')
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

interface JobApplication {
  fullName: string;
  email: string;
  phone: string;
  linkedIn?: string;
  portfolio?: string;
  coverLetter: string;
  position: string;
  department: string;
  resumeUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { fullName, email, phone, linkedIn, portfolio, coverLetter, position, department, resumeUrl } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Store application in database
    const { error: dbError } = await supabaseClient
      .from('job_applications')
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          linkedin_url: linkedIn,
          portfolio_url: portfolio,
          cover_letter: coverLetter,
          position: position,
          department: department,
          resume_url: resumeUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }
      ]);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Send confirmation email to applicant
    await sendEmail({
      to: email,
      from: 'hiring@smartdebtflow.com',
      subject: `Application Received - ${position} at Smart Debt Flow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Received</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for applying for the ${position} position at Smart Debt Flow. We've received your application and are excited to review it.</p>
          <h3 style="color: #374151;">Application Details:</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li><strong>Position:</strong> ${position}</li>
            <li><strong>Department:</strong> ${department}</li>
            <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <h3 style="color: #374151;">Next Steps:</h3>
          <p>Our hiring team will carefully review your application. If your qualifications match our requirements, we'll contact you to schedule an interview.</p>
          <p>The typical review process takes 5-7 business days. We appreciate your patience during this time.</p>
          <p style="color: #6b7280; font-style: italic;">Please note: This is an automated confirmation. If you need to contact us, please reply to this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151;">Best regards,<br>Smart Debt Flow Hiring Team</p>
          </div>
        </div>
      `
    });

    // Send notification to hiring team
    await sendEmail({
      to: 'hiring@smartdebtflow.com',
      subject: `New Job Application - ${position}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Job Application Received</h2>
          <h3 style="color: #374151;">Application Details:</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li><strong>Position:</strong> ${position}</li>
            <li><strong>Department:</strong> ${department}</li>
            <li><strong>Candidate:</strong> ${fullName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            ${linkedIn ? `<li><strong>LinkedIn:</strong> ${linkedIn}</li>` : ''}
            ${portfolio ? `<li><strong>Portfolio:</strong> ${portfolio}</li>` : ''}
            ${resumeUrl ? `<li><strong>Resume:</strong> ${resumeUrl}</li>` : ''}
          </ul>
          <h3 style="color: #374151;">Cover Letter:</h3>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px;">
            <p style="white-space: pre-wrap;">${coverLetter}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/applications" 
               style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              Review Application
            </a>
          </div>
        </div>
      `
    });

    return new Response(
      JSON.stringify({ message: 'Application submitted successfully' }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing application:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request' 
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    );
  }
}); 