import { Metadata } from "next";
import SignInClient from "@/components/auth/SignInClient";

export const metadata: Metadata = {
  title: "Sign In | Smart Debt Flow",
  description: "Sign in to your Smart Debt Flow account",
};

export default function SignInPage() {
  return <SignInClient />;
}
