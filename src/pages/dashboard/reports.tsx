import { GetServerSideProps } from 'next';
import { BarChart3, PieChart } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      description="View detailed reports about your debt and progress."
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze your debt reduction progress and financial metrics.
        </p>
      </div>
      
      <Tabs defaultValue="debt" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="debt">Debt Reports</TabsTrigger>
          <TabsTrigger value="progress">Progress Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="debt">
          <Card>
            <CardHeader>
              <CardTitle>Debt Distribution</CardTitle>
              <CardDescription>
                This report will show the breakdown of your debts by type, interest rate, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Reports are coming soon as part of our Next.js migration.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Debt Reduction Progress</CardTitle>
              <CardDescription>
                This report will show your progress over time and projected debt-free date.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Reports are coming soon as part of our Next.js migration.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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