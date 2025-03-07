import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, DownloadCloud, Trash2, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type DeletionRequest = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  scheduled_deletion_date: string;
  requested_at: string;
};

export function AccountDeletion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [activeDeletionRequest, setActiveDeletionRequest] = useState<DeletionRequest | null>(null);
  const [isCheckingDeletionStatus, setIsCheckingDeletionStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check for any existing deletion requests on component mount
  useEffect(() => {
    const checkDeletionStatus = async () => {
      if (!user) return;
      
      setIsCheckingDeletionStatus(true);
      try {
        const { data, error } = await supabase.functions.invoke('account-management/delete-account', {
          method: 'GET',
        });
        
        if (error) {
          console.error('Error checking deletion status:', error);
          setError('Failed to check deletion status. Please try again later.');
        } else if (data && data.deletionRequest) {
          setActiveDeletionRequest(data.deletionRequest);
        }
      } catch (err) {
        console.error('Error invoking deletion status check:', err);
        setError('Failed to check deletion status. Please try again later.');
      } finally {
        setIsCheckingDeletionStatus(false);
      }
    };
    
    checkDeletionStatus();
  }, [user]);
  
  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Create a data export request through the API
      const response = await supabase.functions.invoke('account-management/export-data', {
        method: 'POST',
        body: { 
          exportRequest: {
            format: exportFormat,
            metadata: { requestedFrom: 'settings_page' }
          }
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Download the file - the API returns the data directly
      // Create a blob from the response data
      const blob = new Blob(
        [typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)], 
        { type: exportFormat === 'json' ? 'application/json' : 'text/csv' }
      );
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart_debt_flow_data_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Data Export Successful',
        description: 'Your data has been exported successfully.',
        duration: 5000,
      });
      
      // Close the export dialog
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Data Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Submit account deletion request through the API
      const { data, error } = await supabase.functions.invoke('account-management/delete-account', {
        method: 'POST',
        body: { 
          deletionRequest: {
            reason: 'User requested deletion',
            metadata: { requestedFrom: 'settings_page' }
          }
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update the UI with the deletion request
      setActiveDeletionRequest({
        id: data.id || 'pending',
        status: 'pending',
        scheduled_deletion_date: data.scheduledDeletionDate,
        requested_at: new Date().toISOString(),
      });
      
      toast({
        title: 'Account Deletion Requested',
        description: 'Your account has been scheduled for deletion. You can cancel this request within the next 30 days.',
        duration: 5000,
      });
      
      // Close the confirmation dialog
      setShowDeleteConfirmDialog(false);
      setDeleteConfirmText('');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Account Deletion Failed',
        description: error instanceof Error ? error.message : 'Failed to request account deletion. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancelDeletion = async () => {
    if (!user || !activeDeletionRequest) return;
    
    try {
      // Cancel the deletion request through the API
      const { data, error } = await supabase.functions.invoke('account-management/delete-account', {
        method: 'DELETE'
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Clear the active deletion request
      setActiveDeletionRequest(null);
      
      toast({
        title: 'Deletion Request Canceled',
        description: 'Your account deletion request has been canceled successfully.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error canceling deletion:', error);
      toast({
        title: 'Cancellation Failed',
        description: error instanceof Error ? error.message : 'Failed to cancel deletion request. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  // Format a date for display
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Render the appropriate UI based on deletion status
  const renderDeletionStatusUI = () => {
    if (isCheckingDeletionStatus) {
      return (
        <div className="flex items-center justify-center p-6">
          <RefreshCw className="h-5 w-5 animate-spin text-[#88B04B] mr-2" />
          <span className="text-gray-300">Checking account status...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert className="bg-red-900/20 border-red-800/40 mb-4">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-white">Error</AlertTitle>
          <AlertDescription className="text-gray-300">
            {error}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (activeDeletionRequest) {
      return (
        <div className="rounded-md border border-amber-800/40 p-4 bg-amber-900/10 mb-6">
          <h4 className="text-white font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            Account Scheduled for Deletion
          </h4>
          <p className="text-sm text-gray-400 mt-2">
            Your account is scheduled to be deleted on {formatDate(activeDeletionRequest.scheduled_deletion_date)}.
          </p>
          
          {activeDeletionRequest.status === 'pending' && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-3">
                You can cancel this request if you change your mind before the scheduled deletion date.
              </p>
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-400"
                onClick={handleCancelDeletion}
              >
                Cancel Deletion Request
              </Button>
            </div>
          )}
          
          {activeDeletionRequest.status === 'processing' && (
            <p className="text-sm text-amber-400 mt-2">
              Your deletion request is currently being processed and can no longer be canceled.
            </p>
          )}
        </div>
      );
    }
    
    // Default UI for no active deletion request
    return (
      <div className="rounded-md border border-red-800/40 p-4 bg-red-900/10">
        <h4 className="text-white font-medium flex items-center">
          <Trash2 className="h-4 w-4 text-red-500 mr-2" />
          Account Deletion
        </h4>
        <p className="text-sm text-gray-400 mt-2 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowDeleteConfirmDialog(true)}
        >
          Delete My Account
        </Button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden p-6"
    >
      <h3 className="text-lg font-medium mb-4">Account Data & Deletion</h3>
      <p className="text-gray-400 mb-6">
        Manage your personal data and account deletion options. All actions in this section are permanent.
      </p>
      
      <Alert className="mb-6 bg-gray-800 border-[#88B04B]/20">
        <Info className="h-4 w-4 text-[#88B04B]" />
        <AlertTitle className="text-white">Data Protection</AlertTitle>
        <AlertDescription className="text-gray-300">
          You can export all your personal data from Smart Debt Flow in compliance with GDPR and other privacy regulations.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-6">
        {/* Data Export Section */}
        <div className="rounded-md border border-gray-700 p-4">
          <h4 className="text-white font-medium flex items-center">
            <DownloadCloud className="h-4 w-4 text-[#88B04B] mr-2" />
            Data Export
          </h4>
          <p className="text-sm text-gray-400 mt-2 mb-4">
            Export all your personal data in JSON or CSV format. This includes your profile information, financial data, and usage statistics.
          </p>
          <Button
            variant="outline"
            className="border-[#88B04B]/20 text-[#88B04B]"
            onClick={() => setShowExportDialog(true)}
          >
            Export My Data
          </Button>
        </div>
        
        {/* Account Deletion Section - Dynamic based on current status */}
        {renderDeletionStatusUI()}
        
        {/* Data Retention Info */}
        <div className="rounded-md border border-gray-700 p-4 mt-6">
          <h4 className="text-white font-medium flex items-center">
            <AlertCircle className="h-4 w-4 text-[#88B04B] mr-2" />
            Data Retention Policy
          </h4>
          <p className="text-sm text-gray-400 mt-2">
            We retain different types of data for specific periods in accordance with our Privacy Policy:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
            <li>Account information: Retained while account is active</li>
            <li>Financial transaction data: Retained for 7 years for regulatory compliance</li>
            <li>Login and activity logs: Retained for 90 days</li>
            <li>Communication records: Retained for 2 years after your last interaction</li>
          </ul>
          <p className="text-sm text-gray-400 mt-2">
            For more details, please refer to our <a href="/privacy" className="text-[#88B04B] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
      
      {/* Data Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Export Your Data</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a format to export all your personal data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-gray-300 text-sm">
              Your data export will include:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              <li>Profile information</li>
              <li>Account settings</li>
              <li>Financial data and transactions</li>
              <li>Debt information</li>
              <li>Usage statistics</li>
            </ul>
            
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm text-white">Export Format</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                    className="w-4 h-4 text-[#88B04B]"
                    disabled={isExporting}
                  />
                  <span className="text-gray-300">JSON</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="w-4 h-4 text-[#88B04B]"
                    disabled={isExporting}
                  />
                  <span className="text-gray-300">CSV</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              className="border-gray-700 text-white"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#88B04B] hover:bg-[#6a8a39]"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="mr-2">Exporting...</span>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Export Data</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Account Deletion Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. Please read carefully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="bg-red-900/20 border-red-800/40">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-white">Warning</AlertTitle>
              <AlertDescription className="text-gray-300">
                Deleting your account will permanently remove all of your data from our systems after a 30-day grace period.
              </AlertDescription>
            </Alert>
            
            <p className="text-gray-300 text-sm">
              When you delete your account:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              <li>Your profile and personal information will be anonymized immediately</li>
              <li>Your account will be deactivated and you will be logged out</li>
              <li>After 30 days, your data will be permanently deleted</li>
              <li>Financial records required for legal compliance will be retained in anonymized form</li>
              <li>You will not be able to recover your account or data after this period</li>
            </ul>
            
            <Separator className="my-4 bg-gray-800" />
            
            <div className="space-y-2">
              <p className="text-white text-sm font-medium">
                To confirm deletion, type "DELETE" in the field below:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Type DELETE"
                disabled={isDeleting}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              className="border-gray-700 text-white"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setDeleteConfirmText('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== 'DELETE'}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Permanently Delete</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 