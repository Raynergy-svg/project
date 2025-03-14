import { useState, useEffect } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveCard, ResponsiveCardGrid } from "@/components/ui/responsive-card";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, ThumbsUp, MessageSquare } from "lucide-react";
import { NextPage } from "next";

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
  content?: string;
}

// Sample blog posts data - this would typically come from an API or CMS
const posts: BlogPost[] = [
  {
    id: "1",
    slug: "debt-snowball-vs-avalanche",
    title: "Debt Snowball vs. Avalanche: Which Strategy is Right for You?",
    excerpt: "Compare two popular debt reduction strategies and learn which one might be the best fit for your financial situation and personality. We break down the pros and cons of each approach.",
    date: "June 12, 2023",
    readTime: "8 min",
    category: "debt-strategies",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop",
    content: `
      <h2>Understanding Debt Reduction Strategies</h2>
      <p>When it comes to paying off debt, there are two popular strategies that financial experts often recommend: the debt snowball and the debt avalanche. Both approaches can be effective, but they work in different ways and may be better suited to different personalities and financial situations.</p>
      
      <h3>The Debt Snowball Method</h3>
      <p>The debt snowball method, popularized by financial advisor Dave Ramsey, focuses on building momentum through small wins. Here's how it works:</p>
      <ol>
        <li>List all your debts from smallest balance to largest, regardless of interest rates.</li>
        <li>Make minimum payments on all debts except the smallest.</li>
        <li>Put any extra money toward paying off the smallest debt as quickly as possible.</li>
        <li>Once the smallest debt is paid off, take the amount you were paying on it and add it to the minimum payment on the next smallest debt.</li>
        <li>Continue this process, creating a "snowball" effect as you pay off each debt and roll that payment into the next one.</li>
      </ol>
      
      <p><strong>Pros of the Debt Snowball:</strong></p>
      <ul>
        <li>Provides quick wins that can boost motivation</li>
        <li>Simplifies the debt payoff process by focusing on one debt at a time</li>
        <li>Can be particularly effective for those who struggle with staying motivated</li>
      </ul>
      
      <p><strong>Cons of the Debt Snowball:</strong></p>
      <ul>
        <li>May result in paying more interest over time</li>
        <li>Not mathematically optimal</li>
      </ul>
      
      <h3>The Debt Avalanche Method</h3>
      <p>The debt avalanche method takes a more mathematical approach to debt reduction. Here's how it works:</p>
      <ol>
        <li>List all your debts from highest interest rate to lowest, regardless of balance.</li>
        <li>Make minimum payments on all debts.</li>
        <li>Put any extra money toward paying off the debt with the highest interest rate.</li>
        <li>Once the highest-interest debt is paid off, move to the debt with the next highest interest rate.</li>
        <li>Continue this process until all debts are paid off.</li>
      </ol>
      
      <p><strong>Pros of the Debt Avalanche:</strong></p>
      <ul>
        <li>Saves the most money in interest over time</li>
        <li>Mathematically optimal approach</li>
        <li>Can result in faster debt payoff overall</li>
      </ul>
      
      <p><strong>Cons of the Debt Avalanche:</strong></p>
      <ul>
        <li>May take longer to see progress if high-interest debts have large balances</li>
        <li>Can be demotivating if you don't see quick results</li>
      </ul>
      
      <h2>Which Strategy is Right for You?</h2>
      <p>The best debt reduction strategy for you depends on your personal financial situation and psychological makeup:</p>
      
      <p><strong>Choose the Debt Snowball if:</strong></p>
      <ul>
        <li>You need quick wins to stay motivated</li>
        <li>You have several small debts that can be paid off quickly</li>
        <li>You've struggled to stick with debt payoff plans in the past</li>
        <li>The emotional boost from small victories is important to you</li>
      </ul>
      
      <p><strong>Choose the Debt Avalanche if:</strong></p>
      <ul>
        <li>You're motivated by saving the most money possible</li>
        <li>You have high-interest debt that's costing you significantly</li>
        <li>You can stay committed to a long-term plan without immediate rewards</li>
        <li>You prefer a mathematically optimal approach</li>
      </ul>
      
      <h2>A Hybrid Approach</h2>
      <p>Some people find success with a hybrid approach that combines elements of both strategies. For example, you might start with the snowball method to pay off a couple of small debts quickly, then switch to the avalanche method for the remaining debts.</p>
      
      <p>At Smart Debt Flow, our AI-powered system can help you determine which strategy is best for your specific situation, or even create a custom hybrid approach that maximizes both psychological benefits and financial optimization.</p>
      
      <h2>The Bottom Line</h2>
      <p>Remember that the best debt reduction strategy is the one you'll actually stick with. Both the snowball and avalanche methods can work, but only if you commit to following through. Consider your personal motivation style, financial situation, and goals when choosing your approach.</p>
      
      <p>No matter which strategy you choose, the most important step is to start taking action today. Every dollar you put toward debt reduction is a step toward financial freedom.</p>
    `,
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
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
    content: `
      <h2>The Emotional Weight of Debt</h2>
      <p>Debt is more than just a financial burden—it's a psychological one as well. Research has shown that individuals with debt problems are three times more likely to suffer from mental health issues like anxiety and depression. Understanding the psychology behind debt can help you develop healthier financial habits and more effective debt reduction strategies.</p>
      
      <h3>Why We Get Into Debt</h3>
      <p>Several psychological factors contribute to debt accumulation:</p>
      
      <h4>Present Bias</h4>
      <p>Humans have a natural tendency to prioritize immediate rewards over future benefits, a phenomenon known as "present bias." This makes it easy to swipe a credit card for instant gratification while discounting the future pain of paying it off.</p>
      
      <h4>Optimism Bias</h4>
      <p>Many people overestimate their future income or underestimate future expenses. This "optimism bias" leads to borrowing with the belief that repayment will be easier in the future than it actually is.</p>
      
      <h4>Social Comparison</h4>
      <p>The desire to keep up with peers or project a certain lifestyle can drive spending beyond one's means. Social media has amplified this effect, creating constant exposure to others' highlight reels.</p>
      
      <h4>Emotional Spending</h4>
      <p>Shopping to cope with negative emotions like stress, sadness, or boredom can lead to debt accumulation. This "retail therapy" provides a temporary mood boost but can create long-term financial problems.</p>
      
      <h2>The Debt Shame Cycle</h2>
      <p>Once in debt, many people experience shame, which can trigger a harmful cycle:</p>
      <ol>
        <li>Feeling shame about debt</li>
        <li>Avoiding thinking about or addressing the debt</li>
        <li>Continuing to spend to cope with negative feelings</li>
        <li>Accumulating more debt</li>
        <li>Experiencing increased shame</li>
      </ol>
      
      <p>Breaking this cycle requires acknowledging the emotional aspects of debt and developing healthier coping mechanisms.</p>
      
      <h2>Psychological Barriers to Debt Repayment</h2>
      
      <h3>Debt Fatigue</h3>
      <p>Long-term debt repayment can lead to "debt fatigue"—a state of emotional exhaustion that makes it difficult to maintain motivation. This often occurs when people don't see quick progress or when the debt feels overwhelming.</p>
      
      <h3>Avoidance</h3>
      <p>Many people cope with financial stress by avoiding it altogether—not opening bills, ignoring account balances, or refusing to create a budget. While this provides temporary relief, it ultimately worsens the situation.</p>
      
      <h3>All-or-Nothing Thinking</h3>
      <p>The belief that you must either pay off debt perfectly or not try at all can be paralyzing. This black-and-white thinking prevents many people from taking imperfect but beneficial steps toward debt reduction.</p>
      
      <h2>Building a Healthier Relationship with Money</h2>
      
      <h3>Practice Financial Mindfulness</h3>
      <p>Becoming aware of your spending triggers and emotional responses to money is the first step toward change. Before making purchases, pause to consider whether you're buying out of need, want, or emotional impulse.</p>
      
      <h3>Reframe Your Thinking</h3>
      <p>Instead of viewing budgeting as restrictive, see it as a tool that gives you control and choice over your money. Rather than thinking "I can't afford this," try "I'm choosing to spend my money elsewhere."</p>
      
      <h3>Celebrate Progress</h3>
      <p>Acknowledge and reward yourself (in non-financial ways) for debt reduction milestones. This positive reinforcement helps maintain motivation during the long journey to debt freedom.</p>
      
      <h3>Seek Support</h3>
      <p>Breaking the silence around debt by talking to trusted friends, joining support groups, or working with a financial therapist can reduce shame and provide accountability.</p>
      
      <h2>How Smart Debt Flow Can Help</h2>
      <p>Our AI-powered platform is designed with behavioral psychology in mind. We help you:</p>
      <ul>
        <li>Identify your unique money personality and spending triggers</li>
        <li>Create a personalized debt reduction plan that aligns with your psychological needs</li>
        <li>Visualize progress to maintain motivation</li>
        <li>Develop healthier financial habits through small, sustainable changes</li>
      </ul>
      
      <h2>The Bottom Line</h2>
      <p>Understanding the psychology of debt is crucial for creating lasting financial change. By addressing both the financial and emotional aspects of debt, you can develop a healthier relationship with money and achieve sustainable financial freedom.</p>
      
      <p>Remember that changing your financial behavior is a journey, not an overnight transformation. Be patient with yourself, celebrate progress, and focus on the long-term benefits of financial wellness.</p>
    `,
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
    image: "https://images.unsplash.com/photo-1565514020179-026b92b2d70b?q=80&w=2070&auto=format&fit=crop",
    content: `
      <h2>The Beginning: Facing the Reality</h2>
      <p>Three years ago, Lisa Martinez found herself in a situation that many Americans face: drowning in debt. With $50,000 spread across credit cards, personal loans, and student debt, her financial future looked bleak. "I remember sitting at my kitchen table, surrounded by bills, feeling completely overwhelmed," Lisa recalls. "That was the moment I knew something had to change."</p>

      <h2>The Breaking Point</h2>
      <p>Lisa's debt breakdown looked like this:</p>
      <ul>
        <li>Credit Card Debt: $22,000 (across four cards)</li>
        <li>Student Loans: $18,000</li>
        <li>Personal Loan: $10,000</li>
      </ul>
      <p>With interest rates ranging from 6% to 24%, she was paying over $1,000 monthly in interest alone.</p>

      <h2>Taking the First Step</h2>
      <p>After researching various debt management solutions, Lisa discovered Smart Debt Flow. "What caught my attention was the AI-powered approach," she says. "Instead of a one-size-fits-all solution, the platform analyzed my specific situation and created a personalized plan."</p>

      <h3>The Initial Strategy</h3>
      <ol>
        <li>Complete financial assessment using Smart Debt Flow's AI analyzer</li>
        <li>Create a realistic budget that still allowed for some flexibility</li>
        <li>Set up automated payments to prevent missed due dates</li>
        <li>Negotiate with creditors for lower interest rates</li>
      </ol>

      <h2>The Three-Year Journey</h2>
      
      <h3>Year One: Building Foundation</h3>
      <p>In the first year, Lisa focused on:</p>
      <ul>
        <li>Building an emergency fund of $1,000 to prevent new debt</li>
        <li>Consolidating high-interest credit cards</li>
        <li>Cutting unnecessary expenses, saving $400/month</li>
        <li>Taking on a side gig as a virtual assistant</li>
      </ul>
      <p>Result: Paid off $15,000 in debt</p>

      <h3>Year Two: Gaining Momentum</h3>
      <p>The second year brought new strategies:</p>
      <ul>
        <li>Refinanced student loans to a lower interest rate</li>
        <li>Increased income through promotion at work</li>
        <li>Optimized tax returns for debt repayment</li>
        <li>Started using Smart Debt Flow's automated payment optimization</li>
      </ul>
      <p>Result: Eliminated another $20,000</p>

      <h3>Year Three: Final Push</h3>
      <p>In the final year, Lisa:</p>
      <ul>
        <li>Maintained strict budget discipline</li>
        <li>Sold unused items for extra debt payments</li>
        <li>Avoided all new debt</li>
        <li>Built savings while making final payments</li>
      </ul>
      <p>Result: Cleared remaining $15,000 and built $5,000 emergency fund</p>

      <h2>Key Strategies That Worked</h2>
      
      <h3>1. Leveraging Technology</h3>
      <p>Smart Debt Flow's AI features helped Lisa:</p>
      <ul>
        <li>Track spending patterns and identify areas for improvement</li>
        <li>Optimize payment schedules for maximum interest savings</li>
        <li>Receive personalized recommendations based on her progress</li>
        <li>Stay motivated with visual progress tracking</li>
      </ul>

      <h3>2. Lifestyle Adjustments</h3>
      <p>Smart changes that made a big difference:</p>
      <ul>
        <li>Meal prepping instead of eating out</li>
        <li>Finding free entertainment options</li>
        <li>Negotiating better rates for utilities and services</li>
        <li>Moving to a more affordable apartment</li>
      </ul>

      <h3>3. Income Optimization</h3>
      <p>Steps taken to increase income:</p>
      <ul>
        <li>Developed new skills for career advancement</li>
        <li>Started freelance work in spare time</li>
        <li>Sold unnecessary items online</li>
        <li>Requested and received a raise at work</li>
      </ul>

      <h2>Life After Debt</h2>
      <p>Today, Lisa is completely debt-free and has established:</p>
      <ul>
        <li>A six-month emergency fund</li>
        <li>Regular contributions to retirement accounts</li>
        <li>A healthy credit score above 780</li>
        <li>New financial goals for the future</li>
      </ul>

      <h2>Advice for Others</h2>
      <p>Lisa shares her top tips for those starting their debt-free journey:</p>
      <ol>
        <li>"Start with a clear picture of your debt – you can't fix what you don't acknowledge."</li>
        <li>"Use technology to your advantage. Smart Debt Flow's AI made a huge difference in optimizing my debt payoff strategy."</li>
        <li>"Don't be afraid to negotiate with creditors – many are willing to work with you."</li>
        <li>"Celebrate small wins along the way to stay motivated."</li>
        <li>"Build an emergency fund first to prevent falling back into debt."</li>
      </ol>

      <h2>Looking Forward</h2>
      <p>"The skills and habits I developed during my debt-free journey have transformed my relationship with money," Lisa reflects. "I'm now saving for a house down payment and planning for early retirement. Financial freedom isn't just about getting out of debt – it's about staying out and building wealth for the future."</p>
    `,
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
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop",
    content: `
      <h2>The Evolution of Personal Finance Management</h2>
      <p>The financial technology landscape has undergone a dramatic transformation in recent years. From simple spreadsheets to sophisticated AI-powered platforms, the tools available for managing personal finances have evolved to become more intelligent, personalized, and effective than ever before.</p>

      <h2>How AI is Revolutionizing Debt Management</h2>
      
      <h3>1. Personalized Financial Analysis</h3>
      <p>Modern AI systems can:</p>
      <ul>
        <li>Analyze spending patterns and identify trends</li>
        <li>Predict future expenses based on historical data</li>
        <li>Detect potential financial risks before they become problems</li>
        <li>Create customized budgets based on individual behavior</li>
      </ul>

      <h3>2. Intelligent Debt Reduction Strategies</h3>
      <p>AI-powered platforms like Smart Debt Flow use advanced algorithms to:</p>
      <ul>
        <li>Calculate the optimal debt payoff sequence</li>
        <li>Adjust strategies based on changing financial circumstances</li>
        <li>Recommend refinancing opportunities when beneficial</li>
        <li>Balance multiple financial goals simultaneously</li>
      </ul>

      <h3>3. Automated Decision Support</h3>
      <p>AI helps users make better financial decisions by:</p>
      <ul>
        <li>Providing real-time insights on spending decisions</li>
        <li>Suggesting optimal payment timing to minimize interest</li>
        <li>Identifying potential savings opportunities</li>
        <li>Alerting users to unusual financial activity</li>
      </ul>

      <h2>Smart Debt Flow's AI Capabilities</h2>
      
      <h3>Dynamic Debt Analysis</h3>
      <p>Our platform's AI engine:</p>
      <ul>
        <li>Continuously monitors debt balances and interest rates</li>
        <li>Adjusts payoff strategies based on new information</li>
        <li>Identifies opportunities for interest rate reduction</li>
        <li>Tracks progress and predicts payoff timelines</li>
      </ul>

      <h3>Behavioral Analysis and Adaptation</h3>
      <p>The system learns from user behavior to:</p>
      <ul>
        <li>Identify spending triggers and patterns</li>
        <li>Suggest personalized budgeting strategies</li>
        <li>Provide motivational support at key moments</li>
        <li>Adapt recommendations based on user success rates</li>
      </ul>

      <h2>Real-World Applications</h2>
      
      <h3>1. Predictive Analytics</h3>
      <p>AI helps users anticipate and prepare for:</p>
      <ul>
        <li>Upcoming large expenses</li>
        <li>Seasonal spending variations</li>
        <li>Potential cash flow issues</li>
        <li>Interest rate changes</li>
      </ul>

      <h3>2. Smart Payment Optimization</h3>
      <p>The system optimizes payment strategies by:</p>
      <ul>
        <li>Calculating the most efficient payment allocations</li>
        <li>Timing payments to minimize interest charges</li>
        <li>Balancing multiple debt obligations</li>
        <li>Adjusting for changing interest rates</li>
      </ul>

      <h3>3. Personalized Goal Setting</h3>
      <p>AI helps create realistic financial goals by:</p>
      <ul>
        <li>Analyzing current financial capacity</li>
        <li>Suggesting achievable milestones</li>
        <li>Adjusting targets based on progress</li>
        <li>Providing regular progress updates</li>
      </ul>

      <h2>The Future of AI in Personal Finance</h2>
      
      <h3>Emerging Technologies</h3>
      <p>Looking ahead, we can expect to see:</p>
      <ul>
        <li>Advanced natural language processing for financial advice</li>
        <li>Integration with smart home devices for real-time budgeting</li>
        <li>Predictive models for market changes affecting personal debt</li>
        <li>Enhanced automation of financial decisions</li>
      </ul>

      <h3>Enhanced Personalization</h3>
      <p>Future AI systems will offer:</p>
      <ul>
        <li>More sophisticated behavioral analysis</li>
        <li>Better integration with personal financial goals</li>
        <li>Improved adaptation to life changes</li>
        <li>More precise financial forecasting</li>
      </ul>

      <h2>Getting Started with AI-Powered Finance</h2>
      <p>To begin leveraging AI for your financial management:</p>
      <ol>
        <li>Choose a platform that aligns with your financial goals</li>
        <li>Input accurate financial data for better analysis</li>
        <li>Allow time for the AI to learn your patterns</li>
        <li>Regularly review and adjust recommendations</li>
        <li>Stay engaged with the process while letting AI handle the heavy lifting</li>
      </ol>

      <h2>Conclusion</h2>
      <p>The integration of AI into personal finance management represents a significant leap forward in helping individuals achieve their financial goals. By leveraging these powerful tools, users can make more informed decisions, optimize their debt reduction strategies, and work toward financial freedom more effectively than ever before.</p>
    `,
    author: {
      id: "a4",
      name: "James Wilson",
      role: "Tech Analyst",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  }
];

// Related posts component
const RelatedPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <ResponsiveCard 
        className="h-full overflow-hidden hover:shadow-md transition-all border-border hover:border-primary/20"
        hoverable
        interactive
      >
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="mr-3 truncate">{post.date}</span>
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{post.readTime} read</span>
            </div>
          </div>
        </CardContent>
      </ResponsiveCard>
    </Link>
  );
};

