import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/utils/supabase/client';
import { checkSupabaseConnection } from '@/utils/supabase/connectionStatus';
import { Layout } from '@/components/layout/Layout';
import Head from 'next/head';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  coverLetter: string;
  resume: File | null;
}

export default function JobApplication() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { position, department } = router.query;
  const positionTitle = typeof position === 'string' ? position : '';
  const departmentName = typeof department === 'string' ? department : '';

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    portfolio: '',
    coverLetter: '',
    resume: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check Supabase connection on component mount
  useEffect(() => {
    const verifySupabaseConnection = async () => {
      const status = await checkSupabaseConnection();
      if (!status.isConnected) {
        toast({
          title: "Connection Error",
          description: "Unable to establish connection to our services. Please try again later.",
          variant: "destructive"
        });
      }
    };

    verifySupabaseConnection();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.includes('pdf')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Resume file must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verify Supabase connection again before submission
      const status = await checkSupabaseConnection();
      if (!status.isConnected) {
        throw new Error('Unable to connect to our services. Please try again later.');
      }

      // Convert resume to base64
      let resumeFile = '';
      if (formData.resume) {
        const reader = new FileReader();
        resumeFile = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(formData.resume as Blob);
        });
      } else {
        throw new Error('Resume file is required');
      }

      // Get function URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL configuration is missing');
      }

      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseAnonKey) {
        throw new Error('Supabase anon key is missing');
      }

      // Directly call the function using Supabase client instead of fetch
      const { data, error } = await supabase.functions.invoke('job-application', {
        body: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          linkedIn: formData.linkedIn,
          portfolio: formData.portfolio,
          coverLetter: formData.coverLetter,
          position: positionTitle,
          department: departmentName,
          resumeFile,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit application');
      }

      console.log('Application submission response:', data);
      
      toast({
        title: "Application submitted",
        description: "We'll review your application and get back to you soon!",
        variant: "default"
      });

      router.push('/careers');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if no position is specified
  useEffect(() => {
    if (router.isReady && (!positionTitle || !departmentName)) {
      router.push('/careers');
    }
  }, [positionTitle, departmentName, router.isReady, router]);

  if (!router.isReady || !positionTitle || !departmentName) {
    // Return a loading state instead of null while redirect happens
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Layout
      title={`Apply for ${positionTitle} - Smart Debt Flow`}
      description={`Apply for the ${positionTitle} position in our ${departmentName} department.`}
    >
      <Head>
        <meta property="og:title" content={`Apply for ${positionTitle} - Smart Debt Flow`} />
        <meta
          property="og:description"
          content={`Apply for the ${positionTitle} position in our ${departmentName} department at Smart Debt Flow.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://smartdebtflow.com/JobApplication?position=${encodeURIComponent(positionTitle)}&department=${encodeURIComponent(departmentName)}`} />
      </Head>
      
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Apply for {positionTitle}
                </span>
              </h1>
              <p className="text-muted-foreground">{departmentName} Department</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-input"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedIn"
                    name="linkedIn"
                    type="url"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    className="bg-background border-input"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio/Website (Optional)</Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="bg-background border-input"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-input min-h-[200px]"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  />
                </div>

                <div>
                  <Label htmlFor="resume">Resume (PDF, max 5MB)</Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => router.push('/careers')}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 