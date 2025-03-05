import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminAnalytics: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <AdminPageHeader 
        title="Analytics" 
        description="View usage metrics and performance statistics"
        icon={<BarChart3 className="h-8 w-8 text-primary" />}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics and reporting functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics; 