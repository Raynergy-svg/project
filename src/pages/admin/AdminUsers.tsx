import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminUsers: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <AdminPageHeader 
        title="User Management" 
        description="View and manage user accounts"
        icon={<Users className="h-8 w-8 text-primary" />}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers; 