import { useState, useRef } from "react";
import { useNavigate } from '@/empty-module';
import { useAuth } from "../../contexts/AuthContext";
import DisabledCaptchaNotice from "../DisabledCaptchaNotice";
import CelebrationEffect from "../effects/CelebrationEffect";
import "../../styles/auth-forms.css";

interface SignUpFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
}

export function SignUpForm({
  redirectPath = "/dashboard",
  onSuccess,
}: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    acceptTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { signup } = useAuth();

  // Always consider Turnstile disabled since we've moved it to the captcha folder
  const turnstileDisabled = true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.email) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.acceptTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    // In production, verify that Turnstile token exists
    if (!turnstileDisabled && !turnstileToken) {
      setError("Please complete the verification challenge");
      return;
    }

    try {
      setIsLoading(true);

      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      if (result?.error) {
        console.error("Signup error:", result.error);
        setError(
          typeof result.error === "string"
            ? result.error
            : result.error.message || "Failed to sign up"
        );
        return;
      }

      // Add form success animation
      if (formContainerRef.current) {
        formContainerRef.current.classList.add("form-success-animation");
      }

      // Show celebration effect!
      setShowCelebration(true);

      // Delay navigation to dashboard to allow celebrations to finish
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectPath);
        }
      }, 2500);
    } catch (error) {
      console.error("Error during sign up:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setError(null);
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    setError("Verification failed. Please try again.");
  };

  const handleCelebrationComplete = () => {
    // After celebration, we'll make sure loading state is reset if needed
    setShowCelebration(false);
    setIsLoading(false);
  };

  return (
    <div className="signup-container" ref={formContainerRef}>
      <h2 className="auth-title">Create Your Account</h2>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="checkbox-wrapper">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={handleChange}
            required
          />
          <label htmlFor="acceptTerms">
            I agree to the <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>
          </label>
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
          className="auth-button"
          disabled={isLoading || (!turnstileDisabled && !turnstileToken)}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="auth-links">
        Already have an account? <a href="/signin">Sign In</a>
      </div>

      {/* Celebration effect when signup is successful */}
      {showCelebration && (
        <CelebrationEffect onComplete={handleCelebrationComplete} />
      )}
    </div>
  );
}

export default SignUpForm;
