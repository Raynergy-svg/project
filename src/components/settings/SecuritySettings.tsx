import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/lib/supabase/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Shield, Mail, Bell, Lock } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

// Simple Switch component for this component only
interface SimpleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelClassName?: string;
}

const SimpleSwitch: React.FC<SimpleSwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  labelClassName 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        {label && (
          <span className={`text-sm font-medium leading-none ml-2 ${labelClassName || ''}`}>
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

export function SecuritySettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    user?.preferences?.email_notifications ?? true
  );
  const { toast } = useToast();

  // Handler for toggling notifications
  const handleToggleEmailNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const newValue = !emailNotifications;
    
    try {
      const preferences = {
        ...(user?.preferences || {}),
        email_notifications: newValue
      };
      
      const response = await updateUserProfile(user.id, { preferences });
      
      if (response.error) {
        throw response.error;
      }
      
      setEmailNotifications(newValue);
      updateUser({ 
        preferences: {
          ...user.preferences,
          email_notifications: newValue
        }
      });
      
      toast({
        title: "Settings Updated",
        description: newValue 
          ? "You will now receive email notifications." 
          : "Email notifications have been disabled.",
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred updating your settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox and follow the link to verify your email.",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      toast({
        title: "Email Not Sent",
        description: error instanceof Error ? error.message : "An error occurred sending the verification email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#88B04B]" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-400">
                    Receive notifications about account activity and security alerts
                  </p>
                </div>
              </div>
              <SimpleSwitch
                checked={emailNotifications}
                onChange={handleToggleEmailNotifications}
                label="Email Notifications"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium">Email Verification</h3>
                  <p className="text-sm text-gray-400">
                    Verify your email address to ensure account security
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={sendVerificationEmail}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : "Send Verification"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 