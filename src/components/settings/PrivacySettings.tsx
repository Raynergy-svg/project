import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-adapter";
import { supabase } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Download,
  Trash2,
  ShieldAlert,
  Cookie,
  Lock,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Define types for consent settings
interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
  consentVersion: string;
}

// Type for data export and deletion requests
interface DataRequestStatus {
  id?: string;
  status: string;
  requested_at?: string;
  created_at?: string;
}

export function PrivacySettings() {
  const { toast } = useToast();
  const { user } = useAuth();

  // State for consent preferences
  const [cookieConsent, setCookieConsent] = useState<ConsentPreferences>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
    thirdParty: false,
    consentVersion: "1.0",
  });

  // State for data export and deletion requests
  const [dataExportRequest, setDataExportRequest] =
    useState<DataRequestStatus | null>(null);
  const [deletionRequest, setDeletionRequest] =
    useState<DataRequestStatus | null>(null);

  // Loading states
  const [isLoadingConsent, setIsLoadingConsent] = useState(true);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isRequestingExport, setIsRequestingExport] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch consent preferences and request status on mount
  useEffect(() => {
    if (user?.id) {
      fetchConsentPreferences();
      fetchRequestStatus();
    }
  }, [user]);

  // Fetch current cookie consent preferences
  const fetchConsentPreferences = async () => {
    setIsLoadingConsent(true);
    try {
      // Get the current session to ensure we have a valid token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("No active session");
      }

      // Use direct fetch to call the consent Edge Function
      const response = await fetch(`${getSupabaseUrl()}/functions/v1/consent`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: getSupabaseAnonKey(),
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching consent: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.preferences) {
        setCookieConsent(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching consent preferences:", error);
      toast({
        title: "Failed to load consent settings",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConsent(false);
    }
  };

  // Fetch data export and deletion requests status
  const fetchRequestStatus = async () => {
    setIsLoadingRequests(true);
    try {
      // Check data export request status
      const { data: exportData, error: exportError } = await supabase
        .from("data_export_requests")
        .select("id, status, requested_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (exportError) throw exportError;

      if (exportData && exportData.length > 0) {
        setDataExportRequest(exportData[0]);
      }

      // Check account deletion request status
      const { data: deletionData, error: deletionError } = await supabase
        .from("account_deletion_requests")
        .select("id, status, requested_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (deletionError) throw deletionError;

      if (deletionData && deletionData.length > 0) {
        setDeletionRequest(deletionData[0]);
      }
    } catch (error) {
      console.error("Error fetching request status:", error);
      toast({
        title: "Failed to load request status",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Update cookie consent preferences
  const updateCookieConsent = async (
    type: keyof ConsentPreferences,
    value: boolean
  ) => {
    // Don't allow toggling of necessary cookies
    if (type === "necessary") return;

    setIsUpdatingConsent(true);

    const updatedConsent = {
      ...cookieConsent,
      [type]: value,
    };

    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("No active session");
      }

      // Prepare consent data
      const consentData = {
        ...updatedConsent,
        userAgent: navigator.userAgent,
      };

      // Call the consent Edge Function to update preferences
      const response = await fetch(`${getSupabaseUrl()}/functions/v1/consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: getSupabaseAnonKey(),
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ consentData }),
      });

      if (!response.ok) {
        throw new Error(`Error updating consent: ${response.statusText}`);
      }

      // Update state with new consent settings
      setCookieConsent(updatedConsent);

      toast({
        title: "Privacy Settings Updated",
        description: `Your ${type} preferences have been updated.`,
      });

      // Apply consent settings to tracking systems
      applyConsentSettings(updatedConsent);
    } catch (error) {
      console.error("Error updating consent preferences:", error);
      toast({
        title: "Failed to update settings",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  // Apply consent settings to tracking systems
  const applyConsentSettings = (options: ConsentPreferences) => {
    // This function applies the consent settings to the actual tracking/cookie systems

    // Google Analytics consent
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: options.analytics ? "granted" : "denied",
        ad_storage: options.marketing ? "granted" : "denied",
        functionality_storage: options.functional ? "granted" : "denied",
        personalization_storage: options.thirdParty ? "granted" : "denied",
      });
    }

    // Facebook Pixel
    if (typeof window !== "undefined" && window.fbq) {
      if (options.marketing) {
        window.fbq("consent", "grant");
      } else {
        window.fbq("consent", "revoke");
      }
    }
  };

  // Request data export
  const requestDataExport = async () => {
    setIsRequestingExport(true);
    try {
      const { data, error } = await supabase
        .from("data_export_requests")
        .insert({
          user_id: user.id,
          export_format: "json",
          status: "pending",
          metadata: {
            request_source: "settings_page",
            browser: navigator.userAgent,
          },
        })
        .select("id, status, requested_at, created_at");

      if (error) throw error;

      if (data && data.length > 0) {
        setDataExportRequest(data[0]);
        toast({
          title: "Data Export Requested",
          description:
            "Your data export request has been submitted and will be processed soon.",
        });
      }
    } catch (error) {
      console.error("Error requesting data export:", error);
      toast({
        title: "Failed to Request Data Export",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRequestingExport(false);
    }
  };

  // Request account deletion
  const requestAccountDeletion = async () => {
    setIsRequestingDeletion(true);
    try {
      // Calculate scheduled deletion date (30 days from now)
      const scheduledDeletionDate = new Date();
      scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 30);

      const { data, error } = await supabase
        .from("account_deletion_requests")
        .insert({
          user_id: user.id,
          status: "pending",
          scheduled_deletion_date: scheduledDeletionDate.toISOString(),
          reason: "User requested from settings page",
          metadata: {
            request_source: "settings_page",
            browser: navigator.userAgent,
          },
        })
        .select("id, status, requested_at, created_at");

      if (error) throw error;

      if (data && data.length > 0) {
        setDeletionRequest(data[0]);
        setShowDeleteConfirm(false);
        toast({
          title: "Account Deletion Requested",
          description:
            "Your account is scheduled for deletion in 30 days. You can cancel this request any time before then.",
        });
      }
    } catch (error) {
      console.error("Error requesting account deletion:", error);
      toast({
        title: "Failed to Request Account Deletion",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRequestingDeletion(false);
    }
  };

  // Cancel account deletion request
  const cancelDeletionRequest = async () => {
    if (!deletionRequest?.id) return;

    setIsRequestingDeletion(true);
    try {
      const { error } = await supabase
        .from("account_deletion_requests")
        .update({
          status: "canceled",
          metadata: {
            ...(deletionRequest?.metadata || {}),
            canceled_at: new Date().toISOString(),
            canceled_from: "settings_page",
          },
        })
        .eq("id", deletionRequest.id);

      if (error) throw error;

      // Update local state
      setDeletionRequest({
        ...deletionRequest,
        status: "canceled",
      });

      toast({
        title: "Deletion Request Canceled",
        description:
          "Your account deletion request has been canceled. Your account will not be deleted.",
      });
    } catch (error) {
      console.error("Error canceling deletion request:", error);
      toast({
        title: "Failed to Cancel Request",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRequestingDeletion(false);
    }
  };

  // Helper function to get Supabase URL
  const getSupabaseUrl = () => {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  };

  // Helper function to get Supabase anon key
  const getSupabaseAnonKey = () => {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Cookie Consent Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            Cookie Settings
          </CardTitle>
          <CardDescription>
            Manage how we use cookies and similar technologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingConsent ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="necessary-cookies"
                    className="text-base font-medium"
                  >
                    Necessary Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Required for the website to function properly (cannot be
                    disabled)
                  </p>
                </div>
                <Switch
                  id="necessary-cookies"
                  checked={cookieConsent.necessary}
                  disabled={true}
                  aria-readonly
                />
              </div>

              <Separator />

              {/* Functional Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="functional-cookies"
                    className="text-base font-medium"
                  >
                    Functional Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enhance your experience with customization features
                  </p>
                </div>
                <Switch
                  id="functional-cookies"
                  checked={cookieConsent.functional}
                  disabled={isUpdatingConsent}
                  onCheckedChange={(checked) =>
                    updateCookieConsent("functional", checked)
                  }
                />
              </div>

              <Separator />

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="analytics-cookies"
                    className="text-base font-medium"
                  >
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors use our website
                  </p>
                </div>
                <Switch
                  id="analytics-cookies"
                  checked={cookieConsent.analytics}
                  disabled={isUpdatingConsent}
                  onCheckedChange={(checked) =>
                    updateCookieConsent("analytics", checked)
                  }
                />
              </div>

              <Separator />

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="marketing-cookies"
                    className="text-base font-medium"
                  >
                    Marketing Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to show you personalized advertising on other
                    websites
                  </p>
                </div>
                <Switch
                  id="marketing-cookies"
                  checked={cookieConsent.marketing}
                  disabled={isUpdatingConsent}
                  onCheckedChange={(checked) =>
                    updateCookieConsent("marketing", checked)
                  }
                />
              </div>

              <Separator />

              {/* Third-Party Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="third-party-cookies"
                    className="text-base font-medium"
                  >
                    Third-Party Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable features from external services like social media
                    platforms
                  </p>
                </div>
                <Switch
                  id="third-party-cookies"
                  checked={cookieConsent.thirdParty}
                  disabled={isUpdatingConsent}
                  onCheckedChange={(checked) =>
                    updateCookieConsent("thirdParty", checked)
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Access & Portability Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Data Access & Portability
          </CardTitle>
          <CardDescription>
            Request a copy of your personal data in a portable format
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">
                You can request a copy of all your personal data stored in our
                system. This will be provided in a machine-readable format.
              </p>

              {dataExportRequest && dataExportRequest.status !== "completed" ? (
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">
                    Data Export Request Pending
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {dataExportRequest.status}
                    </p>
                    <p>
                      <span className="font-medium">Requested:</span>{" "}
                      {formatDate(dataExportRequest.requested_at)}
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Your data export is being processed. You will be notified
                      when it's ready for download.
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={requestDataExport}
                  disabled={isRequestingExport}
                  className="flex items-center gap-2"
                >
                  {isRequestingExport ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Request Data Export
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Deletion Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Delete Your Account
          </CardTitle>
          <CardDescription>
            Request permanent deletion of your account and personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">
                Requesting account deletion will schedule your account to be
                permanently deleted after a 30-day grace period. During this
                period, you can cancel the deletion request if you change your
                mind.
              </p>

              {deletionRequest && deletionRequest.status === "pending" ? (
                <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
                  <h4 className="font-medium mb-2 text-destructive">
                    Account Deletion In Progress
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {deletionRequest.status}
                    </p>
                    <p>
                      <span className="font-medium">Requested:</span>{" "}
                      {formatDate(deletionRequest.requested_at)}
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Your account is scheduled for deletion. You can cancel
                      this request anytime before the scheduled deletion date.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={cancelDeletionRequest}
                      disabled={isRequestingDeletion}
                    >
                      {isRequestingDeletion ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Cancel Deletion Request
                    </Button>
                  </div>
                </div>
              ) : deletionRequest && deletionRequest.status === "canceled" ? (
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">
                    Previous Deletion Request Canceled
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You previously requested account deletion but canceled the
                    request. Your account remains active.
                  </p>
                  <AlertDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="mt-4 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Request Account Deletion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will schedule your account for deletion.
                          All your data will be permanently removed after 30
                          days. This action cannot be undone after the grace
                          period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={requestAccountDeletion}
                          className="bg-destructive hover:bg-destructive/90"
                          disabled={isRequestingDeletion}
                        >
                          {isRequestingDeletion
                            ? "Processing..."
                            : "Yes, delete my account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <AlertDialog
                  open={showDeleteConfirm}
                  onOpenChange={setShowDeleteConfirm}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Request Account Deletion
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will schedule your account for deletion. All
                        your data will be permanently removed after 30 days.
                        This action cannot be undone after the grace period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={requestAccountDeletion}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isRequestingDeletion}
                      >
                        {isRequestingDeletion
                          ? "Processing..."
                          : "Yes, delete my account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
