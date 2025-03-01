import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Filter, 
  ArrowRight, 
  FileBarChart,
  FilePieChart,
  FileSparkles,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { formatCurrency } from '@/lib/utils';

// Report type definition
interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'spending' | 'debt' | 'savings' | 'tax' | 'custom';
  lastGenerated?: Date;
}

export function Reports() {
  const { dashboardState } = useDashboard();
  const { analytics, metrics, isLoading } = useDashboardAnalytics();
  const [activeTab, setActiveTab] = useState<'all' | 'spending' | 'debt' | 'savings' | 'tax'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Mock reports data
  const reports: Report[] = [
    {
      id: 'monthly-spending',
      name: 'Monthly Spending Report',
      description: 'Detailed breakdown of your spending by category with trends and insights',
      icon: <FileBarChart className="w-5 h-5" />,
      type: 'spending',
      lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: 'debt-analysis',
      name: 'Debt Analysis Report',
      description: 'Comprehensive analysis of your debt with payoff strategies and projections',
      icon: <FilePieChart className="w-5 h-5" />,
      type: 'debt',
      lastGenerated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    },
    {
      id: 'savings-forecast',
      name: 'Savings Forecast',
      description: 'Projections for your savings goals with recommendations',
      icon: <TrendingUp className="w-5 h-5" />,
      type: 'savings',
      lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      id: 'tax-summary',
      name: 'Tax Summary Report',
      description: 'Summary of tax-relevant financial activity and potential deductions',
      icon: <FileText className="w-5 h-5" />,
      type: 'tax'
    },
    {
      id: 'financial-health',
      name: 'Financial Health Assessment',
      description: 'Comprehensive review of your overall financial health with actionable insights',
      icon: <FileSparkles className="w-5 h-5" />,
      type: 'custom'
    }
  ];

  // Filter reports based on active tab
  const filteredReports = reports.filter(report => 
    activeTab === 'all' || report.type === activeTab
  );

  // Handle generating a report
  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(reportId);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(null);
      
      // In a real app, this would trigger a download or open a new tab
      const report = reports.find(r => r.id === reportId);
      if (report) {
        // Update the lastGenerated date
        report.lastGenerated = new Date();
        
        // Simulate download
        alert(`${report.name} has been generated and is ready for download.`);
      }
    }, 2000);
  };

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Monthly Spending</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {formatCurrency(dashboardState.totalSpent)}
          </p>
          <div className="flex items-center text-sm">
            <span className={dashboardState.monthlyChange < 0 ? 'text-green-400' : 'text-red-400'}>
              {dashboardState.monthlyChange < 0 ? '↓' : '↑'} 
              {Math.abs(dashboardState.monthlyChange)}%
            </span>
            <span className="text-white/60 ml-2">vs last month</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#88B04B]/20">
              <PieChart className="w-5 h-5 text-[#88B04B]" />
            </div>
            <h3 className="text-lg font-medium text-white">Budget Utilization</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {Math.round((dashboardState.totalSpent / dashboardState.totalBudget) * 100)}%
          </p>
          <div className="w-full bg-white/10 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full ${
                (dashboardState.totalSpent / dashboardState.totalBudget) > 0.9 
                  ? 'bg-red-500' 
                  : (dashboardState.totalSpent / dashboardState.totalBudget) > 0.75 
                    ? 'bg-amber-500' 
                    : 'bg-[#88B04B]'
              }`}
              style={{ width: `${Math.min(100, (dashboardState.totalSpent / dashboardState.totalBudget) * 100)}%` }}
            ></div>
          </div>
          <p className="text-white/60 text-sm">
            {formatCurrency(dashboardState.totalSpent)} of {formatCurrency(dashboardState.totalBudget)}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Debt Freedom Score</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {metrics?.debtFreedomScore || 0}/100
          </p>
          <div className="w-full bg-white/10 rounded-full h-2 mb-1">
            <div 
              className="h-2 rounded-full bg-purple-500"
              style={{ width: `${metrics?.debtFreedomScore || 0}%` }}
            ></div>
          </div>
          <p className="text-white/60 text-sm">
            {metrics?.debtFreedomScore && metrics.debtFreedomScore >= 70 
              ? 'Excellent progress!' 
              : metrics?.debtFreedomScore && metrics.debtFreedomScore >= 40 
                ? 'On the right track' 
                : 'Needs improvement'}
          </p>
        </div>
      </div>

      {/* Report filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Financial Reports</h2>
          <p className="text-white/60">Generate and download detailed reports of your finances</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-black/40 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'all' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('spending')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'spending' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Spending
            </button>
            <button
              onClick={() => setActiveTab('debt')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'debt' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Debt
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'savings' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setActiveTab('tax')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'tax' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Tax
            </button>
          </div>
          
          <div className="bg-black/40 rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                selectedPeriod === 'month' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                selectedPeriod === 'quarter' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                selectedPeriod === 'year' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-xl bg-black/40 border border-white/10 hover:bg-black/50 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/5 text-white">
                  {report.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{report.name}</h3>
                  <p className="text-white/60 text-sm">{report.description}</p>
                  
                  <div className="flex items-center mt-2 text-xs text-white/40">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>Last generated: {formatDate(report.lastGenerated)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-auto">
                {report.lastGenerated && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  className="gap-2 min-w-[140px]"
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isGenerating === report.id}
                >
                  {isGenerating === report.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom report section */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/30 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Need a custom report?</h3>
            <p className="text-white/70">
              Create a tailored report with exactly the data and insights you need
            </p>
          </div>
          <Button className="gap-2">
            <Filter className="w-4 h-4" />
            Create Custom Report
          </Button>
        </div>
      </div>

      {/* Financial insights */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">Report Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-medium text-white">Spending Trends</h4>
            </div>
            <p className="text-white/70 text-sm mb-3">
              Your top spending categories this {selectedPeriod} were Dining, Entertainment, and Shopping.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">View detailed spending analysis</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#88B04B]/20">
                <TrendingUp className="w-5 h-5 text-[#88B04B]" />
              </div>
              <h4 className="font-medium text-white">Debt Reduction</h4>
            </div>
            <p className="text-white/70 text-sm mb-3">
              You've reduced your total debt by {formatCurrency(Math.abs(dashboardState.monthlyChange * dashboardState.totalDebt / 100))} this {selectedPeriod}.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="w-4 h-4 text-[#88B04B]" />
              <span className="text-[#88B04B]">View debt payoff progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax planning section */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Tax Planning</h3>
        </div>
        
        <p className="text-white/70 mb-4">
          Stay ahead of your tax obligations with our tax planning tools and reports.
          Generate tax summaries, track potential deductions, and prepare for tax season.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Tax Summary
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Tax Data
          </Button>
          <Button className="gap-2">
            <Calendar className="w-4 h-4" />
            Tax Calendar
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 