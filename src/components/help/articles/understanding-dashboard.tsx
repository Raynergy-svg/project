import React from 'react';
import { PieChart, LineChart, Zap, CreditCard, Clock, Calendar, ArrowDown, BarChart3, TrendingUp, Wallet, BellRing, Settings, Users } from 'lucide-react';

export const metadata = {
  id: "understanding-dashboard",
  title: "Understanding the dashboard",
  description: "Learn how to navigate and use the features of your Smart Debt Flow dashboard",
  category: "getting-started",
  categoryTitle: "Getting Started",
  lastUpdated: "May 2, 2023",
  readTime: "6 min read"
};

const UnderstandingDashboardArticle = () => {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Navigating Your Smart Debt Flow Dashboard</h2>
        <p className="text-gray-300 mb-4">
          Your dashboard is the command center of your debt management journey. This guide will help you understand
          each element of the dashboard and how to use it effectively to track and manage your path to financial freedom.
        </p>
        <div className="bg-[#88B04B]/10 border border-[#88B04B]/30 rounded-lg p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-200">
              <strong>Pro Tip:</strong> For the best experience, we recommend visiting your dashboard at least
              weekly to track your progress and make adjustments to your debt payoff strategy as needed.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Overview */}
      <section>
        <h3 className="text-xl font-bold mb-4">Dashboard Overview</h3>
        <div className="bg-gray-900/60 rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-white/10">
            <h4 className="font-medium">Dashboard Layout</h4>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all">
                <h5 className="font-medium mb-2 flex items-center">
                  <LineChart className="w-4 h-4 mr-2 text-[#88B04B]" />
                  Left Sidebar
                </h5>
                <p className="text-sm text-gray-300">
                  Navigation and quick access to different sections of the platform
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all">
                <h5 className="font-medium mb-2 flex items-center">
                  <PieChart className="w-4 h-4 mr-2 text-[#88B04B]" />
                  Main Content Area
                </h5>
                <p className="text-sm text-gray-300">
                  Displays your financial overview, debt breakdown, and payment schedule
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all">
                <h5 className="font-medium mb-2 flex items-center">
                  <BellRing className="w-4 h-4 mr-2 text-[#88B04B]" />
                  Right Sidebar
                </h5>
                <p className="text-sm text-gray-300">
                  Alerts, upcoming payments, and personalized recommendations
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Your dashboard is fully responsive and will adjust to the size of your screen, whether you're using a desktop, tablet, or mobile device.
            </p>
          </div>
        </div>
      </section>

      {/* Key Dashboard Components */}
      <section>
        <h3 className="text-xl font-bold mb-4">Key Dashboard Components</h3>
        <div className="space-y-6">
          {/* Debt Overview */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0">
                <PieChart className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1">Debt Overview</h4>
                <p className="text-gray-300 mb-3">
                  Visual breakdown of your total debt and progress toward becoming debt-free
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">1</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Total Debt Remaining</p>
                      <p className="text-sm text-gray-400">
                        A real-time calculation of your remaining debt across all accounts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">2</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Debt Distribution</p>
                      <p className="text-sm text-gray-400">
                        Pie chart showing the distribution of debt across different types (credit cards, loans, etc.)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">3</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Overall Progress</p>
                      <p className="text-sm text-gray-400">
                        Visual progress bar showing how much of your total debt you've paid off
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Strategy */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1">AI-Powered Payment Strategy</h4>
                <p className="text-gray-300 mb-3">
                  Your personalized debt repayment plan, optimized by our AI algorithm
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">1</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Current Strategy</p>
                      <p className="text-sm text-gray-400">
                        Shows whether you're using the Snowball, Avalanche, or Custom method
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">2</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Target Debt</p>
                      <p className="text-sm text-gray-400">
                        The specific debt our AI recommends focusing on next to maximize your progress
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">3</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Estimated Timeline</p>
                      <p className="text-sm text-gray-400">
                        Projected date when you'll be debt-free based on your current payment strategy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1">Payment Schedule</h4>
                <p className="text-gray-300 mb-3">
                  Calendar view of upcoming payments and due dates
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">1</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Upcoming Payments</p>
                      <p className="text-sm text-gray-400">
                        List of payments due in the next 30 days with amount and due date
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">2</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Payment History</p>
                      <p className="text-sm text-gray-400">
                        Record of past payments, helping you track your consistency
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">3</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Auto-Payment Status</p>
                      <p className="text-sm text-gray-400">
                        Indicates which debts are set up for automatic payments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Insights */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1">Smart Insights</h4>
                <p className="text-gray-300 mb-3">
                  AI-generated insights about your financial behavior and debt reduction progress
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">1</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Payment Trends</p>
                      <p className="text-sm text-gray-400">
                        Analysis of your payment behavior over time, highlighting consistency
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">2</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Interest Saved</p>
                      <p className="text-sm text-gray-400">
                        Calculation of interest saved through your accelerated payment strategy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#88B04B]">3</span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">Recommendations</p>
                      <p className="text-sm text-gray-400">
                        Personalized suggestions for optimizing your debt payoff strategy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Actions */}
      <section>
        <h3 className="text-xl font-bold mb-4">Dashboard Actions</h3>
        <p className="text-gray-300 mb-4">
          Your dashboard allows you to perform several important actions to manage your debt:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Add a New Debt</p>
              <p className="text-sm text-gray-400">
                Add a new credit card, loan, or other debt to your profile by clicking the "+" button in the Debt Overview section
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Change Strategy</p>
              <p className="text-sm text-gray-400">
                Switch between Snowball, Avalanche, or Custom debt payment strategies using the Strategy section
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <Wallet className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Record a Payment</p>
              <p className="text-sm text-gray-400">
                Log a payment you've made by selecting the debt and entering the payment amount
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <Settings className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Adjust Settings</p>
              <p className="text-sm text-gray-400">
                Customize notification preferences, payment reminders, and dashboard display options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalization */}
      <section>
        <h3 className="text-xl font-bold mb-4">Personalizing Your Dashboard</h3>
        <p className="text-gray-300 mb-4">
          You can customize your dashboard to focus on the information that matters most to you:
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-[#88B04B]">1</span>
            </div>
            <div>
              <p className="text-gray-200 font-medium">Widget Arrangement</p>
              <p className="text-sm text-gray-400">
                Drag and drop dashboard widgets to rearrange them in your preferred order
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-[#88B04B]">2</span>
            </div>
            <div>
              <p className="text-gray-200 font-medium">Visibility Controls</p>
              <p className="text-sm text-gray-400">
                Show or hide specific sections by using the "Customize Dashboard" option in settings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-[#88B04B]">3</span>
            </div>
            <div>
              <p className="text-gray-200 font-medium">Focus Mode</p>
              <p className="text-sm text-gray-400">
                Toggle "Focus Mode" to highlight only your current target debt and next actions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Notes */}
      <section>
        <h3 className="text-xl font-bold mb-4">Accessibility Features</h3>
        <p className="text-gray-300 mb-4">
          Smart Debt Flow is designed to be accessible to all users:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-medium mb-1 text-[#88B04B]">High Contrast Mode</p>
            <p className="text-sm text-gray-300">
              Enable high contrast in settings for better visibility
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-medium mb-1 text-[#88B04B]">Screen Reader Support</p>
            <p className="text-sm text-gray-300">
              All dashboard elements are optimized for screen readers
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-medium mb-1 text-[#88B04B]">Keyboard Navigation</p>
            <p className="text-sm text-gray-300">
              Navigate the entire dashboard using only keyboard shortcuts
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-medium mb-1 text-[#88B04B]">Text Size Adjustment</p>
            <p className="text-sm text-gray-300">
              Easily adjust text size without losing functionality
            </p>
          </div>
        </div>
      </section>

      {/* Mobile Experience */}
      <section>
        <h3 className="text-xl font-bold mb-4">Mobile Dashboard Experience</h3>
        <p className="text-gray-300 mb-4">
          Your Smart Debt Flow dashboard is fully optimized for mobile devices:
        </p>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="font-medium mb-2 text-[#88B04B]">Responsive Design</h4>
            <p className="text-sm text-gray-300">
              The dashboard automatically adjusts to fit any screen size while maintaining all functionality
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="font-medium mb-2 text-[#88B04B]">Touch Optimization</h4>
            <p className="text-sm text-gray-300">
              Large touch targets and swipe gestures make navigation intuitive on touchscreen devices
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="font-medium mb-2 text-[#88B04B]">Offline Access</h4>
            <p className="text-sm text-gray-300">
              View your dashboard even without an internet connection (data will sync when you're back online)
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="border-t border-white/10 pt-8">
        <h3 className="text-xl font-bold mb-4">Troubleshooting</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">Dashboard not loading properly?</h4>
            <p className="text-gray-300 text-sm">
              Try clearing your browser cache or using a different browser. If problems persist,
              try accessing the dashboard in incognito/private browsing mode.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">Information not updating?</h4>
            <p className="text-gray-300 text-sm">
              Click the refresh button in the top-right corner of the dashboard. If information is still outdated,
              log out and log back in to refresh your session.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">Can't find a specific feature?</h4>
            <p className="text-gray-300 text-sm">
              Use the search bar at the top of the dashboard to quickly locate any feature or section.
              You can also check the "What's New" notification to learn about recent updates.
            </p>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="border-t border-white/10 pt-8">
        <h3 className="text-xl font-bold mb-4">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">Adding and Managing Your Debts</p>
            <p className="text-sm text-gray-400">Learn how to add, edit, and manage all your debts in the system</p>
          </a>
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">Understanding Payment Strategies</p>
            <p className="text-sm text-gray-400">Compare different debt payment methods and choose what's right for you</p>
          </a>
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">Setting Financial Goals</p>
            <p className="text-sm text-gray-400">Create and track custom financial goals alongside your debt payoff</p>
          </a>
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">Mobile App Guide</p>
            <p className="text-sm text-gray-400">Get the most out of the Smart Debt Flow mobile application</p>
          </a>
        </div>
      </section>
    </div>
  );
};

export default UnderstandingDashboardArticle; 