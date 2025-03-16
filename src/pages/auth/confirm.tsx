import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createServerClient } from "@supabase/ssr";
import { GetServerSideProps } from "next";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function EmailConfirmation() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const handleConfirmation = async () => {
      // Check if we have the token hash in the URL
      const { type, token_hash } = router.query;

      if (!type || !token_hash) {
        setStatus("error");
        setMessage(
          "Invalid confirmation link. Please request a new confirmation email."
        );
        return;
      }

      try {
        // Process the confirmation client-side as well
        // This isn't strictly necessary but provides better UX feedback
        const { data, error } = await fetch("/api/auth/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, token_hash }),
        }).then((res) => res.json());

        if (error) {
          setStatus("error");
          setMessage(error.message || "An error occurred during confirmation.");
          return;
        }

        setStatus("success");
        setMessage("Your email has been confirmed successfully!");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Confirmation error:", err);
        setStatus("error");
        setMessage("An error occurred during confirmation. Please try again.");
      }
    };

    if (router.isReady) {
      handleConfirmation();
    }
  }, [router]);

  return (
    <Layout
      title="Email Confirmation | Smart Debt Flow"
      showNavbar={false}
      showFooter={false}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h1 className="text-2xl font-bold mb-2">Confirming Your Email</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold mb-2">Email Confirmed!</h1>
              <p className="text-muted-foreground mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the dashboard in a moment...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
              <p className="text-muted-foreground mb-4">{message}</p>
              <button
                onClick={() => router.push("/auth/login")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Return to Login
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Server-side props for email confirmation
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Create Supabase client
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return context.req.cookies[name];
        },
        set(name, value, options) {
          context.res.setHeader(
            "Set-Cookie",
            `${name}=${value}; Path=/; ${options.httpOnly ? "HttpOnly;" : ""} ${
              options.secure ? "Secure;" : ""
            } SameSite=${options.sameSite || "Lax"}`
          );
        },
        remove(name, options) {
          context.res.setHeader(
            "Set-Cookie",
            `${name}=; Path=/; Max-Age=0; ${
              options.httpOnly ? "HttpOnly;" : ""
            } ${options.secure ? "Secure;" : ""} SameSite=${
              options.sameSite || "Lax"
            }`
          );
        },
      },
    }
  );

  // Check if we have the token in the URL
  const { token_hash, type } = context.query;

  // If we have the token, attempt to verify the email
  if (token_hash && type) {
    // Supabase handles this automatically with the right redirect URL
    // This is just for additional handling if needed
  }

  return {
    props: {},
  };
};
