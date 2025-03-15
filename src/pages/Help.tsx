import { useState, useRef } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  MessageCircle, 
  Mail, 
  FileText, 
  Video,
  ArrowRight
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Define types for our components
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  url: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("help-center");
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Sample FAQ data
  const faqs: FAQItem[] = [
    {
      question: "How does Smart Debt Flow calculate payment recommendations?",
      answer: "Smart Debt Flow uses a combination of industry-standard debt reduction strategies (like the debt snowball and debt avalanche methods) along with AI optimization to recommend payment plans. We consider factors such as interest rates, balances, your budget, and behavioral psychology to create a plan that's both mathematically sound and motivating.",
      category: "features"
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes, your security is our priority. We use bank-level 256-bit encryption for all data transmission and storage. We never store your bank login credentials - we use secure token-based access through our trusted financial partners. Additionally, we employ multiple layers of security including two-factor authentication and regular security audits.",
      category: "security"
    },
    {
      question: "How do I connect my financial accounts?",
      answer: "To connect your accounts, go to the Dashboard and click on 'Add Account'. We partner with Plaid, a secure financial connection service used by major banks and financial apps, which allows you to safely connect your accounts without sharing credentials with us directly.",
      category: "getting-started"
    },
    {
      question: "Can I manually add accounts or debts?",
      answer: "Yes, you can manually add any financial account or debt. From your Dashboard, click on 'Add Account' and select the 'Manual Entry' option. This is useful for accounts that can't be connected automatically or for keeping track of informal debts.",
      category: "features"
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time from your Account Settings page. Navigate to Settings > Billing and click 'Cancel Subscription'. Your access will continue until the end of your current billing period. We don't offer refunds for partial months.",
      category: "billing"
    },
    {
      question: "What happens to my data if I cancel my subscription?",
      answer: "If you cancel your subscription, your data remains secure in our system for 30 days, allowing you to reactivate if you change your mind. After 30 days, you can request data deletion from our support team, or your data will be automatically anonymized according to our data retention policy.",
      category: "security"
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, we offer mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store. The mobile apps provide all the core functionality of the web application, allowing you to track your progress and manage your debt on the go.",
      category: "features"
    },
    {
      question: "How often is my account information updated?",
      answer: "For connected accounts, information is typically updated daily. However, some financial institutions may have different update frequencies. For the most current information, you can manually trigger an update by clicking the refresh button on your Dashboard.",
      category: "features"
    }
  ];

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  // Help categories
  const helpCategories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      icon: <ChevronRight className="h-5 w-5" />
    },
    {
      id: "features",
      title: "Features & Tools",
      description: "Explore all available features and how to use them",
      icon: <ChevronRight className="h-5 w-5" />
    },
    {
      id: "billing",
      title: "Billing & Subscription",
      description: "Manage your plan and payment information",
      icon: <ChevronRight className="h-5 w-5" />
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Learn how we protect your data",
      icon: <ChevronRight className="h-5 w-5" />
    }
  ];

  // Help articles
  const helpArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Setting Up Your Debt Payoff Plan",
      excerpt: "Learn how to create your first debt payoff plan and optimize it for your financial situation.",
      category: "getting-started",
      url: "/help/articles/setting-up-debt-payoff-plan"
    },
    {
      id: "2",
      title: "Connecting Your Financial Accounts Securely",
      excerpt: "A guide to safely linking your bank accounts and credit cards for automatic tracking.",
      category: "security",
      url: "/help/articles/connecting-financial-accounts"
    },
    {
      id: "3",
      title: "Understanding the Debt Snowball Method",
      excerpt: "Learn how the debt snowball method works and how it can keep you motivated on your debt-free journey.",
      category: "features",
      url: "/help/articles/debt-snowball-method"
    },
    {
      id: "4",
      title: "Comparing Debt Avalanche vs. Snowball",
      excerpt: "Understand the differences between debt payment strategies and which one might work best for you.",
      category: "features",
      url: "/help/articles/avalanche-vs-snowball"
    },
    {
      id: "5",
      title: "Managing Your Subscription",
      excerpt: "How to change your plan, update payment methods, or cancel your subscription.",
      category: "billing",
      url: "/help/articles/managing-subscription"
    },
    {
      id: "6",
      title: "Tracking Your Debt Freedom Progress",
      excerpt: "Make the most of our progress tracking features to stay motivated on your journey.",
      category: "features",
      url: "/help/articles/tracking-progress"
    }
  ];

  // Filter articles based on search query
  const filteredArticles = searchQuery
    ? helpArticles.filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : helpArticles;

  return (
    <Layout
      title="Help Center - Smart Debt Flow"
      description="Get help with Smart Debt Flow. Find answers to frequently asked questions, tutorials, and support resources."
    >
      <Head>
        <meta property="og:title" content="Help Center - Smart Debt Flow" />
        <meta
          property="og:description"
          content="Find answers to your questions about using Smart Debt Flow for debt management."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/help" />
      </Head>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              How Can We Help You?
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Find answers, learn how to use Smart Debt Flow, and get support when you need it.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative max-w-xl mx-auto"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help, tutorials, FAQs..."
                className="pl-10 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Tabs 
            defaultValue="help-center" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="help-center">Help Center</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
                <TabsTrigger value="contact">Contact Us</TabsTrigger>
              </TabsList>
            </div>

            {/* Help Center Content */}
            <TabsContent value="help-center" className="mt-0">
              <div className="max-w-6xl mx-auto">
                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {helpCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/help/categories/${category.id}`}
                      className="block group"
                    >
                      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                        <CardContent className="p-6">
                          <div className="flex flex-col h-full">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {category.description}
                            </p>
                            <div className="mt-auto flex items-center text-primary">
                              <span>Browse articles</span>
                              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Popular Articles */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">
                    {searchQuery ? "Search Results" : "Popular Articles"}
                  </h2>
                  
                  {filteredArticles.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No articles found matching "{searchQuery}"
                      </p>
                      <Button onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={article.url}
                        className="block group"
                      >
                        <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                          <CardContent className="p-6">
                            <div className="flex flex-col h-full">
                              <div className="text-xs font-medium text-primary mb-2">
                                {helpCategories.find(c => c.id === article.category)?.title}
                              </div>
                              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-4">
                                {article.excerpt}
                              </p>
                              <div className="mt-auto text-sm text-primary flex items-center">
                                <span>Read more</span>
                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Video Tutorials */}
                <div>
                  <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 z-10 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                            <div className="rounded-full bg-[#1DB954] text-white w-16 h-16 flex items-center justify-center shadow-lg">
                              <Video className="h-6 w-6" />
                            </div>
                          </div>
                          <video 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            poster="/assets/help/thumbnails/dashboard-overview.svg"
                            controls
                            preload="none"
                          >
                            <source src="/assets/help/getting-started.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold mb-2 group-hover:text-[#1DB954] transition-colors">Getting Started Tutorial</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Learn how to set up your account and start managing your debt in under 10 minutes.
                          </p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duration: 8:45</span>
                            <span className="flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-[#1DB954] mr-1"></span>
                              Beginner
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 z-10 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                            <div className="rounded-full bg-[#1DB954] text-white w-16 h-16 flex items-center justify-center shadow-lg">
                              <Video className="h-6 w-6" />
                            </div>
                          </div>
                          <video 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            poster="/assets/help/thumbnails/debt-payoff-plan.svg"
                            controls
                            preload="none"
                          >
                            <source src="/assets/help/debt-payoff-plan.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold mb-2 group-hover:text-[#1DB954] transition-colors">Creating a Debt Payoff Plan</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            A detailed walkthrough of creating a customized debt payment strategy for your specific situation.
                          </p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duration: 12:20</span>
                            <span className="flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                              Intermediate
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 z-10 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                            <div className="rounded-full bg-[#1DB954] text-white w-16 h-16 flex items-center justify-center shadow-lg">
                              <Video className="h-6 w-6" />
                            </div>
                          </div>
                          <video 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            poster="/assets/help/thumbnails/ai-insights.svg"
                            controls
                            preload="none"
                          >
                            <source src="/assets/help/advanced-features.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold mb-2 group-hover:text-[#1DB954] transition-colors">Advanced Features & Optimization</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Explore powerful tools for scenario planning, optimization algorithms, and progress tracking.
                          </p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duration: 15:50</span>
                            <span className="flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                              Advanced
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Link href="/assets/help/videos/index.html" target="_blank">
                      <Button variant="outline" className="bg-background hover:bg-accent text-foreground">
                        View All Video Tutorials
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* FAQs Content */}
            <TabsContent value="faqs" className="mt-0">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {searchQuery ? "FAQ Search Results" : "Frequently Asked Questions"}
                </h2>
                
                {filteredFAQs.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No FAQs found matching "{searchQuery}"
                    </p>
                    <Button onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger>
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p>{faq.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            {/* Contact Us Content */}
            <TabsContent value="contact" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Need more help? Our support team is ready to assist you with any questions or issues you might have.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-4 inline-block">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Live Chat</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Chat with our support team in real-time during business hours.
                      </p>
                      <Button>Start Chat</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-4 inline-block">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Send us a message and we'll respond within 24 hours.
                      </p>
                      <Link href="mailto:support@smartdebtflow.com">
                        <Button>Email Us</Button>
                      </Link>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-4 inline-block">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Submit a Ticket</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create a support ticket for complex issues or feature requests.
                      </p>
                      <Button>Create Ticket</Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted rounded-lg p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                  <p className="mb-4">
                    Our support team is available Monday through Friday, 9am to 5pm PT.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We strive to respond to all inquiries within 24 business hours.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-8">
              Connect with other users, share strategies, and get inspired on your debt-free journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                Join Forum
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline">
                Follow on Social Media
              </Button>
            </div>
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