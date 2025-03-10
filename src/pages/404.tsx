import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <Layout
      title="Page Not Found - Smart Debt Flow"
      description="The page you're looking for doesn't exist or has been moved."
    >
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Page Not Found</h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-x-4"
          >
            <Link href="/" passHref>
              <Button size="lg">
                Return Home
              </Button>
            </Link>
            
            <Link href="/dashboard" passHref>
              <Button variant="outline" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
          
          <div className="mt-12 border-t border-border pt-8">
            <p className="text-muted-foreground">
              Looking for something specific? Try one of these:
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Link href="/dashboard" className="text-primary hover:underline">
                Dashboard
              </Link>
              <Link href="/about" className="text-primary hover:underline">
                About Us
              </Link>
              <Link href="/blog" className="text-primary hover:underline">
                Blog
              </Link>
              <Link href="/help" className="text-primary hover:underline">
                Help Center
              </Link>
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
              <Link href="/signin" className="text-primary hover:underline">
                Sign In
              </Link>
              <Link href="/pricing" className="text-primary hover:underline">
                Pricing
              </Link>
              <Link href="/contact" className="text-primary hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 