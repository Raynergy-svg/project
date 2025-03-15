"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Calendar, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionBadge, { SubscriptionStatus } from "./SubscriptionBadge";
import BillingHistory from "./BillingHistory";
import { SubscriptionTier } from "@/types";

interface SubscriptionManagementProps {
  currentPlan: SubscriptionTier["name"];
  subscriptionStatus: SubscriptionStatus;
  nextBillingDate?: string;
}

export default function SubscriptionManagement({
  currentPlan,
  subscriptionStatus,
  nextBillingDate,
}: SubscriptionManagementProps) {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const handleUpdatePayment = async () => {
    setIsUpdatingPayment(true);
    try {
      // Redirect to Stripe Customer Portal or your custom payment update page
      window.location.href = "/api/create-billing-portal-session";
    } catch (error) {
      console.error("Error updating payment method:", error);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setCancelError(null);

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel subscription");
      }

      // Success - refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setCancelError(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Subscription Details</CardTitle>
          <SubscriptionBadge
            status={subscriptionStatus}
            planName={currentPlan}
          />
        </div>
      </CardHeader>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="p-6 pt-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-lg font-semibold">{currentPlan} Plan</p>
              </div>

              {subscriptionStatus === "active" && (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span>Active</span>
                </div>
              )}
            </div>

            {nextBillingDate && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>Next billing date: {nextBillingDate}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleUpdatePayment}
                  disabled={isUpdatingPayment}
                  className="flex-1"
                  variant="outline"
                >
                  {isUpdatingPayment && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  )}
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>

                {subscriptionStatus === "active" && !showCancelConfirm && (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant="outline"
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>

              {cancelError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{cancelError}</p>
                </div>
              )}

              {showCancelConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 rounded-lg p-4 mt-4"
                >
                  <p className="text-foreground mb-4">
                    Are you sure you want to cancel your {currentPlan}{" "}
                    subscription? You'll lose access to all premium features at
                    the end of your current billing period.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isCancelling && (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent"></span>
                      )}
                      Yes, Cancel Subscription
                    </Button>
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Keep My Subscription
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="p-6 pt-4">
          <BillingHistory />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
