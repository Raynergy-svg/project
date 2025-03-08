import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeftIcon, CheckCircleIcon, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

interface ResetPasswordResponse {
  message?: string;
  error?: string;
  details?: string;
}

export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token");

  // Validate token on component mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/functions/v1/validate-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Invalid or expired token');
        }

        setIsTokenValid(true);
      } catch (error) {
        console.error('Error validating token:', error);
        toast({
          variant: "destructive",
          title: "Invalid Reset Link",
          description: error instanceof Error
            ? error.message
            : "This password reset link is invalid or has expired. Please request a new one.",
        });
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token, toast]);

  // Validate password
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setPasswordError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Validate confirm password
  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }

    setConfirmPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) validatePassword(newPassword);
    if (confirmPassword) validateConfirmPassword(confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (newConfirmPassword) validateConfirmPassword(newConfirmPassword);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs before submitting
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the reset password endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data: ResetPasswordResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been successfully reset. You can now log in with your new password.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error
          ? error.message
          : "Failed to reset your password. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#121212]">
        <div className="w-full max-w-md space-y-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#88B04B]/10 flex items-center justify-center rounded-full">
            <Lock className="text-[#88B04B] w-6 h-6" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Validating your reset link...
          </p>
          <div className="mt-8">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isTokenValid && !isValidating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#121212]">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-red-900/20 flex items-center justify-center rounded-full mb-4">
              <AlertCircle className="text-red-500 w-6 h-6" />
            </div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-white">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="mt-8">
            <Alert className="bg-red-900/20 border-red-900/30 mb-6">
              <AlertDescription className="text-white">
                The password reset link you clicked is no longer valid. This may be because:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>The link has expired (links are valid for 1 hour)</li>
                  <li>The link has already been used</li>
                  <li>The link was modified</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Link to="/forgot-password">
                <Button className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white">
                  Request a new reset link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#121212]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-[#88B04B]/10 flex items-center justify-center rounded-full mb-4">
            {isSuccess ? (
              <CheckCircleIcon className="text-[#88B04B] w-6 h-6" />
            ) : (
              <Lock className="text-[#88B04B] w-6 h-6" />
            )}
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            {isSuccess ? "Password Reset Complete" : "Create New Password"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isSuccess
              ? "Your password has been successfully updated"
              : "Create a strong password that you don't use elsewhere"}
          </p>
        </div>

        {isSuccess ? (
          <div className="mt-8 space-y-6">
            <Alert className="bg-[#88B04B]/10 border-[#88B04B]/20">
              <CheckCircleIcon className="h-5 w-5 text-[#88B04B] mr-2" />
              <AlertDescription className="text-white">
                Your password has been successfully reset. You can now log in with your new password.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center mt-4">
              <Link to="/login">
                <Button className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white min-w-32">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="new-password" className="block text-sm font-medium text-white">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-white">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
              )}
            </div>

            <Alert className="bg-white/5 border-white/10">
              <InfoIcon className="h-4 w-4 text-white mr-2" />
              <AlertDescription className="text-white">
                Your password must be at least 8 characters long and include at least one uppercase letter,
                one lowercase letter, and one number.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
} 