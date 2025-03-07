import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Validate email format to match what Supabase accepts
  const validateEmail = (email: string): boolean => {
    // Supabase seems to be accepting emails with format: name@domain-name.tld
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
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className={emailError ? "border-red-500" : ""}
          required
          aria-label="Email"
        />
        {emailError && (
          <p className="text-red-500 text-sm mt-1" role="error-message">{emailError}</p>
        )}
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Password"
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
            Forgot password?
          </Link>
        </div>
      </div>
      
      <Alert variant="outline" className="bg-blue-50">
        <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
        <AlertDescription>
          Use an email format like: user@domain-name.com
        </AlertDescription>
      </Alert>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div data-testid="loading-spinner">
            <LoadingSpinner className="w-4 h-4" />
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
