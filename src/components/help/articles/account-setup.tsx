import React from 'react';
import { Book, CheckCircle, Shield, User, Mail, Key, Eye, EyeOff, CreditCard, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  id: "account-setup",
  title: "Setting up your account",
  description: "Learn how to create and configure your Smart Debt Flow account",
  category: "getting-started",
  categoryTitle: "Getting Started",
  lastUpdated: "April 15, 2023",
  readTime: "5 min read"
};

const AccountSetupArticle = () => {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Getting Started with Smart Debt Flow</h2>
        <p className="text-gray-300 mb-4">
          Welcome to Smart Debt Flow! This guide will walk you through the process of setting up your account
          and getting started with our AI-powered debt management platform. Follow these simple steps to begin
          your journey toward financial freedom.
        </p>
        <div className="bg-[#88B04B]/10 border border-[#88B04B]/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-200">
              <strong>Note:</strong> Smart Debt Flow offers a 7-day free trial with our Basic plan. You'll need to 
              provide payment information to start your trial, but you won't be charged until the trial period ends.
            </p>
          </div>
        </div>
      </section>

      {/* Step 1: Sign Up */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
            <span className="font-bold text-[#88B04B]">1</span>
          </div>
          <h3 className="text-xl font-bold">Create Your Account</h3>
        </div>
        <div className="pl-11">
          <p className="text-gray-300 mb-4">
            Visit the <span className="text-[#88B04B]">Sign Up</span> page and follow these steps:
          </p>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Enter your full name</p>
                <p className="text-sm text-gray-400">This will be displayed on your profile and reports</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Enter your email address</p>
                <p className="text-sm text-gray-400">You'll use this to log in and receive important updates</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Key className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Create a strong password</p>
                <p className="text-sm text-gray-400">
                  Use at least 8 characters with a mix of letters, numbers, and symbols
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Accept the terms of service and privacy policy</p>
                <p className="text-sm text-gray-400">
                  Review our policies to understand how we protect your data
                </p>
              </div>
            </li>
          </ol>
          <div className="mt-4 mb-6 bg-gray-900/60 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-4 bg-[#88B04B] text-black text-xs px-2 py-1 rounded">
              Example
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Full Name</p>
                <div className="bg-white/10 rounded p-2 text-gray-300">
                  Sarah Johnson
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Email Address</p>
                <div className="bg-white/10 rounded p-2 text-gray-300">
                  sarah.johnson@example.com
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Password</p>
                <div className="bg-white/10 rounded p-2 text-gray-300 flex justify-between">
                  <span>••••••••••••</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Choose Your Plan */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
            <span className="font-bold text-[#88B04B]">2</span>
          </div>
          <h3 className="text-xl font-bold">Select Your Subscription Plan</h3>
        </div>
        <div className="pl-11">
          <p className="text-gray-300 mb-4">
            Choose the subscription plan that best fits your needs:
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-[#88B04B]/30 transition-all">
              <h4 className="text-lg font-bold mb-2">Basic Plan</h4>
              <p className="text-[#88B04B] mb-4">Free for 7 days, then $20/mo</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>AI-powered debt analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Custom debt strategy (Snowball or Avalanche)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Real-time payment tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Basic spending insights</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl border border-[#88B04B]/30 p-6 relative">
              <div className="absolute -top-3 right-4 bg-[#88B04B] text-black text-xs px-2 py-1 rounded">
                Recommended
              </div>
              <h4 className="text-lg font-bold mb-2">Pro Plan</h4>
              <p className="text-[#88B04B] mb-4">$50/mo</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Everything in Basic, plus:</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Advanced AI financial analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>All debt management strategies</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Deep financial insights & forecasting</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Priority customer support</span>
                </li>
              </ul>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            After selecting your plan, you'll proceed to payment information.
          </p>
        </div>
      </section>

      {/* Step 3: Payment Information */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
            <span className="font-bold text-[#88B04B]">3</span>
          </div>
          <h3 className="text-xl font-bold">Enter Payment Information</h3>
        </div>
        <div className="pl-11">
          <p className="text-gray-300 mb-4">
            Even for the free trial, you'll need to provide payment details. Your card won't be charged until the trial ends.
          </p>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Enter your card information</p>
                <p className="text-sm text-gray-400">We accept all major credit and debit cards</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Provide billing address</p>
                <p className="text-sm text-gray-400">Must match the address on your card statement</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Review billing details</p>
                <p className="text-sm text-gray-400">
                  For Basic plan: $0 today, then $20/month after 7 days
                  <br />
                  For Pro plan: $50/month starting today
                </p>
              </div>
            </li>
          </ol>
          <div className="bg-[#88B04B]/10 border border-[#88B04B]/30 rounded-lg p-4 flex items-start gap-3 mt-6">
            <Shield className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-200">
                <strong>Secure Payment:</strong> All payment information is protected with bank-level encryption 
                and we never store your complete card details on our servers. We use a trusted payment processor
                to handle all transactions securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: Account Activation */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
            <span className="font-bold text-[#88B04B]">4</span>
          </div>
          <h3 className="text-xl font-bold">Activate Your Account</h3>
        </div>
        <div className="pl-11">
          <p className="text-gray-300 mb-4">
            After completing payment, you'll need to verify your email address to fully activate your account:
          </p>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Check your email inbox</p>
                <p className="text-sm text-gray-400">
                  We'll send a verification link to the email address you provided
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Click the verification link</p>
                <p className="text-sm text-gray-400">
                  This confirms your email address and activates your account
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Log in to your account</p>
                <p className="text-sm text-gray-400">
                  Once verified, you'll be redirected to the dashboard to begin setting up your profile
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* What's Next */}
      <section>
        <h3 className="text-xl font-bold mb-4">What's Next?</h3>
        <p className="text-gray-300 mb-4">
          Now that your account is set up, you'll want to:
        </p>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-[#88B04B]">1</span>
            </div>
            <p className="text-gray-300">
              <span className="text-[#88B04B] font-medium">Add your debts</span> - Input information about all your loans, credit cards, and other debts
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-[#88B04B]">2</span>
            </div>
            <p className="text-gray-300">
              <span className="text-[#88B04B] font-medium">Connect your accounts</span> - Link your financial accounts for automatic tracking
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#88B04B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-[#88B04B]">3</span>
            </div>
            <p className="text-gray-300">
              <span className="text-[#88B04B] font-medium">Customize your preferences</span> - Set your financial goals and preferences
            </p>
          </li>
        </ol>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <a href="#" className="text-[#88B04B] font-medium hover:underline flex items-center">
            <Book className="w-4 h-4 mr-2" />
            Learn how to add your debts
          </a>
          <a href="#" className="text-[#88B04B] font-medium hover:underline flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Read about our security measures
          </a>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="border-t border-white/10 pt-8">
        <h3 className="text-xl font-bold mb-4">Troubleshooting</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">I didn't receive a verification email</h4>
            <p className="text-gray-300 text-sm">
              Check your spam folder. If you still don't see it, go to the login page and click
              "Resend verification email". Emails typically arrive within 5 minutes.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">I'm having trouble with the payment process</h4>
            <p className="text-gray-300 text-sm">
              Make sure your card information is entered correctly. If problems persist, contact your bank
              to ensure there are no restrictions on your card, or try a different payment method.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#88B04B] mb-2">How do I change my subscription plan later?</h4>
            <p className="text-gray-300 text-sm">
              You can change your plan anytime from the Account Settings page. Upgrades take effect immediately,
              while downgrades will apply at the end of your current billing cycle.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountSetupArticle; 