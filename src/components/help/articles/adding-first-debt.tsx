import React from 'react';
import { 
  CreditCard, 
  BarChart3, 
  Plus, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  Percent, 
  FileText, 
  Building2, 
  Home, 
  Bookmark, 
  Car, 
  Briefcase 
} from 'lucide-react';

export const metadata = {
  id: "adding-first-debt",
  title: "Adding your first debt",
  description: "Learn how to add and categorize your debts in Smart Debt Flow",
  category: "getting-started",
  categoryTitle: "Getting Started",
  lastUpdated: "May 10, 2023",
  readTime: "5 min read"
};

const AddingFirstDebtArticle = () => {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Adding Your Debts to Smart Debt Flow</h2>
        <p className="text-gray-300 mb-4">
          One of the most important steps in your debt-free journey is adding all your debts to Smart Debt Flow.
          This article will guide you through the process of adding your first debt and explain how to categorize
          and organize all your financial obligations for optimal tracking and payoff planning.
        </p>
        <div className="bg-[#88B04B]/10 border border-[#88B04B]/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-200">
              <strong>For the best results:</strong> Add all your debts to the system - even small ones. This gives our
              AI the complete picture of your financial situation to create the most effective payoff strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Types of Debts */}
      <section>
        <h3 className="text-xl font-bold mb-4">Types of Debts You Can Track</h3>
        <p className="text-gray-300 mb-4">
          Smart Debt Flow allows you to track and manage various types of debt, including:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Credit Cards</p>
              <p className="text-sm text-gray-400">
                Track balances, interest rates, minimum payments, and due dates for all your credit cards
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <Home className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Mortgages</p>
              <p className="text-sm text-gray-400">
                Manage your mortgage payments, track principal reduction, and see amortization schedules
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <Bookmark className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Student Loans</p>
              <p className="text-sm text-gray-400">
                Track multiple student loans, including federal and private loans with different terms
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <Car className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Auto Loans</p>
              <p className="text-sm text-gray-400">
                Monitor your car loan payoff progress, including payment schedule and payoff date
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Personal Loans</p>
              <p className="text-sm text-gray-400">
                Track personal loans from banks, credit unions, or peer-to-peer lending platforms
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Other Debts</p>
              <p className="text-sm text-gray-400">
                Medical bills, family loans, buy-now-pay-later agreements, and any other financial obligations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section>
        <h3 className="text-xl font-bold mb-4">Step-by-Step: Adding Your First Debt</h3>
        
        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
              <span className="font-bold text-[#88B04B]">1</span>
            </div>
            <h4 className="text-lg font-bold">Navigate to the Debts Section</h4>
          </div>
          <div className="pl-11">
            <p className="text-gray-300 mb-4">
              From your dashboard, click on "Debts" in the left sidebar navigation. Alternatively, you can click
              the "Add Debt" button in the Debt Overview widget on your dashboard.
            </p>
            <div className="bg-gray-900/60 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-300 mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-[#88B04B]" />
                <span>Go to <span className="text-[#88B04B]">Dashboard</span> → <span className="text-[#88B04B]">Debts</span> → <span className="text-[#88B04B]">Add New Debt</span></span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
              <span className="font-bold text-[#88B04B]">2</span>
            </div>
            <h4 className="text-lg font-bold">Select the Debt Type</h4>
          </div>
          <div className="pl-11">
            <p className="text-gray-300 mb-4">
              Choose the type of debt you're adding from the available options. This helps categorize your debt correctly
              and enables Smart Debt Flow to apply the most appropriate strategies for that debt type.
            </p>
            <div className="bg-gray-900/60 rounded-lg p-5 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#88B04B]/20 cursor-pointer transition-all">
                  <CreditCard className="w-8 h-8 text-[#88B04B]" />
                  <p className="text-sm">Credit Card</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#88B04B]/20 cursor-pointer transition-all">
                  <Home className="w-8 h-8 text-white/70" />
                  <p className="text-sm">Mortgage</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#88B04B]/20 cursor-pointer transition-all">
                  <Bookmark className="w-8 h-8 text-white/70" />
                  <p className="text-sm">Student Loan</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#88B04B]/20 cursor-pointer transition-all">
                  <Car className="w-8 h-8 text-white/70" />
                  <p className="text-sm">Auto Loan</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#88B04B]/20 cursor-pointer transition-all">
                  <Building2 className="w-8 h-8 text-white/70" />
                  <p className="text-sm">Personal Loan</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#88B04B]/20 cursor-pointer transition-all">
                  <FileText className="w-8 h-8 text-white/70" />
                  <p className="text-sm">Other</p>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm italic">
              In this example, we're selecting "Credit Card" as our debt type.
            </p>
          </div>
        </div>
        
        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
              <span className="font-bold text-[#88B04B]">3</span>
            </div>
            <h4 className="text-lg font-bold">Enter Debt Details</h4>
          </div>
          <div className="pl-11">
            <p className="text-gray-300 mb-4">
              Fill in the required information about your debt. The more accurate and complete this information is, 
              the better our AI can optimize your payoff strategy. Required fields vary based on debt type, 
              but typically include:
            </p>
            <div className="space-y-5 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Debt Name & Description</p>
                  <p className="text-sm text-gray-400">
                    Enter a recognizable name for this debt (e.g., "Chase Sapphire Card" or "Capital One Visa")
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Current Balance</p>
                  <p className="text-sm text-gray-400">
                    The total amount you currently owe on this debt
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Percent className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Interest Rate (APR)</p>
                  <p className="text-sm text-gray-400">
                    The annual percentage rate for this debt (e.g., 18.99%)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Minimum Monthly Payment</p>
                  <p className="text-sm text-gray-400">
                    The minimum amount required each month to keep the account in good standing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Due Date</p>
                  <p className="text-sm text-gray-400">
                    When your payment is due each month
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 mb-4 bg-gray-900/60 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-4 bg-[#88B04B] text-black text-xs px-2 py-1 rounded">
                Example
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Debt Name</p>
                  <div className="bg-white/10 rounded p-2 text-gray-300">
                    Chase Freedom Credit Card
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Current Balance</p>
                  <div className="bg-white/10 rounded p-2 text-gray-300">
                    $4,250.00
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Interest Rate (APR)</p>
                  <div className="bg-white/10 rounded p-2 text-gray-300">
                    22.49%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Minimum Monthly Payment</p>
                  <div className="bg-white/10 rounded p-2 text-gray-300">
                    $110.00
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Due Date</p>
                  <div className="bg-white/10 rounded p-2 text-gray-300">
                    15th of each month
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#88B04B]/10 border border-[#88B04B]/30 rounded-lg p-4 flex items-start gap-3 mt-4">
              <AlertCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-200">
                  <strong>Tip:</strong> For most accurate results, check your latest statement or log in to your 
                  account online to verify the current balance and interest rate.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step 4 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
              <span className="font-bold text-[#88B04B]">4</span>
            </div>
            <h4 className="text-lg font-bold">Additional Details (Optional)</h4>
          </div>
          <div className="pl-11">
            <p className="text-gray-300 mb-4">
              While not required, these additional details help our AI create a more tailored strategy:
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Credit Limit</p>
                  <p className="text-sm text-gray-400">
                    For credit cards, entering your credit limit helps track credit utilization ratio
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Percent className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Promotional Rates</p>
                  <p className="text-sm text-gray-400">
                    If you have a promotional interest rate, enter the rate and when it expires
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Lender/Servicer Information</p>
                  <p className="text-sm text-gray-400">
                    Contact information and account details for your lender or loan servicer
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Payment History</p>
                  <p className="text-sm text-gray-400">
                    You can optionally import or manually add past payments to better visualize your progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step 5 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
              <span className="font-bold text-[#88B04B]">5</span>
            </div>
            <h4 className="text-lg font-bold">Save Your Debt</h4>
          </div>
          <div className="pl-11">
            <p className="text-gray-300 mb-4">
              Once you've entered all the information, click the "Save Debt" button. Your debt will now appear
              in your dashboard and be included in your overall debt payoff strategy.
            </p>
            <div className="bg-gray-900/60 rounded-lg p-4 mb-4 flex items-center justify-center">
              <button className="bg-[#88B04B] text-black font-medium py-2 px-6 rounded-lg hover:bg-[#88B04B]/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Save Debt
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              After adding your first debt, you'll return to the Debts page where you can:
            </p>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-[#88B04B] mt-1 flex-shrink-0" />
                <span>Add additional debts by clicking "Add Another Debt"</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-[#88B04B] mt-1 flex-shrink-0" />
                <span>Review a summary of all your debts in one place</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-[#88B04B] mt-1 flex-shrink-0" />
                <span>See initial recommendations for your debt payoff strategy</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Auto-Linking Options */}
      <section>
        <h3 className="text-xl font-bold mb-4">Connecting Financial Accounts (Optional)</h3>
        <p className="text-gray-300 mb-4">
          For the most seamless experience, you can connect your financial accounts directly to Smart Debt Flow.
          This allows automatic updates to your balances and tracking of payments.
        </p>
        <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
          <h4 className="font-medium mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-[#88B04B]" />
            Benefits of Connecting Accounts
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#88B04B]" />
              </div>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">Automatic Updates:</span> Balances and payments are updated daily
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#88B04B]" />
              </div>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">Accurate Tracking:</span> No need to manually update balances after payments
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#88B04B]" />
              </div>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">Spending Insights:</span> Get additional insights on spending patterns that affect your debt
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#88B04B]" />
              </div>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">Time-Saving:</span> Eliminates the need for manual data entry
              </p>
            </li>
          </ul>
          <div className="mt-6">
            <p className="text-gray-400 text-sm">
              To connect accounts, go to <span className="text-[#88B04B]">Settings</span> → <span className="text-[#88B04B]">Connected Accounts</span> and follow the prompts to securely link your financial institutions.
            </p>
          </div>
        </div>
        <div className="bg-[#88B04B]/10 border border-[#88B04B]/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-200">
              <strong>Security Note:</strong> Smart Debt Flow uses bank-level encryption and never stores your login credentials. 
              We use a trusted third-party service that specializes in secure financial connections.
            </p>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="border-t border-white/10 pt-8">
        <h3 className="text-xl font-bold mb-4">Common Questions</h3>
        <div className="space-y-5">
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">How many debts should I add?</h4>
            <p className="text-gray-300 text-sm">
              Add <strong>all</strong> of your debts for the most effective payoff strategy. Even small debts should be included
              since they affect your overall financial picture and may be targeted first in certain strategies.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">What if I don't know my exact interest rate?</h4>
            <p className="text-gray-300 text-sm">
              Check your most recent statement or online account for the current interest rate. If you can't find it,
              call your lender or make your best estimate. You can always update this information later.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">Should I include my mortgage?</h4>
            <p className="text-gray-300 text-sm">
              Yes, including your mortgage gives you a complete picture of your financial obligations. However,
              our strategies typically prioritize higher-interest debts before mortgages unless you specifically
              choose to focus on your mortgage.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">Can I edit debt information later?</h4>
            <p className="text-gray-300 text-sm">
              Yes, you can edit any debt information at any time. Simply go to the Debts section, select the debt
              you wish to modify, and click the "Edit" button to update any details.
            </p>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="border-t border-white/10 pt-8 mt-8">
        <h3 className="text-xl font-bold mb-4">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">
              Understanding Payment Strategies
            </p>
            <p className="text-sm text-gray-400">
              Learn about different debt payment methods and how to choose the right one for you
            </p>
          </a>
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">
              Tracking Your Debt Payments
            </p>
            <p className="text-sm text-gray-400">
              How to record payments and track your progress toward becoming debt-free
            </p>
          </a>
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">
              Securely Connecting Financial Accounts
            </p>
            <p className="text-sm text-gray-400">
              Detailed guide on how to link your accounts and our security measures
            </p>
          </a>
          <a href="#" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#88B04B]/30 transition-all group">
            <p className="font-medium mb-1 group-hover:text-[#88B04B] transition-colors">
              Setting Up Payment Reminders
            </p>
            <p className="text-sm text-gray-400">
              Never miss a payment with customized alerts and notifications
            </p>
          </a>
        </div>
      </section>
    </div>
  );
};

export default AddingFirstDebtArticle; 