import { Suspense } from "react";
import DashboardClientWrapper from "./DashboardClientWrapper";

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
      <DashboardClientWrapper />
    </Suspense>
  );
}
