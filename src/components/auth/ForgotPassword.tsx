import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeftIcon, Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DisabledCaptchaNotice from "../DisabledCaptchaNotice";

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Always consider Turnstile disabled since we've moved it to the captcha folder
  const turnstileDisabled = true;

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const validFormat =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      setEmailError("Email is required");
      return false;
    }

    if (!validFormat.test(email)) {
      setEmailError(
        "Please enter a valid email format (e.g., user@domain-name.com)"
      );
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

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setEmailError("");
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    setEmailError("Verification failed. Please try again.");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate email before submitting
    if (!validateEmail(email)) {
      return;
    }

    // In production, verify that Turnstile token exists
    if (!turnstileDisabled && !turnstileToken) {
      setEmailError("Please complete the verification challenge");
      return;
    }

    setIsLoading(true);

    try {
      // Call the forgot password endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/functions/v1/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, turnstileToken }),
        }
      );

      const data: ForgotPasswordResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to process request"
        );
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Email Sent",
        description:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process your request. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#121212]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-[#88B04B]/10 flex items-center justify-center rounded-full mb-4">
            <Lock className="text-[#88B04B] w-6 h-6" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 mt-8">
            <Alert className="bg-[#88B04B]/10 border-[#88B04B]/20">
              <AlertDescription className="text-white">
                Password reset instructions have been sent to your email. Please
                check your inbox and follow the instructions to reset your
                password.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="mt-4 text-white bg-transparent border-white/20 hover:bg-white/5"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={handleEmailChange}
                className="w-full"
                required
                data-testid="email-input"
              />
              {emailError && (
                <p
                  className="text-red-500 text-sm mt-1"
                  data-testid="email-error"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Turnstile Captcha - replaced with DisabledCaptchaNotice */}
            {!turnstileDisabled && (
              <div className="mb-4">
                <DisabledCaptchaNotice
                  onVerify={handleTurnstileVerify}
                  className="mt-2"
                />
              </div>
            )}

            <Alert className="bg-white/5 border-white/10">
              <InfoIcon className="h-4 w-4 text-white mr-2" />
              <AlertDescription className="text-white">
                If an account exists with this email, you will receive password
                reset instructions.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
                disabled={isLoading || (!turnstileDisabled && !turnstileToken)}
                data-testid="submit-button"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
              </Button>
              <Link
                href="/login"
                className="text-center text-sm text-white hover:text-gray-300"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
