import { useState } from "react";
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, CreditCard } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden p-6">
                <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Full Name</p>
                    <p className="mt-1 text-white">{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Email Address</p>
                    <p className="mt-1 text-white">{user?.email || 'Not set'}</p>
                  </div>
                </div>
              </div>
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
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden p-6">
                <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                <p className="text-gray-400">Manage your account security settings and preferences.</p>
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
                <p className="text-gray-400">Manage your subscription and payment methods.</p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
