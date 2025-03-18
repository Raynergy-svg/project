"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/utils/supabase/client";
import { checkSupabaseConnection } from "@/utils/supabase/connectionStatus";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  coverLetter: string;
  resume: File | null;
}

export default function JobApplicationPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const position = searchParams.get("position") || "";
  const department = searchParams.get("department") || "";

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    coverLetter: "",
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
          description:
            "Unable to connect to our servers. Please try again later.",
          variant: "destructive",
        });
      }
    };

    verifySupabaseConnection();
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const requiredFields = ["fullName", "email", "phone", "coverLetter"];
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof FormData]
      );

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Upload resume if present
      let resumeUrl = "";
      if (formData.resume) {
        const fileExt = formData.resume.name.split(".").pop();
        const fileName = `${Date.now()}-${formData.fullName.replace(
          /[^a-z0-9]/gi,
          "_"
        )}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("resumes")
          .upload(fileName, formData.resume);

        if (uploadError) throw uploadError;
        resumeUrl = data.path;
      }

      // Get the Supabase auth token for the Edge Function
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Call the job application Edge Function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/job-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          credentials: "include",
          mode: "cors",
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            linkedIn: formData.linkedIn,
            portfolio: formData.portfolio,
            coverLetter: formData.coverLetter,
            position,
            department,
            resumeUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to submit application",
        }));
        throw new Error(errorData.message);
      }

      toast({
        title: "Application Submitted Successfully",
        description:
          "Thank you for your interest! We've sent you a confirmation email with next steps.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        linkedIn: "",
        portfolio: "",
        coverLetter: "",
        resume: null,
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Error",
        description:
          "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Apply for {position}</h1>
            <p className="text-xl text-muted-foreground">
              {department} Department
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                <Input
                  id="linkedIn"
                  name="linkedIn"
                  type="url"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio/Website</Label>
                <Input
                  id="portfolio"
                  name="portfolio"
                  type="url"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="resume">Resume</Label>
                <Input
                  id="resume"
                  name="resume"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Max file size: 5MB. Accepted formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
