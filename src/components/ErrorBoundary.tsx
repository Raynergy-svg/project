"use client";

import React, { Component, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, HomeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNotFound: boolean;
}

/**
 * Error Boundary component for Next.js
 *
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component
 * tree that crashed.
 *
 * Note: Error boundaries do not catch errors in:
 * - Event handlers
 * - Asynchronous code (e.g. setTimeout or requestAnimationFrame callbacks)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isNotFound: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isNotFound:
        error.message.includes("404") ||
        error.message.toLowerCase().includes("not found"),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleBack = () => {
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      if (this.state.isNotFound) {
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full">
              <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
              <p className="text-gray-400 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleBack} variant="outline">
                  Go Back
                </Button>
                <Button onClick={() => (window.location.href = "/")}>
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Animated background particles
      const particles = Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-primary/20"
          initial={{
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 2, 1],
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 6 + 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            width: `${Math.random() * 30 + 10}px`,
            height: `${Math.random() * 30 + 10}px`,
          }}
        />
      ));

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden blur-xl opacity-40">
            {particles}
          </div>
          
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background/80 z-0"></div>

          <AnimatePresence>
            <motion.div
              className="z-10 bg-background/60 backdrop-blur-xl p-8 rounded-2xl border border-primary/10 shadow-2xl max-w-md w-full"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6"
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                </motion.div>
              </motion.div>
              
              <motion.h1
                className="text-3xl font-bold mb-3 text-foreground/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Something went wrong
              </motion.h1>
              
              <motion.p
                className="text-muted-foreground mb-8 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                We encountered an error while loading this page.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button 
                    onClick={this.handleRefresh}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="w-full sm:w-auto" 
                    variant="outline"
                    size="lg"
                  >
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
