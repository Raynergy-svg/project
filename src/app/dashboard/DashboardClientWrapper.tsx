"use client";

import dynamic from "next/dynamic";

// Import the Dashboard component from the App Router implementation
const DashboardClient = dynamic(() => import("./Dashboard"), {
  ssr: true,
});

export default function DashboardClientWrapper() {
  return <DashboardClient />;
}
