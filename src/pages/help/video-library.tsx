import { useState, useRef } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Video, 
  ArrowLeft, 
  Clock, 
  Calendar,
  Play,
  BookOpen,
  BarChart,
  Lightbulb,
  ArrowRight,
  ChevronRight
} from "lucide-react";

// Define types
interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  dateAdded: string;
  views: number;
}

interface VideoCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function VideoLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Video categories
  const categories: VideoCategory[] = [
    { id: "all", name: "All Videos", icon: <Video /> },
    { id: "getting-started", name: "Getting Started", icon: <BookOpen /> },
    { id: "debt-strategies", name: "Debt Strategies", icon: <BarChart /> },
    { id: "advanced", name: "Advanced Features", icon: <Lightbulb /> }
  ];

  // Sample video tutorials data
  const videoTutorials: VideoTutorial[] = [
    {
      id: "1",
      title: "Getting Started with Smart Debt Flow",
      description: "Learn how to set up your account and start managing your debt in under 10 minutes.",
      thumbnail: "/assets/help/thumbnails/dashboard-overview.svg",
      videoUrl: "/assets/help/getting-started.mp4",
      duration: "8:45",
      level: "beginner",
      category: "getting-started",
      dateAdded: "2023-10-15",
      views: 1248
    },
    {
      id: "2",
      title: "Creating a Debt Payoff Plan",
      description: "A detailed walkthrough of creating a customized debt payment strategy for your specific situation.",
      thumbnail: "/assets/help/thumbnails/debt-payoff-plan.svg",
      videoUrl: "/assets/help/debt-payoff-plan.mp4",
      duration: "12:20",
      level: "intermediate",
      category: "debt-strategies",
      dateAdded: "2023-10-20",
      views: 986
    },
    {
      id: "3",
      title: "Advanced Features & Optimization",
      description: "Explore powerful tools for scenario planning, optimization algorithms, and progress tracking.",
      thumbnail: "/assets/help/thumbnails/ai-insights.svg",
      videoUrl: "/assets/help/advanced-features.mp4",
      duration: "15:50",
      level: "advanced",
      category: "advanced",
      dateAdded: "2023-10-25",
      views: 652
    },
    {
      id: "4",
      title: "Navigating the Dashboard",
      description: "Learn how to use every component of the Smart Debt Flow dashboard for maximum efficiency.",
      thumbnail: "/assets/help/thumbnails/dashboard-overview.svg",
      videoUrl: "/assets/help/getting-started.mp4",
      duration: "7:15",
      level: "beginner",
      category: "getting-started",
      dateAdded: "2023-11-05",
      views: 875
    },
    {
      id: "5",
      title: "Understanding the Debt Snowball Method",
      description: "A complete explanation of the debt snowball method and how to implement it in your repayment strategy.",
      thumbnail: "/assets/help/thumbnails/debt-payoff-plan.svg", 
      videoUrl: "/assets/help/debt-payoff-plan.mp4",
      duration: "10:30",
      level: "beginner",
      category: "debt-strategies",
      dateAdded: "2023-11-12",
      views: 1105
    },
    {
      id: "6",
      title: "Mastering the Debt Avalanche Method",
      description: "Learn about the mathematically optimal debt avalanche method and when to use it for maximum interest savings.",
      thumbnail: "/assets/help/thumbnails/debt-payoff-plan.svg",
      videoUrl: "/assets/help/advanced-features.mp4",
      duration: "11:20",
      level: "intermediate",
      category: "debt-strategies",
      dateAdded: "2023-11-18",
      views: 923
    },
    {
      id: "7",
      title: "Setting Up Payment Reminders & Automations",
      description: "Never miss a payment again by setting up Smart Debt Flow's reminder and automation features.",
      thumbnail: "/assets/help/thumbnails/dashboard-overview.svg",
      videoUrl: "/assets/help/getting-started.mp4",
      duration: "9:40",
      level: "beginner",
      category: "getting-started",
      dateAdded: "2023-11-25",
      views: 784
    },
    {
      id: "8",
      title: "Creating Custom Debt Reduction Scenarios",
      description: "Learn how to use the scenario planning tools to visualize different debt repayment approaches.",
      thumbnail: "/assets/help/thumbnails/ai-insights.svg",
      videoUrl: "/assets/help/debt-payoff-plan.mp4",
      duration: "14:15",
      level: "advanced",
      category: "advanced",
      dateAdded: "2023-12-03",
      views: 615
    },
    {
      id: "9",
      title: "Connecting Financial Accounts Securely",
      description: "A guide to safely connecting your financial accounts while maintaining security and privacy.",
      thumbnail: "/assets/help/thumbnails/dashboard-overview.svg",
      videoUrl: "/assets/help/advanced-features.mp4",
      duration: "6:50",
      level: "beginner",
      category: "getting-started",
      dateAdded: "2023-12-10",
      views: 892
    }
  ];

  // Filter videos based on search query and active category
  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = searchQuery === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || video.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Helper function to format the level indicator
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-[#1DB954]';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-blue-500';
      default: return 'bg-[#1DB954]';
    }
  };

  return (
    <Layout
      title="Video Library - Smart Debt Flow Help Center"
      description="Watch our collection of tutorial videos to learn how to use Smart Debt Flow effectively and manage your debt with confidence."
    >
      <Head>
        <meta property="og:title" content="Video Library - Smart Debt Flow Help Center" />
        <meta
          property="og:description"
          content="Watch our collection of tutorial videos to learn how to use Smart Debt Flow effectively and manage your debt with confidence."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/help/video-library" />
      </Head>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Link href="/Help">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Video Tutorial Library
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-6"
            >
              Visual guides to help you make the most of Smart Debt Flow and achieve financial freedom faster.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative max-w-md"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos..."
                className="pl-10 py-5 text-lg bg-background border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Category filter */}
          <div className="mb-10">
            <Tabs 
              defaultValue="all" 
              value={activeCategory}
              onValueChange={setActiveCategory}
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
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      {category.id === activeCategory && (
                        <motion.div
                          layoutId="activeVideoTab"
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

              {/* Video grid */}
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  {filteredVideos.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border p-6">
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2 text-foreground">No videos found</h3>
                      <p className="text-muted-foreground mb-6">
                        No videos match your search criteria. Try adjusting your search or browse all videos.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategory("all");
                        }}
                        className="bg-background hover:bg-accent text-foreground"
                      >
                        View All Videos
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVideos.map((video) => (
                        <Card 
                          key={video.id} 
                          className="group overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50"
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-video bg-muted">
                              <div className="absolute inset-0 z-10 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                                <div className="rounded-full bg-[#1DB954] text-white w-16 h-16 flex items-center justify-center shadow-lg">
                                  <Play className="h-6 w-6 ml-1" />
                                </div>
                              </div>
                              <Link href={
                                video.id === "1" ? "/assets/help/videos/dashboard-overview.html" :
                                video.id === "2" ? "/assets/help/videos/debt-payoff-plan.html" :
                                video.id === "3" ? "/assets/help/videos/ai-insights.html" :
                                video.videoUrl
                              } target="_blank">
                                <img
                                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                  src={video.thumbnail}
                                  alt={video.title}
                                />
                              </Link>
                            </div>
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{video.duration}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-block w-2 h-2 rounded-full ${getLevelColor(video.level)} mr-1`}></span>
                                  <span className="text-xs capitalize text-muted-foreground">{video.level}</span>
                                </div>
                              </div>
                              <h3 className="font-semibold mb-2 group-hover:text-[#1DB954] transition-colors">
                                {video.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {video.description}
                              </p>
                              <Link href={
                                video.id === "1" ? "/assets/help/videos/dashboard-overview.html" :
                                video.id === "2" ? "/assets/help/videos/debt-payoff-plan.html" :
                                video.id === "3" ? "/assets/help/videos/ai-insights.html" :
                                video.videoUrl
                              } target="_blank" className="text-sm text-primary flex items-center hover:underline">
                                <span>Watch tutorial</span>
                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </Link>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{new Date(video.dateAdded).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}</span>
                                </div>
                                <span>{video.views.toLocaleString()} views</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Help resources */}
          <div className="mt-16 border-t border-border pt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">Need More Help?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our video tutorials cover most common questions, but if you need additional assistance,
                we're here to help.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-[#1DB954] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Help Articles</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse our collection of detailed help articles and guides.
                  </p>
                  <Link href="/Help">
                    <Button variant="outline" size="sm" className="w-full">
                      View Articles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <BarChart className="h-8 w-8 text-[#1DB954] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Live Webinars</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our weekly live webinars with debt strategy experts.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="h-8 w-8 text-[#1DB954] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get personalized help from our expert support team.
                  </p>
                  <Link href="/Help?tab=contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Us
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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