import { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - Smart Debt Flow",
  description: "Create a new Smart Debt Flow account",
};

export default function SignupPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="mx-auto w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
