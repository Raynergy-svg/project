'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
          </Button>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline" 
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
