import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeftIcon } from "lucide-react";

interface ForgotPasswordResponse {
  message?: string;
  error?: string;
  details?: string;
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const validFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    
    if (!validFormat.test(email)) {
      setEmailError("Please enter a valid email format (e.g., user@domain-name.com)");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) validateEmail(newEmail);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate email before submitting
    if (!validateEmail(email)) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Call the forgot password endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/functions/v1/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: ForgotPasswordResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to process request');
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to process your request. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you instructions to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <Alert variant="success" className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Password reset instructions have been sent to your email.
                Please check your inbox and follow the instructions to reset your password.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Link to="/login">
                <Button variant="outline" className="mt-4">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={emailError ? "border-red-500" : ""}
                required
                data-testid="email-input"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1" data-testid="email-error">{emailError}</p>
              )}
            </div>
            
            <Alert variant="outline" className="bg-blue-50">
              <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
              <AlertDescription>
                If an account exists with this email, you will receive password reset instructions.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
                {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
              </Button>
              <Link to="/login" className="text-center text-sm text-gray-500 hover:text-gray-700">
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 