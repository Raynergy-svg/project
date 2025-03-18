"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveCard,
  ResponsiveCardGrid,
} from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Search,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

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
        <ResponsiveCard className="h-full overflow-hidden transition-all hover:border-primary">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
              priority={post.featured}
            />
            <div className="absolute left-3 top-3 z-10">
              <Badge
                variant="secondary"
                className="bg-background/70 backdrop-blur-sm"
              >
                {post.category}
              </Badge>
            </div>
          </div>
          <CardContent className="flex h-full flex-col p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
              <span className="mx-1">•</span>
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
            <h3 className="mt-2.5 line-clamp-2 text-xl font-semibold group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-3 flex-grow text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">{post.author.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Read more</span>
              </Button>
            </div>
          </CardContent>
        </ResponsiveCard>
      </Link>
    </motion.div>
  );
};

// Sample blog posts data - this would typically come from an API or CMS
const posts: BlogPost[] = [
  {
    id: "1",
    slug: "debt-snowball-vs-avalanche",
    title: "Debt Snowball vs. Avalanche: Which Strategy is Right for You?",
    excerpt:
      "Compare two popular debt reduction strategies and learn which one might be the best fit for your financial situation and personality.",
    date: "June 12, 2023",
    readTime: "8 min",
    category: "Debt Strategies",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80",
    author: {
      id: "1",
      name: "Sarah Johnson",
      role: "Financial Advisor",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    },
    featured: true,
  },
  {
    id: "2",
    slug: "credit-score-myths",
    title: "5 Credit Score Myths That Could Be Costing You Money",
    excerpt:
      "Discover common misconceptions about credit scores and how they might be preventing you from achieving financial freedom.",
    date: "May 28, 2023",
    readTime: "6 min",
    category: "Credit",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80",
    author: {
      id: "2",
      name: "David Chen",
      role: "Credit Expert",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80",
    },
  },
  {
    id: "3",
    slug: "emergency-fund-basics",
    title: "Building Your Emergency Fund While Paying Off Debt",
    excerpt:
      "Learn how to balance saving for emergencies and paying down debt to create a more secure financial foundation.",
    date: "April 15, 2023",
    readTime: "7 min",
    category: "Savings",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80",
    author: {
      id: "3",
      name: "Emily Rodriguez",
      role: "Personal Finance Coach",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80",
    },
  },
  {
    id: "4",
    slug: "student-loan-forgiveness",
    title: "Navigating Student Loan Forgiveness Programs in 2023",
    excerpt:
      "A comprehensive guide to current student loan forgiveness options and how to determine if you qualify.",
    date: "March 22, 2023",
    readTime: "10 min",
    category: "Student Loans",
    image:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80",
    author: {
      id: "2",
      name: "David Chen",
      role: "Credit Expert",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80",
    },
  },
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter posts based on search and category filter
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeTab === "all" ||
      post.category.toLowerCase().includes(activeTab.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Featured post (first one in this case)
  const featuredPost = posts.find((post) => post.featured) || posts[0];

  return (
    <main className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          Financial Education & Insights
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Strategies, tips, and expert advice to help you manage debt and
          achieve financial freedom.
        </p>
      </div>

      {/* Search and filter */}
      <div className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="debt">Debt</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Featured post */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Featured Article</h2>
        <div className="mt-6">
          <BlogPostCard post={featuredPost} />
        </div>
      </div>

      {/* Latest posts */}
      <div className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/blog/archive">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ResponsiveCardGrid className="mt-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No articles found. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </ResponsiveCardGrid>
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/blog/archive">View all articles</Link>
          </Button>
        </div>
      </div>

      {/* Newsletter signup */}
      <div className="mt-20 rounded-xl bg-muted p-8 md:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Subscribe to Our Newsletter</h2>
          <p className="mt-3 text-muted-foreground">
            Get the latest articles, tools, and financial tips delivered
            straight to your inbox.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-0">
            <Input
              type="email"
              placeholder="Enter your email"
              className="rounded-r-none sm:rounded-r-none"
            />
            <Button type="submit" className="rounded-l-none sm:rounded-l-none">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
