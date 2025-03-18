"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveCard,
  ResponsiveCardGrid,
} from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Calendar, Clock } from "lucide-react";

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

// Reusing the same blog posts data from the main blog page
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
  // Additional posts for the archive page
  {
    id: "5",
    slug: "automate-your-finances",
    title: "How to Automate Your Finances for Debt Reduction",
    excerpt:
      "Learn how to set up automated systems that make paying off debt easier and more consistent.",
    date: "February 10, 2023",
    readTime: "8 min",
    category: "Debt Strategies",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80",
    author: {
      id: "1",
      name: "Sarah Johnson",
      role: "Financial Advisor",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    },
  },
  {
    id: "6",
    slug: "credit-card-balance-transfer",
    title: "Using Balance Transfers Effectively to Pay Down Debt",
    excerpt:
      "A strategic approach to using credit card balance transfers to reduce interest payments and accelerate debt payoff.",
    date: "January 28, 2023",
    readTime: "9 min",
    category: "Credit",
    image:
      "https://images.unsplash.com/photo-1559589689-577aabd1db4f?auto=format&fit=crop&q=80",
    author: {
      id: "2",
      name: "David Chen",
      role: "Credit Expert",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80",
    },
  },
];

// Archive blog post card component
const ArchivePostCard = ({ post }: { post: BlogPost }) => (
  <Card className="overflow-hidden">
    <div className="relative aspect-video">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
    <CardContent className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{post.date}</span>
        <span className="mx-1">•</span>
        <Clock className="h-4 w-4" />
        <span>{post.readTime}</span>
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-xl font-semibold">
        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-muted-foreground">{post.excerpt}</p>

      <div className="mt-4 flex items-center">
        <div className="relative h-8 w-8 overflow-hidden rounded-full">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
        <span className="ml-2 text-sm font-medium">{post.author.name}</span>
      </div>
    </CardContent>
  </Card>
);

export default function BlogArchivePage() {
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

  return (
    <main className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20">
      {/* Back to blog button */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          All Articles
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Browse our complete collection of financial education resources
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
              <TabsTrigger value="debt strategies">Debt</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Articles grid */}
      <div className="mt-12">
        <ResponsiveCardGrid
          className="gap-6"
          columns={{ base: 1, sm: 2, lg: 3 }}
        >
          {filteredPosts.map((post) => (
            <ArchivePostCard key={post.id} post={post} />
          ))}
        </ResponsiveCardGrid>

        {filteredPosts.length === 0 && (
          <div className="mt-12 text-center">
            <h3 className="text-xl font-medium">No articles found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search terms or filter
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
