import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Smart Debt Flow",
  description:
    "Join our mission to revolutionize debt management and help millions achieve financial freedom.",
  openGraph: {
    title: "Careers - Smart Debt Flow",
    description:
      "Join our mission to revolutionize debt management with AI and empower millions to achieve financial freedom.",
    type: "website",
    url: "https://smartdebtflow.com/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
