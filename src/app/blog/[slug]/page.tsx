"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveCard,
  ResponsiveCardGrid,
} from "@/components/ui/responsive-card";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageSquare,
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
  content?: string;
}

// Sample blog posts data - this would typically come from an API or CMS
const posts: BlogPost[] = [
  {
    id: "1",
    slug: "debt-snowball-vs-avalanche",
    title: "Debt Snowball vs. Avalanche: Which Strategy is Right for You?",
    excerpt:
      "Compare two popular debt reduction strategies and learn which one might be the best fit for your financial situation and personality. We break down the pros and cons of each approach.",
    date: "June 12, 2023",
    readTime: "8 min",
    category: "Debt Strategies",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop",
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
    `,
    author: {
      id: "1",
      name: "Sarah Johnson",
      role: "Financial Advisor",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    },
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
    content: `
      <h2>Common Credit Score Myths Debunked</h2>
      <p>Your credit score is one of the most important numbers in your financial life, yet it's surrounded by myths and misconceptions that could be costing you money. Let's debunk some of the most common credit score myths.</p>
      
      <h3>Myth 1: Checking Your Own Credit Score Hurts Your Credit</h3>
      <p>This is one of the most persistent myths about credit scores. The truth is that checking your own credit score is considered a "soft inquiry" and has no impact on your credit score. You can check your own credit as often as you like without any negative effects.</p>
      
      <p>It's important to distinguish between soft inquiries (when you check your own credit) and hard inquiries (when a lender checks your credit as part of a lending decision). Hard inquiries can temporarily lower your score by a few points, but soft inquiries have no impact.</p>
    `,
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
    content: `
      <h2>Finding Balance: Emergency Funds and Debt Payoff</h2>
      <p>When you're focused on paying off debt, it can be challenging to decide whether you should also be saving for emergencies. Both goals are important for your financial health, but how do you balance them effectively?</p>
      
      <h3>Why You Need an Emergency Fund</h3>
      <p>An emergency fund is a financial safety net designed to cover unexpected expenses or financial emergencies without derailing your long-term financial goals or forcing you to take on more debt. Common situations where an emergency fund might be used include:</p>
      <ul>
        <li>Medical emergencies</li>
        <li>Unexpected car repairs</li>
        <li>Home repairs</li>
        <li>Job loss</li>
        <li>Unexpected travel due to family emergencies</li>
      </ul>
      
      <p>Without an emergency fund, these unexpected expenses might force you to use credit cards or take out loans, potentially increasing your debt and undoing progress you've made in paying it down.</p>
    `,
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
    content: `
      <h2>Understanding Student Loan Forgiveness Options</h2>
      <p>Student loan debt has become a significant financial burden for millions of Americans. Fortunately, there are several forgiveness programs available that might help eligible borrowers eliminate some or all of their student loan debt. Here's what you need to know about the current landscape of student loan forgiveness.</p>
      
      <h3>Public Service Loan Forgiveness (PSLF)</h3>
      <p>The Public Service Loan Forgiveness program is designed for individuals who work full-time for qualifying public service employers. After making 120 qualifying monthly payments while working for an eligible employer, the remaining balance on your Direct Loans may be forgiven.</p>
      
      <p><strong>Key Requirements:</strong></p>
      <ul>
        <li>Work full-time for a qualifying employer (government organizations, non-profits, etc.)</li>
        <li>Have Direct Loans (or consolidate other federal student loans into Direct Loans)</li>
        <li>Make 120 qualifying monthly payments under an income-driven repayment plan</li>
        <li>Submit the PSLF form to certify your employment</li>
      </ul>
    `,
    author: {
      id: "2",
      name: "David Chen",
      role: "Credit Expert",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80",
    },
  },
];

// Related posts component
const RelatedPostCard = ({ post }: { post: BlogPost }) => (
  <Card className="overflow-hidden">
    <div className="relative aspect-video">
      <Image src={post.image} alt={post.title} fill className="object-cover" />
    </div>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{post.date}</span>
        <span className="mx-1">•</span>
        <Clock className="h-3 w-3" />
        <span>{post.readTime}</span>
      </div>
      <h4 className="mt-2 line-clamp-2 text-base font-medium">
        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h4>
    </CardContent>
  </Card>
);

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Find the post by slug
    const foundPost = posts.find((p) => p.slug === slug);

    if (foundPost) {
      setPost(foundPost);

      // Find related posts (same category, exclude current post)
      const related = posts
        .filter(
          (p) =>
            p.category
              .toLowerCase()
              .includes(foundPost.category.toLowerCase().split(" ")[0]) &&
            p.id !== foundPost.id
        )
        .slice(0, 3);

      setRelatedPosts(related);
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20">
      {/* Back to blog button */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to articles
          </Link>
        </Button>
      </div>

      {/* Hero section */}
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.date}</span>
          <span className="mx-1">•</span>
          <span>{post.readTime} read</span>
          <span className="mx-1">•</span>
          <span className="capitalize">{post.category.replace("-", " ")}</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl md:text-5xl">
          {post.title}
        </h1>

        <p className="mt-4 text-xl text-muted-foreground">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-4">
          <Avatar>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-sm text-muted-foreground">
              {post.author.role}
            </div>
          </div>
        </div>
      </div>

      {/* Featured image */}
      <div className="mx-auto mt-8 max-w-5xl rounded-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[2/1]"
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>

      {/* Article content */}
      <div className="mx-auto mt-12 max-w-3xl">
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        {/* Post actions */}
        <div className="mt-12 flex items-center justify-between">
          <div className="flex gap-4">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ThumbsUp className="h-4 w-4" />
              <span>Like</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>Comment</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Related articles */}
      <div className="mx-auto mt-20 max-w-4xl">
        <h2 className="text-2xl font-bold">Related Articles</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((post) => (
            <RelatedPostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/blog">View all articles</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
