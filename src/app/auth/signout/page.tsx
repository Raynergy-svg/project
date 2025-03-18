"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignOutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await logout();
        // Wait a moment to ensure logout is complete
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("Error signing out:", error);
        // Redirect to home page anyway
        router.push("/");
      }
    };

    handleSignOut();
  }, [logout, router]);

  return (
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
      <h1 className="text-2xl font-bold mb-2">Signing Out...</h1>
      <p className="text-muted-foreground">
        Please wait while we sign you out.
      </p>
    </div>
  );
}
