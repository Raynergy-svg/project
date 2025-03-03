import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Clock, AlertCircle } from 'lucide-react';
import notificationService from '@/services/notificationService';
import { updateUserProfile } from '@/lib/supabase/profileService';

// Simple Switch component for this component only
interface SimpleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelClassName?: string;
  id?: string;
  disabled?: boolean;
}

const SimpleSwitch: React.FC<SimpleSwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  labelClassName,
  id,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="sr-only peer"
          id={id}
          disabled={disabled}
        />
        <div className={`w-10 h-5 bg-gray-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
        {label && (
          <span className={`text-sm font-medium leading-none ml-2 ${labelClassName || ''} ${disabled ? 'opacity-50' : ''}`}>
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

interface PaymentReminderPreferences {
  enabled: boolean;
  defaultDaysBefore: number[];
  defaultNotificationTypes: ('email' | 'push' | 'sms' | 'in-app')[];
}

export function PaymentReminderSettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Default reminder preferences
  const defaultReminderPreferences: PaymentReminderPreferences = {
    enabled: true,
    defaultDaysBefore: [1, 3, 7],
    defaultNotificationTypes: ['email', 'in-app'],
  };
  
  const [reminderPreferences, setReminderPreferences] = useState<PaymentReminderPreferences>(
    user?.preferences?.paymentReminders || defaultReminderPreferences
  );
  
  // Update reminder preferences
  const saveReminderPreferences = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const preferences = {
        ...(user?.preferences || {}),
        paymentReminders: reminderPreferences
      };
      
      const response = await updateUserProfile(user.id, { preferences });
      
      if (response.error) {
        throw response.error;
      }
      
      updateUser({ 
        preferences: {
          ...user.preferences,
          paymentReminders: reminderPreferences
        }
      });
      
      toast({
        title: "Reminder Settings Updated",
        description: "Your payment reminder settings have been saved.",
      });
    } catch (error) {
      console.error("Failed to update reminder settings:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred updating your settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle reminders enabled/disabled
  const handleToggleReminders = (enabled: boolean) => {
    setReminderPreferences(prev => ({
      ...prev,
      enabled
    }));
  };
  
  // Toggle a reminder day setting
  const handleToggleDay = (day: number) => {
    setReminderPreferences(prev => {
      const currentDays = [...prev.defaultDaysBefore];
      
      if (currentDays.includes(day)) {
        return {
          ...prev,
          defaultDaysBefore: currentDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          defaultDaysBefore: [...currentDays, day].sort((a, b) => a - b)
        };
      }
    });
  };
  
  // Toggle a notification type
  const handleToggleNotificationType = (type: 'email' | 'push' | 'sms' | 'in-app') => {
    setReminderPreferences(prev => {
      const currentTypes = [...prev.defaultNotificationTypes];
      
      if (currentTypes.includes(type)) {
        return {
          ...prev,
          defaultNotificationTypes: currentTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          defaultNotificationTypes: [...currentTypes, type]
        };
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Payment Reminder Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive payment reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Enable/Disable Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label htmlFor="enable-reminders" className="text-base font-medium">
                  Payment Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive timely notifications for upcoming payments
                </p>
              </div>
            </div>
            <SimpleSwitch
              id="enable-reminders"
              checked={reminderPreferences.enabled}
              onChange={(e) => handleToggleReminders(e.target.checked)}
              disabled={loading}
            />
          </div>
          
          {reminderPreferences.enabled && (
            <>
              {/* Reminder Days */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-base font-medium">When to Remind</h3>
                    <p className="text-sm text-muted-foreground">
                      Select how many days before a payment is due to receive reminders
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  {[1, 3, 5, 7, 14, 30].map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`day-${day}`} 
                        checked={reminderPreferences.defaultDaysBefore.includes(day)}
                        onCheckedChange={() => handleToggleDay(day)}
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day} {day === 1 ? 'day' : 'days'} before
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notification Types */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-base font-medium">Notification Method</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose how you want to be notified about upcoming payments
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-email"
                      checked={reminderPreferences.defaultNotificationTypes.includes('email')}
                      onCheckedChange={() => handleToggleNotificationType('email')}
                    />
                    <label
                      htmlFor="type-email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-in-app"
                      checked={reminderPreferences.defaultNotificationTypes.includes('in-app')}
                      onCheckedChange={() => handleToggleNotificationType('in-app')}
                    />
                    <label
                      htmlFor="type-in-app"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      In-app notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-push"
                      disabled={true}
                      checked={false}
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="type-push"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Push notifications
                      </label>
                      <Badge variant="outline">Coming soon</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-sms"
                      disabled={true}
                      checked={false}
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="type-sms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        SMS notifications
                      </label>
                      <Badge variant="outline">Coming soon</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end pt-4 border-t border-border">
            <Button 
              onClick={saveReminderPreferences}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Save Settings"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 