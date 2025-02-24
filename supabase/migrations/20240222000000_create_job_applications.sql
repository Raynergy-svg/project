-- Create enum for application status
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'interviewed', 'offered', 'rejected', 'accepted', 'withdrawn');

-- Create job applications table
CREATE TABLE job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    linkedin_url TEXT,
    portfolio_url TEXT,
    cover_letter TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    resume_url TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    interviewer_id UUID REFERENCES auth.users(id),
    interview_feedback TEXT,
    interview_date TIMESTAMPTZ
);

-- Create index on email for faster lookups
CREATE INDEX job_applications_email_idx ON job_applications(email);

-- Create index on status for filtering
CREATE INDEX job_applications_status_idx ON job_applications(status);

-- Create index on position for filtering
CREATE INDEX job_applications_position_idx ON job_applications(position);

-- Add row level security policies
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policy for inserting applications (anyone can apply)
CREATE POLICY "Anyone can submit an application"
    ON job_applications FOR INSERT
    WITH CHECK (true);

-- Policy for viewing applications (only authenticated users with hiring role)
CREATE POLICY "Hiring team can view applications"
    ON job_applications FOR SELECT
    USING (auth.jwt() ->> 'role' = 'hiring');

-- Policy for updating applications (only authenticated users with hiring role)
CREATE POLICY "Hiring team can update applications"
    ON job_applications FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'hiring');

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);

-- Add storage policies
CREATE POLICY "Anyone can upload resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Resumes are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 