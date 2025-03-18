import { useLocation } from "@/empty-module";
import SignInClient from "@/components/auth/SignInClient";

export default function SignIn() {
  const location = useLocation();
  const state = location.state as { returnTo?: string } | null;
  const redirect = state?.returnTo || "/dashboard";

  return <SignInClient redirect={redirect} />;
}
