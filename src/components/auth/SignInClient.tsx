"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter as useNextRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { checkSupabaseConnection, devSignIn } from "@/utils/supabase/client";
import { IS_DEV } from "@/utils/environment";
import { useNavigate } from "@/empty-module";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface SignInClientProps {
  redirect?: string;
  needsConfirmation?: string;
}

// Add BackgroundAnimation component
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="absolute h-full w-full bg-gradient-to-br from-primary/20 via-primary/[0.05] to-background blur-3xl" />
      </div>
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/30 rounded-full blur-xl"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function SignInClient({
  redirect = "/dashboard",
  needsConfirmation,
}: SignInClientProps) {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const nextRouter = useNextRouter();
  const navigate = useNavigate();
  const router = {
    push: (path: string) => {
      if (typeof navigate === "function") {
        navigate(path);
      } else {
        nextRouter.push(path);
      }
    },
  };

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    error: string | null;
  } | null>(null);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus({
          isConnected,
          error: isConnected
            ? null
            : "Failed to connect to authentication service",
        });
      } catch (error) {
        setConnectionStatus({
          isConnected: false,
          error: "Failed to connect to authentication service",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Enhanced redirect handling after successful authentication
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirect || "/dashboard");
    }
  }, [isAuthenticated, authLoading, router, redirect]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setFormErrors({});

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (rememberMe && typeof window !== "undefined") {
          localStorage.setItem("remembered_email", formData.email);
        }
        router.push(redirect || "/dashboard");
      } else {
        setFormErrors({ general: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setFormErrors({
        general: "Invalid email or password. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Render error message for a field
  const renderErrorMessage = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName] ? (
      <div className="text-sm text-red-500 mt-1">{formErrors[fieldName]}</div>
    ) : null;
  };

  // Development sign in
  const [isDevSigningIn, setIsDevSigningIn] = useState(false);

  const handleDevSignIn = async (role: "admin" | "user") => {
    if (!IS_DEV) return;

    setIsDevSigningIn(true);
    setIsLoading(true);
    setFormErrors({});

    try {
      const email = role === "admin" ? "admin@example.com" : "user@example.com";
      const password = "password123";

      console.log(`🔑 Attempting dev sign-in as ${role}`);
      const { data, error } = await devSignIn(email, password);

      if (error) {
        console.error("Dev sign-in error:", error);
        setFormErrors({
          general: `Dev sign-in failed: ${error.message}`,
        });
        return;
      }

      if (data?.user) {
        console.log("🎉 Dev sign-in successful");
        router.push(redirect || "/dashboard");
      } else {
        setFormErrors({
          general: "Dev sign-in failed: No user data returned",
        });
      }
    } catch (error) {
      console.error("Dev sign-in error:", error);
      setFormErrors({
        general: "Dev sign-in failed: Unexpected error",
      });
    } finally {
      setIsLoading(false);
      setIsDevSigningIn(false);
    }
  };

  // Check if we have a remembered email
  useEffect(() => {
    if (typeof window !== "undefined" && !formData.email) {
      try {
        const rememberedEmail = localStorage.getItem("remembered_email");
        if (rememberedEmail) {
          setFormData((prev) => ({ ...prev, email: rememberedEmail }));
          setRememberMe(true);
        }
      } catch (e) {
        console.warn("Failed to retrieve remembered email", e);
      }
    }
  }, [formData.email]);

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <BackgroundAnimation />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="relative bg-white/[0.03] backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
          {/* Logo and Title */}
          <div className="text-center space-y-2 mb-8">
            <Link href="/" className="inline-block mb-6">
              <Logo className="h-12 w-auto" isLink={false} />
            </Link>
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-gray-300">Sign in to continue your journey</p>
          </div>

          {/* Connection error alert */}
          {connectionStatus?.error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in-50 border-red-500/20 bg-red-500/5 mb-6"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {connectionStatus.error}. Please try again later or contact
                support.
              </AlertDescription>
            </Alert>
          )}

          {/* General error message */}
          {formErrors.general && (
            <Alert
              variant="destructive"
              className="animate-in fade-in-50 border-red-500/20 bg-red-500/5 mb-6"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}

          {/* Sign in form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-200"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  placeholder="name@example.com"
                />
                {renderErrorMessage("email")}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-200"
                  >
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {renderErrorMessage("password")}
              </div>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="h-4 w-4 rounded border-white/10 text-primary"
              />
              <Label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                Remember this device
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                Create one
              </Link>
            </p>
          </form>

          {/* Development mode section */}
          {IS_DEV && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-3">Development Options</p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleDevSignIn("admin")}
                  disabled={isDevSigningIn}
                  variant="outline"
                  className="w-full text-sm border-white/10 hover:bg-white/5"
                  size="sm"
                >
                  Sign in as Admin
                </Button>
                <Button
                  onClick={() => handleDevSignIn("user")}
                  disabled={isDevSigningIn}
                  variant="outline"
                  className="w-full text-sm border-white/10 hover:bg-white/5"
                  size="sm"
                >
                  Sign in as User
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
