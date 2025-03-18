import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper case version
    router.replace("/Dashboard");
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}
