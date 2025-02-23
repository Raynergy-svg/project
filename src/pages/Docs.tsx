import { motion } from 'framer-motion';
import { Search, Book, Code, Terminal, FileText, GitBranch, Database, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Docs() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      title: "Getting Started",
      icon: Book,
      items: [
        "Quick Start Guide",
        "Installation",
        "Authentication",
        "Basic Concepts"
      ]
    },
    {
      title: "API Reference",
      icon: Code,
      items: [
        "REST API Overview",
        "Authentication",
        "Endpoints",
        "Rate Limits"
      ]
    },
    {
      title: "SDKs & Libraries",
      icon: Terminal,
      items: [
        "JavaScript SDK",
        "Python SDK",
        "Java SDK",
        "Ruby SDK"
      ]
    }
  ];

  const codeExample = `
// Initialize the Smart Debt Flow client
const client = new SmartDebtFlow({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create a new debt management plan
const plan = await client.plans.create({
  userId: 'user-123',
  debts: [
    {
      type: 'credit_card',
      balance: 5000,
      interestRate: 19.99,
      minimumPayment: 150
    },
    {
      type: 'personal_loan',
      balance: 10000,
      interestRate: 12.5,
      minimumPayment: 300
    }
  ],
  strategy: 'snowball',
  monthlyBudget: 1000
});

// Get AI-powered recommendations
const recommendations = await client.ai.getRecommendations({
  planId: plan.id,
  timeframe: '12_months'
});
`;

  const features = [
    {
      title: "RESTful API",
      icon: GitBranch,
      description: "Modern REST API with comprehensive endpoints for debt management"
    },
    {
      title: "Real-time Updates",
      icon: Zap,
      description: "WebSocket support for live updates and notifications"
    },
    {
      title: "Secure",
      icon: Shield,
      description: "Bank-level security with OAuth 2.0 and API key authentication"
    },
    {
      title: "Data Access",
      icon: Database,
      description: "Flexible data models and comprehensive CRUD operations"
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
              Documentation
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Comprehensive guides and API documentation for Smart Debt Flow
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
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#88B04B]/20 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-[#88B04B]" />
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300 hover:text-[#88B04B] cursor-pointer transition-colors">
                    <FileText className="w-4 h-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Code Example */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6">Quick Example</h2>
          <div className="bg-[#1A1A1A] rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300">
              <code>{codeExample}</code>
            </pre>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-6">
              Sign up for an API key and start integrating Smart Debt Flow into your application
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
              >
                Get API Key
              </Button>
              <Button
                variant="outline"
                className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
              >
                View API Reference
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 