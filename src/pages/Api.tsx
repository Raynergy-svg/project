import { motion } from 'framer-motion';
import { Search, Code, Lock, Clock, Zap, Shield, Database, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Api() {
  const [searchQuery, setSearchQuery] = useState('');

  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          method: "POST",
          path: "/auth/token",
          description: "Generate API access token",
          example: `
curl -X POST https://api.smartdebtflow.com/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'`
        }
      ]
    },
    {
      category: "Debt Management",
      items: [
        {
          method: "POST",
          path: "/plans",
          description: "Create a new debt management plan",
          example: `
curl -X POST https://api.smartdebtflow.com/plans \\
  -H "Authorization: Bearer your-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user-123",
    "debts": [
      {
        "type": "credit_card",
        "balance": 5000,
        "interestRate": 19.99
      }
    ],
    "strategy": "snowball"
  }'`
        },
        {
          method: "GET",
          path: "/plans/{planId}",
          description: "Retrieve a debt management plan",
          example: `
curl https://api.smartdebtflow.com/plans/plan-123 \\
  -H "Authorization: Bearer your-token"`
        }
      ]
    },
    {
      category: "AI Recommendations",
      items: [
        {
          method: "POST",
          path: "/ai/recommendations",
          description: "Get AI-powered debt management recommendations",
          example: `
curl -X POST https://api.smartdebtflow.com/ai/recommendations \\
  -H "Authorization: Bearer your-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "planId": "plan-123",
    "timeframe": "12_months"
  }'`
        }
      ]
    }
  ];

  const features = [
    {
      title: "Authentication",
      icon: Lock,
      description: "Secure OAuth 2.0 and API key authentication"
    },
    {
      title: "Rate Limiting",
      icon: Clock,
      description: "Fair usage limits with clear headers"
    },
    {
      title: "Real-time Events",
      icon: Zap,
      description: "WebSocket support for live updates"
    },
    {
      title: "Data Security",
      icon: Shield,
      description: "Bank-level encryption for all data"
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
              API Reference
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Complete API documentation for Smart Debt Flow
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
              placeholder="Search API endpoints..."
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

        {/* API Endpoints */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {endpoints.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <div className="space-y-6">
                {category.items.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-mono ${
                          endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                          endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                          endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-gray-300 font-mono">{endpoint.path}</code>
                      </div>
                      <p className="text-gray-300 mb-4">{endpoint.description}</p>
                      <div className="bg-[#1A1A1A] rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm font-mono text-gray-300">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.section>

        {/* Rate Limits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6">Rate Limits</h2>
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="space-y-4">
              <p className="text-gray-300">
                The API has the following rate limits:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>100 requests per minute for authenticated endpoints</li>
                <li>10 requests per minute for unauthenticated endpoints</li>
                <li>1000 requests per hour per API key</li>
              </ul>
              <div className="bg-[#1A1A1A] rounded-lg p-4 mt-4">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`
# Rate limit headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Building?</h2>
            <p className="text-gray-300 mb-6">
              Get your API key and start integrating Smart Debt Flow into your application
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
                View SDK Documentation
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 