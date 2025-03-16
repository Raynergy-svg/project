"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const ROUTES_WITHOUT_NAVBAR = [
  "/signin",
  "/signup",
  "/auth/signin",
  "/auth/signup",
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const shouldShowNavbar = !ROUTES_WITHOUT_NAVBAR.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
