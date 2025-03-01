import { motion } from 'framer-motion';
import { Search, Tag, Clock, User, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    "Debt Management",
    "Financial Freedom",
    "Credit Score Improvement",
    "AI & Finance",
    "Success Stories",
    "Debt Strategies"
  ];

  const featuredPosts = [
    {
      title: "Snowball vs. Avalanche: How AI Optimizes Both Methods",
      excerpt: "Learn how our AI combines and enhances traditional debt reduction strategies to provide personalized, efficient solutions.",
      category: "Debt Strategies",
      author: "Michael Ross",
      readTime: "6 min read",
      date: "April 12, 2023",
      image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Real Results: How Sarah Eliminated $42,000 in Debt",
      excerpt: "A marketing professional shares her journey of eliminating credit card and student loan debt in just 27 months using Smart Debt Flow.",
      category: "Success Stories",
      author: "Emily Johnson",
      readTime: "8 min read",
      date: "April 8, 2023",
      image: "https://images.unsplash.com/photo-1589666564459-93cdd3ab856a?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "The Psychology of Debt: Breaking Free from Emotional Spending",
      excerpt: "Understanding the psychological factors that contribute to debt accumulation and how to develop healthier financial habits.",
      category: "Financial Freedom",
      author: "Dr. Michael Ross",
      readTime: "7 min read",
      date: "April 5, 2023",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const recentPosts = [
    {
      title: "How to Boost Your Credit Score While Paying Off Debt",
      category: "Credit Score Improvement",
      date: "April 15, 2023"
    },
    {
      title: "The Future of AI in Personal Debt Management",
      category: "AI & Finance",
      date: "April 10, 2023"
    },
    {
      title: "5 Common Mistakes When Paying Off Multiple Debts",
      category: "Debt Management",
      date: "April 7, 2023"
    },
    {
      title: "Building an Emergency Fund While Tackling Debt",
      category: "Financial Freedom",
      date: "April 2, 2023"
    }
  ];

  const popularTopics = [
    {
      title: "Debt Freedom Planning",
      count: 24
    },
    {
      title: "Credit Card Debt",
      count: 18
    },
    {
      title: "Student Loans",
      count: 16
    },
    {
      title: "Emergency Savings",
      count: 12
    },
    {
      title: "Financial Mindset",
      count: 10
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
              Financial Freedom Insights
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Expert advice, success stories, and AI-powered strategies for your debt-free journey
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 justify-start">
                {categories.slice(0, 3).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {category}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                >
                  <span>+{categories.length - 3} more</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Featured Posts */}
          <div className="md:col-span-2">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <span className="bg-[#88B04B]/20 text-[#88B04B] text-sm font-medium px-3 py-1 rounded-full mr-3">Featured</span>
                Latest Articles
              </h2>
              <div className="space-y-8">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-[#88B04B]/30 transition-colors"
                  >
                    <div className="md:flex">
                      <div className="md:w-2/5">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-60 md:h-full object-cover"
                        />
                      </div>
                      <div className="p-6 md:w-3/5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs bg-[#88B04B]/20 text-[#88B04B] px-2 py-1 rounded-full">{post.category}</span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {post.date}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 hover:text-[#88B04B] transition-colors">{post.title}</h3>
                        <p className="text-gray-300 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <User className="w-4 h-4 mr-2" />
                            {post.author}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            {post.readTime}
                          </div>
                        </div>
                        <Button
                          variant="link"
                          className="text-[#88B04B] hover:text-[#7a9d43] px-0 mt-4 flex items-center gap-2"
                        >
                          Read Article
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                >
                  View All Articles
                </Button>
              </div>
            </motion.section>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Recent Posts */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/10">Recent Posts</h2>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div
                      key={post.title}
                      className="group cursor-pointer"
                    >
                      <span className="text-xs bg-[#88B04B]/20 text-[#88B04B] px-2 py-1 rounded-full mb-2 inline-block">{post.category}</span>
                      <h3 className="font-medium group-hover:text-[#88B04B] transition-colors line-clamp-2 mb-1">
                        {post.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {post.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
            
            {/* Popular Topics */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/10">Popular Topics</h2>
                <div className="space-y-3">
                  {popularTopics.map((topic) => (
                    <div
                      key={topic.title}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <span className="group-hover:text-[#88B04B] transition-colors">{topic.title}</span>
                      <span className="bg-white/10 text-xs px-2 py-1 rounded-full">{topic.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
            
            {/* Subscribe Box */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-6">
                <h2 className="text-xl font-bold mb-4">Get Debt-Free Insights</h2>
                <p className="text-sm text-gray-300 mb-4">
                  Receive our latest articles, tools, and success stories directly to your inbox
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
                  />
                  <Button
                    className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white"
                  >
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
} 