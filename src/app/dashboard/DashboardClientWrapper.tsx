"use client";

import dynamic from "next/dynamic";

// Import the Dashboard component with no SSR to ensure it only runs on client
const DashboardClient = dynamic(() => import("@/pages/Dashboard"), {
  ssr: false,
});

export default function DashboardClientWrapper() {
  return <DashboardClient />;
}
