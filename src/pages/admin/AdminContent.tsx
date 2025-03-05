import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminContent: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <AdminPageHeader 
        title="Content Management" 
        description="Manage site content and articles"
        icon={<FileText className="h-8 w-8 text-primary" />}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContent; 