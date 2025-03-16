import { Suspense } from "react";
import dynamic from "next/dynamic";

// Import the Dashboard component with no SSR to ensure it only runs on client
const DashboardClient = dynamic(() => import("@/pages/Dashboard"), {
  ssr: false,
});

// This is a server component that wraps our client component
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#88B04B]"></div>
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
