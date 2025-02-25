import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { checkSupabaseConnection } from '@/lib/supabase/client';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const position = searchParams.get('position') || '';
  const department = searchParams.get('department') || '';

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
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast({
          title: "Connection Error",
          description: "Unable to establish connection to our services. Please try again later.",
          variant: "destructive"
        });
        navigate('/careers');
      }
    };

    verifySupabaseConnection();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
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
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
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
      const functionUrl = `${supabaseUrl}/functions/v1/job-application`;

      // Send application
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          linkedIn: formData.linkedIn,
          portfolio: formData.portfolio,
          coverLetter: formData.coverLetter,
          position,
          department,
          resumeFile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const data = await response.json();
      console.log('Application submission response:', data);
      
      toast({
        title: "Application submitted",
        description: "We'll review your application and get back to you soon!",
        variant: "default"
      });

      navigate('/careers');
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
    if (!position || !department) {
      navigate('/careers');
    }
  }, [position, department, navigate]);

  if (!position || !department) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                Apply for {position}
              </span>
            </h1>
            <p className="text-gray-400">{department} Department</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-xl border border-white/10">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white min-h-[200px]"
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
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => navigate('/careers')}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 