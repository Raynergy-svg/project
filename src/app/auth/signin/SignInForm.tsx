"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { login, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Load remembered email if available
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (failedAttempts >= 3) {
      setFormErrors({
        general: "Too many failed attempts. Please try again in 30 seconds.",
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("remembered_email", formData.email);
        } else {
          localStorage.removeItem("remembered_email");
        }
        router.push(redirect);
      } else {
        setFormErrors({ general: result.error || "Authentication failed" });
        setFailedAttempts((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Login error:", error);
      setFormErrors({
        general:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
      setFailedAttempts((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || authLoading || failedAttempts >= 3;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {formErrors.general && (
        <Alert variant="destructive">
          <AlertDescription>{formErrors.general}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter your email"
            className="mt-1"
            error={formErrors.email}
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter your password"
              className="mt-1"
              error={formErrors.password}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isButtonDisabled}>
        {isSubmitting || authLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-primary hover:text-primary/80 font-medium"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
