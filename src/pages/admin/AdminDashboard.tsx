import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Users,
  ShieldAlert,
  Clock,
  TrendingUp,
  MessageSquare,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    users: number;
    securityEvents: number;
    activeUsers24h: number;
    loginAttempts24h: number;
    recentSignups: number;
    premiumUsers: number;
    totalContent: number;
    supportTickets: number;
  }>({
    users: 0,
    securityEvents: 0,
    activeUsers24h: 0,
    loginAttempts24h: 0,
    recentSignups: 0,
    premiumUsers: 0,
    totalContent: 0,
    supportTickets: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      
      try {
        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        
        // Get security events in the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const { count: securityEventsCount, error: securityError } = await supabase
          .from('security_events')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneDayAgo.toISOString());
        
        if (securityError) throw securityError;
        
        // Get login attempts in the last 24 hours
        const { count: loginAttemptsCount, error: loginError } = await supabase
          .from('security_events')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneDayAgo.toISOString())
          .or('event_type.eq.login_success,event_type.eq.login_failed');
        
        if (loginError) throw loginError;
        
        // Get new users in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: newUsersCount, error: newUsersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());
        
        if (newUsersError) throw newUsersError;
        
        // Get premium users count
        const { count: premiumCount, error: premiumError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_premium', true);
        
        if (premiumError) throw premiumError;
        
        // Set all stats
        setStats({
          users: usersCount || 0,
          securityEvents: securityEventsCount || 0,
          activeUsers24h: Math.floor((usersCount || 0) * 0.15), // Placeholder calculation
          loginAttempts24h: loginAttemptsCount || 0,
          recentSignups: newUsersCount || 0,
          premiumUsers: premiumCount || 0,
          totalContent: 42, // Placeholder
          supportTickets: 5, // Placeholder
        });
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Define the stat cards
  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats.users,
      description: 'Registered users',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Security Events',
      value: stats.securityEvents,
      description: 'Last 24 hours',
      icon: <ShieldAlert className="h-5 w-5" />,
      color: 'bg-red-500',
      link: '/admin/security',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers24h,
      description: 'Last 24 hours',
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-green-500',
      link: '/admin/analytics',
    },
    {
      title: 'Login Attempts',
      value: stats.loginAttempts24h,
      description: 'Last 24 hours',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-orange-500',
      link: '/admin/security',
    },
    {
      title: 'Recent Signups',
      value: stats.recentSignups,
      description: 'Last 7 days',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500',
      link: '/admin/users',
    },
    {
      title: 'Premium Users',
      value: stats.premiumUsers,
      description: 'Subscribed users',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-yellow-500',
      link: '/admin/users',
    },
    {
      title: 'Content Items',
      value: stats.totalContent,
      description: 'Articles & pages',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-indigo-500',
      link: '/admin/content',
    },
    {
      title: 'Support Tickets',
      value: stats.supportTickets,
      description: 'Open tickets',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-cyan-500',
      link: '/admin/support',
    },
  ];
  
  return (
    <div className="container p-4 space-y-6">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Overview of key metrics and system status"
        icon={<Users className="h-8 w-8 text-primary" />}
      />
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${card.color} bg-opacity-10`}>
                    {React.cloneElement(card.icon as React.ReactElement, {
                      className: `h-5 w-5 ${card.color.replace('bg-', 'text-')}`,
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <CardDescription className="flex justify-between items-center mt-1">
                  {card.description}
                  {card.link && (
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                      <Link to={card.link}>View</Link>
                    </Button>
                  )}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Recent Activity Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Security Events</CardTitle>
            <CardDescription>
              Recent login attempts and security alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-gray-500 py-4">
                  {stats.securityEvents === 0 
                    ? "No security events in the last 24 hours" 
                    : `${stats.securityEvents} security events detected in the last 24 hours`}
                </p>
                <div className="flex justify-center">
                  <Button asChild>
                    <Link to="/admin/security">View Security Log</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 