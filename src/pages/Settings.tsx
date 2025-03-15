import { useState } from "react";
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, CreditCard, Headphones, MessageCircle, Mail, Code, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MockDataToggle from '@/components/settings/MockDataToggle';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { PasswordChange } from '@/components/settings/PasswordChange';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  // Show developer tab only in development mode
  const isDevelopment = import.meta.env.DEV;

  return (
    <DashboardLayout>
      <ScrollArea className="h-[calc(100vh-6rem)]">
        <div className="space-y-6 p-6">
          <div className="pb-4">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className={`grid w-full ${isDevelopment ? 'grid-cols-5' : 'grid-cols-4'} mb-8`}>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <span>Support</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </TabsTrigger>
              {isDevelopment && (
                <TabsTrigger value="developer" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>Developer</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Account/Profile Settings */}
            <TabsContent value="account">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <AvatarUpload />
                <ProfileForm />
              </motion.div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <SecuritySettings />
                <PasswordChange />
              </motion.div>
            </TabsContent>

            {/* Support Settings */}
            <TabsContent value="support">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden p-6">
                  <h3 className="text-lg font-medium mb-4">Support Options</h3>
                  <p className="text-gray-400">Contact our support team or find answers to common questions.</p>
                  
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-md border border-gray-700 p-4">
                      <h4 className="flex items-center gap-2 font-medium text-white">
                        <MessageCircle className="h-4 w-4 text-[#88B04B]" />
                        Live Chat Support
                      </h4>
                      <p className="mt-2 text-sm text-gray-400">Chat with our support team for immediate assistance.</p>
                      <Button variant="outline" className="mt-4 w-full border-[#88B04B]/20 text-[#88B04B]">
                        Start Chat
                      </Button>
                    </div>
                    
                    <div className="rounded-md border border-gray-700 p-4">
                      <h4 className="flex items-center gap-2 font-medium text-white">
                        <Mail className="h-4 w-4 text-[#88B04B]" />
                        Email Support
                      </h4>
                      <p className="mt-2 text-sm text-gray-400">Send us an email and we'll respond within 24 hours.</p>
                      <a href="mailto:support@smartdebtflow.com" className="mt-4 block w-full">
                        <Button variant="outline" className="w-full border-[#88B04B]/20 text-[#88B04B]">
                          Email Us
                        </Button>
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-white">Frequently Asked Questions</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm text-gray-400">
                        <a href="/support#password-reset" className="text-[#88B04B] hover:underline">
                          How do I reset my password?
                        </a>
                      </li>
                      <li className="text-sm text-gray-400">
                        <a href="/support#bank-connection" className="text-[#88B04B] hover:underline">
                          How do I connect my bank account?
                        </a>
                      </li>
                      <li className="text-sm text-gray-400">
                        <a href="/support#cancel-subscription" className="text-[#88B04B] hover:underline">
                          How do I cancel my subscription?
                        </a>
                      </li>
                      <li className="text-sm text-gray-400">
                        <a href="/support" className="text-[#88B04B] hover:underline">
                          View all support topics →
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden p-6">
                  <h3 className="text-lg font-medium mb-4">Billing Information</h3>
                  <p className="text-gray-400 mb-4">Manage your subscription and payment methods.</p>
                  
                  <div className="rounded-md border border-gray-700 p-4 mb-6">
                    <h4 className="font-medium text-white mb-2">Current Plan</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[#88B04B] font-medium">
                          {user?.subscription?.planName || 'Free Plan'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {user?.subscription?.status === 'active' 
                            ? 'Active until ' + new Date(user?.subscription?.currentPeriodEnd || '').toLocaleDateString() 
                            : user?.subscription?.status === 'trialing' 
                              ? 'Trial ends ' + new Date(user?.trialEndsAt || '').toLocaleDateString()
                              : 'No active subscription'}
                        </p>
                      </div>
                      <Button variant="outline" className="border-[#88B04B]/20 text-[#88B04B]">
                        {user?.subscription?.status === 'active' ? 'Manage Plan' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-gray-700 p-4">
                    <h4 className="font-medium text-white mb-2">Payment Methods</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Add or edit your payment methods for billing.
                    </p>
                    <Button variant="outline">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Developer Settings - Only shown in development mode */}
            {isDevelopment && (
              <TabsContent value="developer">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden p-6">
                    <h3 className="text-lg font-medium mb-4">Development Settings</h3>
                    <p className="text-gray-400 mb-6">These settings are only available in development mode.</p>
                    
                    <div className="space-y-4">
                      <MockDataToggle />
                      
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mt-6">
                        <h4 className="text-yellow-400 font-medium">Development Mode Active</h4>
                        <p className="text-sm text-gray-300 mt-1">
                          You're using a development build with mock authentication. Some features are simulated or disabled.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </ScrollArea>
    </DashboardLayout>
  );
}
