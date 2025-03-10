import { GetServerSideProps } from 'next';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentsPage() {
  return (
    <DashboardLayout 
      title="Payments" 
      description="Manage your debt payments and payment schedules."
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming and past payments.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payments Dashboard</CardTitle>
          <CardDescription>
            This page is under development. Check back soon for full payment management features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="mb-4 text-muted-foreground">
              The payments management features are coming soon as part of our Next.js migration.
            </p>
            <Button disabled>Schedule Payment</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This function would normally verify authentication
  // We'll handle auth in the component via the DashboardLayout
  return {
    props: {},
  };
} 