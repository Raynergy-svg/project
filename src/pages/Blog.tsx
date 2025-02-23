import { motion } from 'framer-motion';
import { Search, Tag, Clock, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    "Debt Management",
    "Financial Planning",
    "Credit Score",
    "Budgeting",
    "Investment",
    "AI & Finance"
  ];

  const featuredPosts = [
    {
      title: "How AI is Revolutionizing Debt Management",
      excerpt: "Discover how artificial intelligence is transforming the way we handle and manage debt in the modern era.",
      category: "AI & Finance",
      author: "Sarah Chen",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "The Psychology of Debt: Breaking Free from Financial Stress",
      excerpt: "Understanding the psychological impact of debt and strategies to maintain mental well-being while managing finances.",
      category: "Debt Management",
      author: "Dr. Michael Ross",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Building a Solid Financial Foundation: A Step-by-Step Guide",
      excerpt: "Learn the essential steps to create a strong financial foundation and secure your financial future.",
      category: "Financial Planning",
      author: "Emily Johnson",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const recentPosts = [
    {
      title: "Maximizing Your Debt Repayment Strategy",
      category: "Debt Management",
      date: "October 15, 2023"
    },
    {
      title: "Understanding Credit Score Factors",
      category: "Credit Score",
      date: "October 12, 2023"
    },
    {
      title: "Smart Budgeting in the Digital Age",
      category: "Budgeting",
      date: "October 10, 2023"
    },
    {
      title: "Investment Strategies for Debt-Free Living",
      category: "Investment",
      date: "October 8, 2023"
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
              Smart Debt Flow Blog
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Insights and strategies for managing your debt and achieving financial freedom
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
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
              >
                <Tag className="w-4 h-4 mr-2" />
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Featured Posts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-[#88B04B]/30 transition-colors"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="text-sm text-[#88B04B] mb-2 block">{post.category}</span>
                  <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Recent Posts Sidebar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.title}
                  className="flex items-center justify-between hover:bg-white/5 p-3 rounded-lg transition-colors cursor-pointer group"
                >
                  <div>
                    <span className="text-sm text-[#88B04B] mb-1 block">{post.category}</span>
                    <h3 className="font-medium group-hover:text-[#88B04B] transition-colors">
                      {post.title}
                    </h3>
                    <span className="text-sm text-gray-400">{post.date}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#88B04B] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Newsletter */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6">
              Get the latest articles and insights delivered to your inbox
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
              />
              <Button
                className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 