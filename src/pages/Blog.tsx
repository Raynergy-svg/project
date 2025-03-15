import { useState, useRef } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveCard, ResponsiveCardGrid } from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Search, Calendar, Clock, ChevronRight } from "lucide-react";

// Types for blog data
interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  author: BlogAuthor;
  featured?: boolean;
}

// Blog post component
const BlogPostCard = ({ post }: { post: BlogPost }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <ResponsiveCard 
          className="h-full overflow-hidden hover:shadow-md transition-all border-border hover:border-primary/20"
          hoverable
          interactive
        >
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <Badge variant="secondary" className="bg-background/90 text-foreground hover:bg-background text-xs sm:text-sm">
                  {post.category}
                </Badge>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="mr-3 truncate">{post.date}</span>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{post.readTime} read</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2 sm:mr-3 flex-shrink-0">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px]">
                    <span className="font-medium text-foreground">{post.author.name}</span>
                  </div>
                </div>
                <div className="text-primary text-xs sm:text-sm font-medium flex items-center">
                  <span className="hidden sm:inline">Read more</span>
                  <span className="sm:hidden">Read</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </CardContent>
        </ResponsiveCard>
      </Link>
    </motion.div>
  );
};

// Featured post component
const FeaturedPost = ({ post }: { post: BlogPost }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-lg sm:rounded-xl bg-card border border-border shadow-md"
    >
      <div className="relative flex flex-col md:flex-row">
        <div className="md:w-1/2 order-2 md:order-1 p-6 sm:p-8 md:p-10">
          <Badge className="mb-3 sm:mb-4 bg-primary text-primary-foreground hover:bg-primary/90">{post.category}</Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight text-foreground">
            {post.title}
          </h2>
          <p className="text-muted-foreground mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
            {post.excerpt}
          </p>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="mr-3">{post.date}</span>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span>{post.readTime} read</span>
          </div>
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden mr-2 sm:mr-3 flex-shrink-0">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-sm sm:text-base text-foreground">{post.author.name}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{post.author.role}</div>
            </div>
          </div>
          <Link href={`/blog/${post.slug}`}>
            <Button size="sm" className="sm:h-10 bg-[#1DB954] hover:bg-[#1DB954]/90 text-white">
              Read Full Article
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
        <div className="md:w-1/2 h-48 sm:h-64 md:h-auto order-1 md:order-2 relative">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Sample categories
  const categories = [
    { id: "all", name: "All Posts" },
    { id: "debt-strategies", name: "Debt Strategies" },
    { id: "financial-tips", name: "Financial Tips" },
    { id: "success-stories", name: "Success Stories" },
    { id: "technology", name: "Technology" }
  ];

  // Sample blog posts
  const posts: BlogPost[] = [
    {
      id: "1",
      slug: "debt-snowball-vs-avalanche",
      title: "Debt Snowball vs. Avalanche: Which Strategy is Right for You?",
      excerpt: "Compare two popular debt reduction strategies and learn which one might be the best fit for your financial situation and personality. We break down the pros and cons of each approach.",
      date: "June 12, 2023",
      readTime: "8 min",
      category: "debt-strategies",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80",
      featured: true,
      author: {
        id: "a1",
        name: "Sarah Johnson",
        role: "Financial Coach",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      }
    },
    {
      id: "2",
      slug: "psychology-of-debt",
      title: "The Psychology of Debt: Understanding Your Relationship with Money",
      excerpt: "Explore the emotional and psychological factors that influence our financial decisions and debt management approaches. Learn how to overcome mental barriers to achieve financial freedom.",
      date: "May 28, 2023",
      readTime: "10 min",
      category: "financial-tips",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80",
      author: {
        id: "a2",
        name: "Michael Chen",
        role: "Behavioral Economist",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    },
    {
      id: "3",
      slug: "from-50k-to-debt-free",
      title: "From $50K in Debt to Financial Freedom: Lisa's Journey",
      excerpt: "Read the inspiring story of how one of our users eliminated $50,000 in debt in just 3 years using Smart Debt Flow's AI-powered strategies and consistent financial planning.",
      date: "May 15, 2023",
      readTime: "6 min",
      category: "success-stories",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80",
      author: {
        id: "a3",
        name: "Aisha Patel",
        role: "Content Director",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
      }
    },
    {
      id: "4",
      slug: "ai-revolution-in-personal-finance",
      title: "The AI Revolution in Personal Finance Management",
      excerpt: "Discover how artificial intelligence is transforming debt management and financial planning tools for everyday users. Learn how Smart Debt Flow uses AI to create personalized debt reduction plans.",
      date: "April 30, 2023",
      readTime: "7 min",
      category: "technology",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80",
      author: {
        id: "a4",
        name: "James Wilson",
        role: "Tech Analyst",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      }
    },
    {
      id: "5",
      slug: "hidden-costs-of-minimum-payments",
      title: "The Hidden Cost of Making Only Minimum Payments",
      excerpt: "Learn why minimum payments on credit cards can trap you in debt for decades, and strategies to break free from this cycle. We provide a detailed analysis of interest accumulation over time.",
      date: "April 18, 2023",
      readTime: "5 min",
      category: "debt-strategies",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80",
      author: {
        id: "a1",
        name: "Sarah Johnson",
        role: "Financial Coach",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      }
    },
    {
      id: "6",
      slug: "building-emergency-fund",
      title: "Building an Emergency Fund While Paying Off Debt",
      excerpt: "Discover the balance between saving for emergencies and aggressively paying down your debt with practical strategies. Learn the optimal approach based on your specific financial situation.",
      date: "April 5, 2023",
      readTime: "9 min",
      category: "financial-tips",
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80",
      author: {
        id: "a2",
        name: "Michael Chen",
        role: "Behavioral Economist",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    },
    {
      id: "7",
      slug: "debt-consolidation-pros-cons",
      title: "Debt Consolidation: Pros, Cons, and When to Consider It",
      excerpt: "A comprehensive guide to understanding when debt consolidation makes sense and when it might do more harm than good. Includes real case studies and practical decision-making frameworks.",
      date: "March 22, 2023",
      readTime: "11 min",
      category: "debt-strategies",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
      author: {
        id: "a3",
        name: "Aisha Patel",
        role: "Content Director",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
      }
    },
    {
      id: "8",
      slug: "interview-financial-expert",
      title: "Expert Interview: What Most Financial Advisors Get Wrong About Debt",
      excerpt: "We interview a leading financial expert who shares insights on common misconceptions about debt management and provides actionable advice for achieving true financial wellness.",
      date: "March 10, 2023",
      readTime: "12 min",
      category: "financial-tips",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
      author: {
        id: "a4",
        name: "James Wilson",
        role: "Tech Analyst",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      }
    },
    {
      id: "9",
      slug: "student-loan-forgiveness-options",
      title: "Complete Guide to Student Loan Forgiveness Options in 2023",
      excerpt: "Navigate the complex world of student loan forgiveness programs with our comprehensive guide to federal, state, and employer-based options available this year.",
      date: "February 28, 2023",
      readTime: "14 min",
      category: "debt-strategies",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
      author: {
        id: "a1",
        name: "Sarah Johnson",
        role: "Financial Coach",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      }
    },
    {
      id: "10",
      slug: "credit-score-improvement",
      title: "7 Proven Strategies to Improve Your Credit Score While Paying Off Debt",
      excerpt: "Learn how to simultaneously improve your credit score while reducing your debt burden with these expert-backed strategies that address both short and long-term financial goals.",
      date: "February 15, 2023",
      readTime: "8 min",
      category: "financial-tips",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop",
      author: {
        id: "a2",
        name: "Michael Chen",
        role: "Behavioral Economist",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    },
    {
      id: "11",
      slug: "family-debt-reduction-plan",
      title: "Creating a Family Debt Reduction Plan That Actually Works",
      excerpt: "Discover how to create a debt reduction plan that involves the whole family, teaching financial literacy to children while working together toward shared financial goals.",
      date: "January 30, 2023",
      readTime: "10 min",
      category: "debt-strategies",
      image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=2070&auto=format&fit=crop",
      author: {
        id: "a3",
        name: "Aisha Patel",
        role: "Content Director",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
      }
    },
    {
      id: "12",
      slug: "automation-debt-payoff",
      title: "How Automation Can Accelerate Your Debt Payoff Journey",
      excerpt: "Learn how to leverage financial automation tools and technologies to streamline your debt payoff process, reduce decision fatigue, and achieve your financial goals faster.",
      date: "January 18, 2023",
      readTime: "7 min",
      category: "technology",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop",
      author: {
        id: "a4",
        name: "James Wilson",
        role: "Tech Analyst",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      }
    }
  ];

  // Featured post
  const featuredPost = posts.find(post => post.featured);

  // Filter posts based on search query and selected category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory && !post.featured;
  });

  return (
    <Layout
      title="Blog - Smart Debt Flow"
      description="Read articles on debt management, financial tips, success stories, and more from the Smart Debt Flow team."
    >
      <Head>
        <meta property="og:title" content="Blog - Smart Debt Flow" />
        <meta
          property="og:description"
          content="Insights and guides for managing your debt and improving your financial well-being."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/blog" />
      </Head>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-10 sm:py-16 md:py-24 bg-background border-b border-border"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
            >
              Smart Debt Flow Blog
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8"
            >
              Insights, guides, and success stories to help you on your path to financial freedom.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative max-w-lg mx-auto"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 h-10 bg-background border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && !searchQuery && selectedCategory === "all" && (
        <section className="py-8 sm:py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Featured Article</h2>
            </div>
            <FeaturedPost post={featuredPost} />
          </div>
        </section>
      )}

      {/* Blog Posts */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-6 sm:mb-8">
            <Tabs
              defaultValue="all"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <div className="border-b border-border mb-8">
                <TabsList className="flex overflow-x-auto -mb-px space-x-8 justify-start bg-transparent">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="relative px-1 py-3 text-sm font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-[#1DB954] data-[state=active]:text-[#1DB954] transition-all duration-200"
                    >
                      {category.name}
                      {category.id === selectedCategory && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1DB954]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <ResponsiveCardGrid columns={3} gap="default">
                    {filteredPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </ResponsiveCardGrid>

                  {filteredPosts.length === 0 && (
                    <div className="text-center py-8 sm:py-12 bg-card rounded-lg border border-border p-6">
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        No articles found matching your search criteria.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                        }}
                        className="bg-background hover:bg-accent text-foreground"
                      >
                        View All Articles
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Get the latest debt management strategies, financial tips, and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="sm:flex-1 h-10"
              />
              <Button className="mt-2 sm:mt-0">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    // Revalidate once per day
    revalidate: 86400,
  };
} 