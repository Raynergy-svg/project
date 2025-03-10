import { useState, useEffect } from "react";
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-adapter';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, CreditCard, Headphones, MessageCircle, Mail, Code, Shield, ArrowLeft, Home, KeyRound, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { PasswordChange } from '@/components/settings/PasswordChange';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { AccountDeletion } from '@/components/settings/AccountDeletion';
import { ScrollArea } from '@/components/ui/scroll-area';

// For development mode only
const MockDataToggle = process.env.NODE_ENV === 'development' 
  ? require('@/components/settings/MockDataToggle').default 
  : () => null;

export default function Settings() {
  const { user } = useAuth();
  const router = useRouter();
  const { tab } = router.query;
  const activeTabFromQuery = typeof tab === 'string' ? tab : 'account';
  const [activeTab, setActiveTab] = useState<string>(activeTabFromQuery);

  // Show developer tab only in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab && activeTab !== activeTabFromQuery) {
      router.push({
        pathname: '/settings',
        query: { tab: activeTab }
      }, undefined, { shallow: true });
    }
  }, [activeTab, activeTabFromQuery, router]);

  // Update active tab when URL changes
  useEffect(() => {
    if (activeTabFromQuery) {
      setActiveTab(activeTabFromQuery);
    }
  }, [activeTabFromQuery]);

  return (
    <Layout
      title="Settings | Smart Debt Flow"
      requireAuth={true}
    >
      <Head>
        <title>Settings | Smart Debt Flow</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Head>

      <ScrollArea className="h-[calc(100vh-6rem)]">
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
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mail className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Headphones className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
              {isDevelopment && (
                <TabsTrigger value="developer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Code className="h-4 w-4 mr-2" />
                  Developer
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="account" className="p-6 bg-card rounded-lg shadow-sm">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Account Information</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your account details and profile settings
                  </p>
                  
                  <div className="grid gap-6 md:grid-cols-[1fr_250px]">
                    <ProfileForm user={user} />
                    <AvatarUpload />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="p-6 bg-card rounded-lg shadow-sm">
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

                <div>
                  <h2 className="text-xl font-semibold mb-1 text-red-600">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <AccountDeletion />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="p-6 bg-card rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-1">Subscription Management</h2>
              <p className="text-sm text-muted-foreground mb-6">
                View and manage your subscription details
              </p>

              {/* Subscription details would go here */}
              <div className="rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-xl font-bold">{user?.subscription?.planName || 'Free'}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    {user?.subscription?.status || 'Active'}
                  </div>
                </div>
                
                {user?.subscription?.status === 'active' ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">
                      Your subscription will renew on {user?.subscription?.currentPeriodEnd 
                        ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                    <Button variant="outline">Manage Subscription</Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">
                      Upgrade your account to access premium features and get the most out of Smart Debt Flow.
                    </p>
                    <Button>Upgrade to Premium</Button>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="p-6 bg-card rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-1">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Control how and when you receive notifications
              </p>
              
              {/* Notification settings would go here */}
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Notification preferences will be available soon.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="support" className="p-6 bg-card rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-1">Support</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Get help with your account or report an issue
              </p>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-6 border rounded-lg">
                    <MessageCircle className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have a question or need help? Our support team is here for you.
                    </p>
                    <Button variant="outline" onClick={() => router.push('/support')}>
                      Contact Us
                    </Button>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <Headphones className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="text-lg font-medium mb-2">Help Center</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse our knowledge base and learn how to use Smart Debt Flow.
                    </p>
                    <Button variant="outline" onClick={() => router.push('/help')}>
                      Visit Help Center
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {isDevelopment && (
              <TabsContent value="developer" className="p-6 bg-card rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-1">Developer Settings</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Development mode only settings
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mock Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Toggle mock data for development and testing
                    </p>
                    <MockDataToggle />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">API Explorer</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore and test available API endpoints
                    </p>
                    <Button variant="outline">
                      Open API Explorer
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </ScrollArea>
    </Layout>
  );
}

// Server-side props for authentication check
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return context.req.cookies[name];
        },
        set(name, value, options) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
        remove(name, options) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If not logged in, redirect to signin page
  if (!session) {
    return {
      redirect: {
        destination: `/signin?redirect=${encodeURIComponent('/settings')}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      initialSession: session,
    },
  };
} 