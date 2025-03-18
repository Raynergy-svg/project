import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply - Smart Debt Flow",
  description:
    "Join our team and help revolutionize debt management with AI-powered solutions.",
  openGraph: {
    title: "Apply - Smart Debt Flow",
    description:
      "Join our team and help revolutionize debt management with AI-powered solutions.",
    type: "website",
    url: "https://smartdebtflow.com/apply",
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
