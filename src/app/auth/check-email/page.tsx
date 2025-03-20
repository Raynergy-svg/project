"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const { resendConfirmationEmail } = useAuth();
  
  const handleResendEmail = async () => {
    if (!email) return;
    
    try {
      await resendConfirmationEmail(email);
      // Show success message - could be implemented with toast
    } catch (error) {
      console.error("Error resending email:", error);
      // Show error message - could be implemented with toast
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="mx-auto w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1 items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              {email ? (
                <>
                  We've sent a confirmation link to <strong>{email}</strong>
                </>
              ) : (
                "We've sent you a confirmation email"
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-0">
            <Alert>
              <AlertDescription>
                Please check your email and click the confirmation link to complete your registration.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={handleResendEmail}
            >
              Didn't receive an email? Click to resend
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/auth/signin" className="text-primary hover:text-primary/80">
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