interface BlogPostPageProps {
  post: BlogPost | null;
}

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post: initialPost }) => {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!post) return;
    
    // Find related posts based on category
    const related = posts
      .filter(p => p.category === post.category && p.slug !== post.slug)
      .slice(0, 3);
    setRelatedPosts(related);
  }, [post]);

  // Show loading state when fallback is true
  if (router.isFallback) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show 404 if post is not found
  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-primary hover:text-primary/90">
            Return to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${post.title} - Smart Debt Flow Blog`}
      description={post.excerpt}
    >
      <Head>
        <meta property="og:title" content={`${post.title} - Smart Debt Flow Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://smartdebtflow.com/blog/${post.slug}`} />
        <meta property="og:image" content={post.image} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
      </Head>

      <article className="py-8 md:py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Back button */}
          <div className="mb-6 md:mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/Blog')}
              className="group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to all articles</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          {/* Hero section */}
          <div className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                {post.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                {post.excerpt}
              </p>
              
              {/* Author and metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-3 sm:mr-4 flex-shrink-0">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.author.role}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-2 sm:mt-0">
                  <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="mr-4">{post.date}</span>
                  <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{post.readTime} read</span>
                </div>
              </div>
            </div>
            
            {/* Featured image */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-lg sm:rounded-xl overflow-hidden mb-8 sm:mb-12">
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* Article content */}
            <div className="prose prose-sm sm:prose md:prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            </div>
            
            {/* Article footer */}
            <div className="mt-8 md:mt-12 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-auto justify-center">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Helpful</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-auto justify-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Comment</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-auto justify-center">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-auto justify-center">
                    <Share2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related articles */}
          {relatedPosts.length > 0 && (
            <div className="max-w-4xl mx-auto mt-12 md:mt-20">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Related Articles</h2>
              <ResponsiveCardGrid columns={3} gap="default" className="mb-8">
                {relatedPosts.map(relatedPost => (
                  <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </ResponsiveCardGrid>
            </div>
          )}
          
          {/* Newsletter */}
          <div className="max-w-4xl mx-auto mt-12 md:mt-20 p-6 sm:p-8 bg-muted/30 rounded-lg sm:rounded-xl">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Get the latest debt management strategies and financial tips delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                />
                <Button className="mt-2 sm:mt-0">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const paths = posts.map(post => ({
      params: { slug: post.slug }
    }));

    return {
      paths,
      fallback: 'blocking' // Change to blocking for better UX
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  try {
    if (!params?.slug || typeof params.slug !== 'string') {
      return {
        notFound: true
      };
    }

    const post = posts.find(p => p.slug === params.slug);

    if (!post) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        post
      },
      revalidate: 86400 // Revalidate once per day
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true
    };
  }
};

export default BlogPostPage; 