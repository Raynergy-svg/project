import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react";

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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Validating your reset link...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  // Show error if token is invalid
  if (!isTokenValid && !isValidating) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              The password reset link you clicked is no longer valid. This may be because:
              <ul className="list-disc pl-5 mt-2">
                <li>The link has expired (links are valid for 1 hour)</li>
                <li>The link has already been used</li>
                <li>The link was modified</li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Link to="/forgot-password">
              <Button>
                Request a new reset link
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {isSuccess 
            ? "Your password has been successfully reset" 
            : "Create a new password for your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-lg font-medium">
                Password Reset Successful
              </p>
              <p className="text-center text-gray-500 mt-2">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>
            <div className="flex justify-center">
              <Link to="/login">
                <Button className="mt-4">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? "border-red-500" : ""}
                required
                data-testid="password-input"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1" data-testid="password-error">{passwordError}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={confirmPasswordError ? "border-red-500" : ""}
                required
                data-testid="confirm-password-input"
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1" data-testid="confirm-password-error">{confirmPasswordError}</p>
              )}
            </div>
            
            <Alert variant="outline" className="bg-blue-50">
              <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
              <AlertDescription>
                Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.
              </AlertDescription>
            </Alert>
            
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
              {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 