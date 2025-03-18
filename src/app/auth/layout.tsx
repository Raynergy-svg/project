"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-primary transition-colors group"
          aria-label="Return to home page"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <Logo size="sm" showText={false} isLink={false} />
        </Link>
      </div>

      {children}
    </div>
  );
}
