import { useState } from "react";
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, CreditCard, Headphones, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span>Support</span>
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
                <p className="text-gray-400">Manage your subscription and payment methods.</p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
