import { motion } from 'framer-motion';
import { 
  Search, BookOpen, PieChart, DollarSign, Calculator, Lightbulb, 
  BookMarked, Wallet, TrendingUp, Star, List, Clock, Zap, 
  BarChart2, Heart, TrendingDown, FileText, Lock, Database, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Docs' },
    { id: 'guides', name: 'User Guides' },
    { id: 'financial', name: 'Financial Resources' },
    { id: 'tools', name: 'Tools & Calculators' },
  ];

  // User Guides
  const userGuideDocs = [
    {
      title: "Getting Started Guide",
      icon: BookOpen,
      description: "Everything you need to know to start using Smart Debt Flow",
      category: 'guides',
      badge: 'Beginner'
    },
    {
      title: "Account Setup & Security",
      icon: Lock,
      description: "Secure your account and configure personal settings",
      category: 'guides',
      badge: null
    },
    {
      title: "Data Import & Export",
      icon: Database,
      description: "Import your financial data and export reports",
      category: 'guides',
      badge: null
    },
    {
      title: "Dashboard Customization",
      icon: BookMarked,
      description: "Customize your dashboard view and widgets",
      category: 'guides',
      badge: 'New'
    },
  ];

  // Financial Resources
  const financialResources = [
    {
      title: "Understanding Credit Scores",
      icon: TrendingUp,
      description: "Learn how credit scores work and strategies to improve your score",
      category: 'financial',
      badge: null
    },
    {
      title: "Financial Planning Basics",
      icon: PieChart,
      description: "Essential financial planning concepts for long-term stability",
      category: 'financial',
      badge: null
    },
    {
      title: "Debt-Free Living",
      icon: DollarSign,
      description: "Tips and strategies for maintaining a debt-free lifestyle",
      category: 'financial',
      badge: 'Popular'
    },
    {
      title: "Smart Money Habits",
      icon: Lightbulb,
      description: "Daily habits that can transform your financial future",
      category: 'financial',
      badge: null
    }
  ];
  
  // Tools and Calculators
  const toolsAndCalculators = [
    {
      title: "Debt Payoff Calculator",
      icon: Calculator,
      description: "Calculate how quickly you can pay off your debt with different strategies",
      category: 'tools',
      badge: null
    },
    {
      title: "Budget Planner",
      icon: Wallet,
      description: "Create a personalized budget plan based on your income and expenses",
      category: 'tools',
      badge: null
    },
    {
      title: "Interest Rate Comparison",
      icon: BarChart2,
      description: "Compare different interest rates and their impact on your debt",
      category: 'tools',
      badge: null
    },
    {
      title: "Savings Goal Calculator",
      icon: TrendingUp,
      description: "Plan how to reach your savings goals with automatic calculations",
      category: 'tools',
      badge: 'New'
    }
  ];

  // Advanced Topics
  const advancedTopics = [
    {
      title: "AI-Powered Debt Optimization",
      icon: Zap,
      description: "How our AI algorithms optimize your debt payoff strategy",
      category: 'guides',
      badge: 'Advanced'
    },
    {
      title: "Data Security & Privacy",
      icon: Lock,
      description: "Learn about our security practices and how we protect your data",
      category: 'guides',
      badge: null
    }
  ];

  // All docs combined for filtering
  const allDocs = [
    ...userGuideDocs, 
    ...financialResources, 
    ...toolsAndCalculators, 
    ...advancedTopics
  ];

  // Filter docs based on search query and active category
  const filteredDocs = allDocs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout 
      title="Documentation | Smart Debt Flow"
      description="Comprehensive documentation, guides, and resources for Smart Debt Flow platform."
    >
      <div className="py-24 relative">
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Guides, financial resources, and tools to help you get the most out of Smart Debt Flow
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/50 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-card hover:bg-card/80 text-muted-foreground'
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Quick Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-center flex-col text-center cursor-pointer hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium">Getting Started</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-center flex-col text-center cursor-pointer hover:bg-primary/20 transition-colors">
                <Calculator className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium">Calculators</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-center flex-col text-center cursor-pointer hover:bg-primary/20 transition-colors">
                <FileText className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium">FAQ</p>
              </div>
            </div>
          </motion.section>

          {/* Documentation Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            {filteredDocs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map((doc, index) => (
                  <motion.div
                    key={doc.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <doc.icon className="w-6 h-6 text-primary" />
                      </div>
                      {doc.badge && (
                        <Badge variant="outline" className="bg-primary/5 text-primary">
                          {doc.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                    <div className="pt-2 border-t border-border">
                      <Link 
                        href="#" 
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Read documentation →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search query or category filter
                </p>
              </div>
            )}
          </motion.section>

          {/* Need Help Banner */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Need help with something specific?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is ready to assist you with any questions you may have about the Smart Debt Flow platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Contact Support
              </Button>
              <Button variant="outline" size="lg">
                Join Community
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
} 