import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, KeyIcon, UserPlus } from "lucide-react";
import DisabledCaptchaNotice from "../DisabledCaptchaNotice";

interface SignInFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
}

export function SignInForm({
  redirectPath = "/dashboard",
  onSuccess,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const from = router.query.from?.toString() || "/dashboard";

  // Always consider Turnstile disabled since we've moved it to the captcha folder
  const turnstileDisabled = true;

  // Validate email format to match what Supabase accepts
  const validateEmail = (email: string): boolean => {
    // Supabase seems to be accepting emails with format: name@domain-name.tld
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    // Validate form
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!password) {
      setEmailError("Password is required");
      return;
    }

    // In production, verify that Turnstile token exists
    if (!turnstileDisabled && !turnstileToken) {
      setEmailError("Please complete the verification challenge");
      return;
    }

    try {
      setIsLoading(true);

      const result = await login(email, password);

      if (result?.error) {
        console.error("Login error:", result.error);

        // Use a simpler approach to avoid TypeScript errors
        let errorMessage: string;

        if (typeof result.error === "string") {
          // If it's already a string, use it directly
          errorMessage = result.error;
        } else {
          // For any other type, use a generic error message
          errorMessage =
            "Authentication failed. Please check your credentials and try again.";
        }

        setEmailError(errorMessage);
        return;
      }

      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setEmailError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setEmailError("");
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    setEmailError("Verification failed. Please try again.");
  };

  return (
    <div className="auth-form-container">
      <h2 className="form-title">Sign In</h2>

      {emailError && (
        <div className="error-message" role="alert">
          {emailError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
            required
          />
        </div>

        {/* Turnstile Captcha - replaced with DisabledCaptchaNotice */}
        {!turnstileDisabled && (
          <div className="captcha-container">
            <DisabledCaptchaNotice
              onVerify={handleTurnstileVerify}
              className="mt-2"
            />
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || (!turnstileDisabled && !turnstileToken)}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="auth-links">
        <Link
          href="/forgot-password"
          className="flex items-center gap-1 text-white hover:text-gray-300 hover:underline"
        >
          <KeyIcon size={16} />
          <span>Forgot password?</span>
        </Link>
        <span className="divider">•</span>
        <Link
          href="/signup"
          className="flex items-center gap-1 text-white hover:text-gray-300 hover:underline"
        >
          <UserPlus size={16} />
          <span>Need an account? Sign up</span>
        </Link>
      </div>
    </div>
  );
}
