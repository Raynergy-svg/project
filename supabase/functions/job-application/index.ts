import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/email.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      linkedIn,
      portfolio,
      coverLetter,
      position,
      department,
      resumeFile, // Base64 encoded file
    } = body as JobApplication & { resumeFile: string };

    // Validate required fields
    if (!fullName || !email || !phone || !coverLetter || !position || !department) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let resumeUrl;
    if (resumeFile) {
      // Convert base64 to Uint8Array
      const base64Data = resumeFile.split(',')[1];
      const fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      // Upload resume to Supabase Storage
      const fileName = `${Date.now()}-${fullName.replace(/\s+/g, '-')}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(fileName, fileData, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) {
        throw new Error(`Failed to upload resume: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(fileName);

      resumeUrl = publicUrl;
    }

    // Store application in database
    const { data: application, error: dbError } = await supabase
      .from('job_applications')
      .insert([{
        full_name: fullName,
        email,
        phone,
        linkedin_url: linkedIn,
        portfolio_url: portfolio,
        cover_letter: coverLetter,
        position,
        department,
        resume_url: resumeUrl,
        status: 'pending',
        applied_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Send confirmation email to applicant
    await sendEmail({
      to: email,
      subject: `Application Received - ${position} at Smart Debt Flow`,
      html: `
        <h2>Thank you for your application!</h2>
        <p>Dear ${fullName},</p>
        <p>We have received your application for the ${position} position in our ${department} department.</p>
        <p>Our team will review your application and get back to you soon.</p>
        <p>Best regards,<br>Smart Debt Flow Hiring Team</p>
      `
    });

    // Send notification to hiring team
    await sendEmail({
      to: 'hiring@smartdebtflow.com',
      subject: `New Job Application - ${position}`,
      html: `
        <h2>New Job Application Received</h2>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Department:</strong> ${department}</p>
        <p><strong>Candidate:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        ${linkedIn ? `<p><strong>LinkedIn:</strong> ${linkedIn}</p>` : ''}
        ${portfolio ? `<p><strong>Portfolio:</strong> ${portfolio}</p>` : ''}
        ${resumeUrl ? `<p><strong>Resume:</strong> <a href="${resumeUrl}">Download</a></p>` : ''}
        <h3>Cover Letter:</h3>
        <p>${coverLetter}</p>
      `
    });

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
    console.error('Error processing application:', error);
    
    // Ensure error message is properly formatted
    const errorMessage = error instanceof Error ? error.message : 'Failed to process application';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  }
}); 