import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, KeyIcon, UserPlus } from "lucide-react";
import TurnstileCaptcha from '../TurnstileCaptcha';
import { isTurnstileDisabled } from '../../utils/turnstile';

interface SignInFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
}

export function SignInForm({ redirectPath = '/dashboard', onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const turnstileDisabled = isTurnstileDisabled();

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
        console.error('Login error:', result.error);
        setEmailError(typeof result.error === 'string' 
          ? result.error 
          : result.error.message || 'Failed to sign in');
        return;
      }
      
      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Error during sign in:', error);
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
        
        {/* Turnstile Captcha */}
        {!turnstileDisabled && (
          <div className="form-group captcha-container">
            <TurnstileCaptcha
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              action="login"
              theme="auto"
            />
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading || (!turnstileDisabled && !turnstileToken)}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-links">
        <Link 
          to="/forgot-password" 
          className="flex items-center gap-1 text-white hover:text-gray-300 hover:underline"
        >
          <KeyIcon size={16} />
          <span>Forgot password?</span>
        </Link>
        <span className="divider">•</span>
        <Link 
          to="/signup" 
          className="flex items-center gap-1 text-white hover:text-gray-300 hover:underline"
        >
          <UserPlus size={16} />
          <span>Need an account? Sign up</span>
        </Link>
      </div>
    </div>
  );
}
