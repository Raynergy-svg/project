import { motion } from 'framer-motion';
import { Search, HelpCircle, MessageCircle, Mail, Phone, FileText, Book, CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: "Getting Started",
      icon: Book,
      description: "Learn the basics of using Smart Debt Flow",
      articles: [
        "Creating your account",
        "Setting up your first debt plan",
        "Understanding your dashboard",
        "Connecting financial accounts"
      ]
    },
    {
      title: "Account & Billing",
      icon: CreditCard,
      description: "Manage your subscription and billing",
      articles: [
        "Subscription plans",
        "Payment methods",
        "Billing history",
        "Cancellation policy"
      ]
    },
    {
      title: "Features & Settings",
      icon: Settings,
      description: "Explore platform features and customization",
      articles: [
        "AI recommendations",
        "Debt strategies",
        "Progress tracking",
        "Account settings"
      ]
    }
  ];

  const faqs = [
    {
      question: "How does Smart Debt Flow use AI to manage debt?",
      answer: "Our AI analyzes your financial data to create personalized debt management strategies, optimize payment schedules, and identify potential savings opportunities. The system continuously learns and adapts to your financial behavior to provide the most effective recommendations."
    },
    {
      question: "Is my financial information secure?",
      answer: "Yes, we use bank-level 256-bit encryption to protect your data. Our platform is SOC 2 Type II certified and complies with all major financial security standards. We never store sensitive information like full account numbers or passwords."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access until the end of your current billing period. We don't charge any cancellation fees."
    },
    {
      question: "How do I connect my financial accounts?",
      answer: "Smart Debt Flow uses secure API connections to link with your financial institutions. Simply go to the 'Accounts' section, click 'Add Account', and follow the prompts to securely connect your accounts. We support most major banks and financial institutions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Help Center
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Find answers, guides, and support for Smart Debt Flow
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
            />
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-[#88B04B]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-gray-300 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article} className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#88B04B] cursor-pointer transition-colors">
                      <FileText className="w-4 h-4" />
                      {article}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-[#88B04B]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8">
            <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <MessageCircle className="w-8 h-8 text-[#88B04B] mx-auto mb-4" />
                <h3 className="font-bold mb-2">Live Chat</h3>
                <p className="text-gray-300 mb-4">Chat with our support team</p>
                <Button
                  className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white w-full"
                >
                  Start Chat
                </Button>
              </div>
              <div className="text-center">
                <Mail className="w-8 h-8 text-[#88B04B] mx-auto mb-4" />
                <h3 className="font-bold mb-2">Email Support</h3>
                <p className="text-gray-300 mb-4">Get help via email</p>
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10 w-full"
                >
                  Send Email
                </Button>
              </div>
              <div className="text-center">
                <Phone className="w-8 h-8 text-[#88B04B] mx-auto mb-4" />
                <h3 className="font-bold mb-2">Phone Support</h3>
                <p className="text-gray-300 mb-4">Call us directly</p>
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10 w-full"
                >
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 