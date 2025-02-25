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

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = createClient(
    requiredEnvVars.SUPABASE_URL!,
    requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw new Error('Supabase configuration error');
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
  resumeFile?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error: authError } = await supabase.auth.getUser(req);
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    // Log request details
    const requestHeaders = Object.fromEntries(req.headers.entries());
    console.log('Received job application request:', {
      method: req.method,
      url: req.url,
      headers: {
        ...requestHeaders,
        authorization: requestHeaders.authorization ? '[REDACTED]' : undefined,
        apikey: requestHeaders.apikey ? '[REDACTED]' : undefined
      }
    });

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

    // Validate authorization
    const authHeader = req.headers.get('authorization');
    const apiKey = req.headers.get('apikey');

    if (!authHeader || !apiKey) {
      console.error('Missing authorization headers:', {
        hasAuthHeader: !!authHeader,
        hasApiKey: !!apiKey
      });
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          details: 'Missing required authorization headers'
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    let body: JobApplication;
    try {
      body = await req.json();
      console.log('Parsed request body:', {
        ...body,
        resumeFile: body.resumeFile ? '[Base64 content truncated]' : undefined,
        coverLetter: body.coverLetter ? body.coverLetter.substring(0, 100) + '...' : undefined
      });
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: error instanceof Error ? error.message : 'Could not parse JSON body'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'coverLetter', 'position', 'department'];
    const missingFields = requiredFields.filter(field => !body[field as keyof JobApplication]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
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
    if (!emailRegex.test(body.email)) {
      console.error('Invalid email format:', body.email);
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

    let resumeUrl;
    if (body.resumeFile) {
      try {
        // Extract and validate base64 data
        const base64Match = body.resumeFile.match(/^data:(.+);base64,(.+)$/);
        if (!base64Match) {
          throw new Error('Invalid resume file format: missing data URI scheme');
        }

        const [, contentType, base64Data] = base64Match;
        if (contentType !== 'application/pdf') {
          throw new Error(`Invalid resume file type: expected application/pdf, got ${contentType}`);
        }

        // Convert base64 to Uint8Array
        const fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload resume to Supabase Storage
        const fileName = `${Date.now()}-${body.fullName.replace(/\s+/g, '-')}.pdf`;
        console.log('Uploading resume:', { fileName, contentType });

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('resumes')
          .upload(fileName, fileData, {
            contentType: 'application/pdf',
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Failed to upload resume:', uploadError);
          throw new Error(`Failed to upload resume: ${uploadError.message}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
        console.log('Resume uploaded successfully:', { fileName, publicUrl });
      } catch (error) {
        console.error('Error processing resume:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to process resume',
            details: error instanceof Error ? error.message : 'Unknown error processing resume file'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Store application in database
    console.log('Storing application in database');
    const { data: application, error: dbError } = await supabase
      .from('job_applications')
      .insert([{
        full_name: body.fullName,
        email: body.email,
        phone: body.phone,
        linkedin_url: body.linkedIn,
        portfolio_url: body.portfolio,
        cover_letter: body.coverLetter,
        position: body.position,
        department: body.department,
        resume_url: resumeUrl,
        status: 'pending',
        applied_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store application',
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Application stored successfully:', application);

    // Send confirmation emails
    try {
      await Promise.all([
        // Send confirmation to applicant
        sendEmail({
          to: body.email,
          subject: `Application Received - ${body.position} at Smart Debt Flow`,
          html: `
            <h2>Thank you for your application!</h2>
            <p>Dear ${body.fullName},</p>
            <p>We have received your application for the ${body.position} position in our ${body.department} department.</p>
            <p>Our team will review your application and get back to you soon.</p>
            <p>Best regards,<br>Smart Debt Flow Hiring Team</p>
          `
        }),
        // Send notification to hiring team
        sendEmail({
          to: 'hiring@smartdebtflow.com',
          subject: `New Job Application - ${body.position}`,
          html: `
            <h2>New Job Application Received</h2>
            <p><strong>Position:</strong> ${body.position}</p>
            <p><strong>Department:</strong> ${body.department}</p>
            <p><strong>Candidate:</strong> ${body.fullName}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Phone:</strong> ${body.phone}</p>
            ${body.linkedIn ? `<p><strong>LinkedIn:</strong> ${body.linkedIn}</p>` : ''}
            ${body.portfolio ? `<p><strong>Portfolio:</strong> ${body.portfolio}</p>` : ''}
            ${resumeUrl ? `<p><strong>Resume:</strong> <a href="${resumeUrl}">Download</a></p>` : ''}
            <h3>Cover Letter:</h3>
            <p>${body.coverLetter}</p>
          `
        })
      ]);
      console.log('Confirmation emails sent successfully');
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      // Log but don't fail the request
    }

    return new Response(
      JSON.stringify({ 
        message: 'Application submitted successfully',
        applicationId: application.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing job application:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 