import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Book, 
  CreditCard, 
  Settings, 
  RefreshCw, 
  PieChart, 
  Zap, 
  Lock, 
  UserCog, 
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    {
      id: 'getting-started',
      title: "Getting Started",
      icon: Book,
      description: "Learn the basics of Smart Debt Flow",
      articles: [
        {
          id: "account-setup",
          title: "Setting up your account",
          description: "Learn how to create and configure your Smart Debt Flow account",
          category: "getting-started",
          views: 3452
        },
        {
          id: "adding-debts",
          title: "Adding your debts",
          description: "How to add and manage different types of debts in the system",
          category: "getting-started",
          views: 2891
        },
        {
          id: "dashboard-overview",
          title: "Understanding your dashboard",
          description: "A guide to all the metrics and insights on your debt management dashboard",
          category: "getting-started",
          views: 2104
        },
        {
          id: "connection-guide",
          title: "Connecting financial accounts",
          description: "Securely link your bank and credit accounts for automated tracking",
          category: "getting-started",
          views: 1876
        }
      ]
    },
    {
      id: 'debt-strategies',
      title: "Debt Strategies",
      icon: Zap,
      description: "Optimize your debt repayment approach",
      articles: [
        {
          id: "snowball-method",
          title: "Debt Snowball method",
          description: "How the snowball method works and when to use it",
          category: "debt-strategies",
          views: 4210
        },
        {
          id: "avalanche-method",
          title: "Debt Avalanche method",
          description: "Using the avalanche method to minimize interest payments",
          category: "debt-strategies",
          views: 3987
        },
        {
          id: "ai-optimization",
          title: "AI-optimized payment plans",
          description: "How our AI customizes strategies for your specific situation",
          category: "debt-strategies",
          views: 3542
        },
        {
          id: "debt-consolidation",
          title: "Debt consolidation analysis",
          description: "When and how to consider debt consolidation options",
          category: "debt-strategies",
          views: 3201
        }
      ]
    },
    {
      id: 'account-billing',
      title: "Account & Billing",
      icon: CreditCard,
      description: "Manage your subscription and payments",
      articles: [
        {
          id: "subscription-plans",
          title: "Subscription plans comparison",
          description: "Detailed breakdown of Basic and Pro plan features",
          category: "account-billing",
          views: 1876
        },
        {
          id: "payment-methods",
          title: "Managing payment methods",
          description: "How to add, remove, or update your payment information",
          category: "account-billing",
          views: 1543
        },
        {
          id: "billing-history",
          title: "Accessing billing history",
          description: "How to view and download past invoices and receipts",
          category: "account-billing",
          views: 1321
        },
        {
          id: "cancellation",
          title: "Cancellation and refunds",
          description: "Our cancellation policy and how to request a refund",
          category: "account-billing",
          views: 2109
        }
      ]
    },
    {
      id: 'account-security',
      title: "Privacy & Security",
      icon: Lock,
      description: "Protect your financial information",
      articles: [
        {
          id: "data-protection",
          title: "How we protect your data",
          description: "Our encryption, storage, and security practices",
          category: "account-security",
          views: 2645
        },
        {
          id: "account-security",
          title: "Account security best practices",
          description: "Tips to keep your Smart Debt Flow account secure",
          category: "account-security",
          views: 1987
        },
        {
          id: "third-party-access",
          title: "Third-party connections",
          description: "Managing access for linked financial accounts",
          category: "account-security",
          views: 1562
        },
        {
          id: "privacy-policy",
          title: "Privacy policy explained",
          description: "Plain-language explanation of our privacy policy",
          category: "account-security",
          views: 1342
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: "Troubleshooting",
      icon: LifeBuoy,
      description: "Solve common problems",
      articles: [
        {
          id: "connection-issues",
          title: "Fixing account connection issues",
          description: "Solutions for problems with linked financial accounts",
          category: "troubleshooting",
          views: 3421
        },
        {
          id: "payment-tracking",
          title: "Payment tracking problems",
          description: "Troubleshooting when payments aren't properly recorded",
          category: "troubleshooting",
          views: 2876
        },
        {
          id: "login-issues",
          title: "Login and access issues",
          description: "Solutions for account access problems",
          category: "troubleshooting",
          views: 2543
        },
        {
          id: "data-sync",
          title: "Data synchronization errors",
          description: "Fixing issues with data updates between accounts",
          category: "troubleshooting",
          views: 2187
        }
      ]
    }
  ];

  const faqs = [
    {
      question: "How does Smart Debt Flow use AI to eliminate debt?",
      answer: "Our AI analyzes your complete financial picture including income, expenses, and all debts. It creates a customized debt elimination strategy by calculating the most efficient payment allocation, identifying opportunities for interest rate reduction, and adapting to your ongoing financial behavior. The system continuously optimizes your strategy as your situation changes, helping you become debt-free faster than traditional methods."
    },
    {
      question: "Is my financial information secure?",
      answer: "Absolutely. We use bank-level 256-bit encryption to protect your data and never store complete account numbers. Our platform is SOC 2 Type II certified, uses AES-256-GCM encryption for all sensitive data, and implements strict access controls. We maintain compliance with major financial security standards and conduct regular security audits."
    },
    {
      question: "What's the difference between the Basic and Pro plans?",
      answer: "The Basic plan ($20/mo after 7-day free trial) includes AI debt analysis, snowball/avalanche strategies, payment tracking, basic spending insights, payment reminders, and email support. The Pro plan ($50/mo) adds advanced AI financial analysis, all debt strategies, payment optimization, deep financial insights, budgeting recommendations, priority support, and unlimited AI assistance."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. After cancellation, you'll continue to have access until the end of your current billing period. We don't charge any cancellation fees, and we make the process straightforward."
    },
    {
      question: "How do I connect my financial accounts?",
      answer: "Our platform uses secure API connections to link with financial institutions. Go to the 'Accounts' section in your dashboard, click 'Add Account', and follow the prompts to connect accounts. We support most major banks and credit card providers through our secure integration partners, ensuring your credentials are never stored on our servers."
    }
  ];

  // Get all articles from all categories
  const allArticles = categories.flatMap(category => 
    category.articles.map(article => ({
      ...article,
      categoryTitle: category.title,
      categoryIcon: category.icon,
      categoryId: category.id
    }))
  );

  // Filter articles based on active category and search query
  const filteredArticles = allArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.categoryId === activeCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get popular articles
  const popularArticles = [...allArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

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
            Get the support you need on your journey to financial freedom
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
              placeholder="What can we help you with?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
              aria-label="Search help articles"
            />
          </div>
        </motion.div>

        {/* Topic Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="flex overflow-x-auto py-4 mb-8 no-scrollbar">
            <div className="flex space-x-4">
              <Button
                variant={activeCategory === 'all' ? "default" : "outline"}
                className={activeCategory === 'all' 
                  ? "bg-[#88B04B] hover:bg-[#7a9d43] text-white whitespace-nowrap" 
                  : "border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10 whitespace-nowrap"}
                onClick={() => setActiveCategory('all')}
              >
                All Topics
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={activeCategory === category.id 
                    ? "bg-[#88B04B] hover:bg-[#7a9d43] text-white whitespace-nowrap" 
                    : "border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10 whitespace-nowrap"}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <motion.article
                  key={`${article.categoryId}-${article.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-[#88B04B]/30 transition-colors h-full flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#88B04B]/20 flex items-center justify-center">
                      <article.categoryIcon className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <span className="text-sm text-gray-400">{article.categoryTitle}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 hover:text-[#88B04B] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 flex-grow">{article.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-400 flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      Article
                    </span>
                    <Link 
                      to={`/help/articles/${article.id}`}
                      className="text-[#88B04B] hover:text-[#7a9d43] p-0 h-auto text-sm font-medium"
                    >
                      Read more
                    </Link>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">
                <HelpCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-gray-300 mb-6">
                  We couldn't find any articles matching your search.
                </p>
                <Button 
                  variant="outline"
                  className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </motion.section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* FAQs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <HelpCircle className="w-6 h-6 text-[#88B04B] mr-3" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl border border-white/10 p-6"
                >
                  <h3 className="text-lg font-bold mb-3 text-[#88B04B]">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            {/* Popular Articles */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-white/10">
                Popular Articles
              </h3>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Link 
                    key={`${article.categoryId}-${article.id}-${index}`}
                    to={`/help/articles/${article.id}`}
                    className="flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-[#88B04B]/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <article.categoryIcon className="w-3 h-3 text-[#88B04B]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium group-hover:text-[#88B04B] transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{article.categoryTitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-6">
              <h3 className="text-xl font-bold mb-4">Still Need Help?</h3>
              <p className="text-sm text-gray-300 mb-6">
                Our support team is ready to assist you with any questions or issues
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-white/10 hover:bg-white/20 text-white justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Live Chat
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 hover:border-white/30 text-white justify-start"
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Email Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 hover:border-white/30 text-white justify-start"
                >
                  <Phone className="w-4 h-4 mr-3" />
                  Call Support
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 