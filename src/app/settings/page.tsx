"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-adapter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Lock,
  CreditCard,
  Headphones,
  MessageCircle,
  Mail,
  Code,
  Shield,
  ArrowLeft,
  Home,
  KeyRound,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileFormAppRouter from "./ProfileFormAppRouter";
import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { PasswordChange } from "@/components/settings/PasswordChange";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AccountDeletion } from "@/components/settings/AccountDeletion";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

// Mock data toggle for development only
const MockDataToggle =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/settings/MockDataToggle"))
    : () => null;

import dynamic from "next/dynamic";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "account");
  const [isClient, setIsClient] = useState(false);

  // Show developer tab only in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Effect to handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect for URL updating when tab changes
  useEffect(() => {
    if (isClient && activeTab && activeTab !== (tabFromUrl || "account")) {
      const params = new URLSearchParams(searchParams);
      params.set("tab", activeTab);
      router.push(`/settings?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, tabFromUrl, router, searchParams, isClient]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin?redirect=/settings");
    }
  }, [user, isLoading, router]);

  // Show loading state while auth is being checked
  if (isLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render the page at all if the user isn't authenticated
  if (!user) {
    return null;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList
          className={`grid w-full ${
            isDevelopment ? "grid-cols-6" : "grid-cols-5"
          } mb-8`}
        >
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span>Privacy & Data</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            <span>Support</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          {isDevelopment && (
            <TabsTrigger value="developer" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Developer</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Account/Profile Settings */}
        <TabsContent
          value="account"
          className="p-6 bg-card rounded-lg shadow-sm"
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Account Information
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Update your account details and profile settings
              </p>

              <div className="grid gap-6 md:grid-cols-[1fr_250px]">
                <ProfileFormAppRouter user={user} />
                <AvatarUpload />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent
          value="security"
          className="p-6 bg-card rounded-lg shadow-sm"
        >
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-1">Password</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Update your password to keep your account secure
              </p>
              <PasswordChange />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-1">Security Settings</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your account security settings and session controls
              </p>
              <SecuritySettings />
            </div>
          </div>
        </TabsContent>

        {/* Privacy & Data Settings */}
        <TabsContent
          value="privacy"
          className="p-6 bg-card rounded-lg shadow-sm"
        >
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Privacy & Data Management
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your data, privacy settings, and consent preferences
              </p>
              <PrivacySettings />
            </div>
          </div>
        </TabsContent>

        {/* Support Settings */}
        <TabsContent
          value="support"
          className="p-6 bg-card rounded-lg shadow-sm"
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Help & Support</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Get help with your account or contact our support team
              </p>

              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Customer Support
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our support team is available Monday through Friday, 9am to
                    5pm ET.
                  </p>
                  <Button
                    onClick={() =>
                      (window.location.href =
                        "mailto:support@smartdebtflow.com")
                    }
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Your Data and Privacy
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn about how we use and protect your personal data.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/privacy")}
                    className="flex items-center gap-2"
                  >
                    View Privacy Policy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent
          value="subscriptions"
          className="p-6 bg-card rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-1">
            Subscription Management
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            View and manage your subscription details
          </p>

          {/* Subscription details would go here */}
          <div className="rounded-lg border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">Current Plan</h3>
                <p className="text-xl font-bold">
                  {user?.subscription?.planName || "Free"}
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                {user?.subscription?.status || "Active"}
              </div>
            </div>

            {user?.subscription?.status === "active" ? (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Your subscription will renew on{" "}
                  {user?.subscription?.currentPeriodEnd
                    ? new Date(
                        user.subscription.currentPeriodEnd
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/subscription")}
                >
                  Manage Subscription
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Upgrade your account to access premium features and get the
                  most out of Smart Debt Flow.
                </p>
                <Button onClick={() => router.push("/pricing")}>
                  Upgrade to Premium
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* Developer Settings - Only shown in development mode */}
        {isDevelopment && (
          <TabsContent
            value="developer"
            className="p-6 bg-card rounded-lg shadow-sm"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Developer Settings
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Options for development and testing purposes
                </p>

                {/* @ts-ignore */}
                <MockDataToggle />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
