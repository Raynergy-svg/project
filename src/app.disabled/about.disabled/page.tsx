"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Heart,
  TrendingUp,
  Shield,
  Award,
  Users,
  BarChart2,
  Globe,
  ArrowRight,
  Brain,
  Calculator,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

interface ValueProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface MilestoneProps {
  year: string;
  title: string;
  description: string;
}

const ValueCard = ({ icon, title, description }: ValueProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm"
    >
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const Milestone = ({ year, title, description }: MilestoneProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative pl-8 pb-10 border-l border-primary/30 last:border-0 last:pb-0"
    >
      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary" />
      <span className="inline-block mb-1 text-sm font-semibold bg-primary/10 px-2 py-1 rounded text-primary">
        {year}
      </span>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col"
    >
      <div className="relative h-64 w-full mb-4 overflow-hidden rounded-lg">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
      <p className="text-primary mb-2">{member.role}</p>
      <p className="text-muted-foreground mb-3 text-sm">{member.bio}</p>
      <div className="flex gap-3 mt-auto">
        {member.social.linkedin && (
          <a
            href={member.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        )}
        {member.social.twitter && (
          <a
            href={member.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Twitter
          </a>
        )}
        {member.social.github && (
          <a
            href={member.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("mission");
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const values = [
    {
      icon: <Heart size={24} />,
      title: "User-Centered",
      description:
        "We put you first. Our tools are designed to solve real money problems that people face every day, not just to look fancy.",
    },
    {
      icon: <Shield size={24} />,
      title: "Security",
      description:
        "Your money information is private and important. We protect it with the same security that banks use to keep your data safe.",
    },
    {
      icon: <Brain size={24} />,
      title: "Smart Technology",
      description:
        "Our AI tools analyze your finances and suggest the best ways to pay off debt faster, like having a financial advisor in your pocket.",
    },
    {
      icon: <Calculator size={24} />,
      title: "Simple Tools",
      description:
        "We make complicated financial stuff easy to understand with tools that show you exactly how to get out of debt step by step.",
    },
    {
      icon: <Clock size={24} />,
      title: "Time-Saving",
      description:
        "Our app does the hard work for you, saving you hours of figuring out payment plans and tracking your progress automatically.",
    },
    {
      icon: <Globe size={24} />,
      title: "For Everyone",
      description:
        "We believe everyone deserves financial freedom, no matter how much money you make or how much debt you have.",
    },
  ];

  const milestones = [
    {
      year: "Month 1",
      title: "The Beginning",
      description:
        "Smart Debt Flow began when our founder, David Certan, recognized the need for an AI-powered solution to help people manage their debt efficiently and achieve financial peace of mind.",
    },
    {
      year: "Month 2",
      title: "Concept Development",
      description:
        "Developed the core algorithms that power our AI debt management system, focused on creating tools that anyone could use regardless of their financial background.",
    },
    {
      year: "Month 3",
      title: "First Beta Tests",
      description:
        "Invited a select group of users to test our initial platform. Their valuable feedback helped shape a more intuitive and powerful debt management experience.",
    },
    {
      year: "Present",
      title: "Growing Impact",
      description:
        "Today, Smart Debt Flow is helping users take control of their financial future with AI-driven insights and personalized debt repayment strategies.",
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: "David Certan",
      role: "Founder & CEO",
      bio: "Entrepreneur with a passion for using AI technology to help people achieve financial freedom and live stress-free lives.",
      image: "/avatars/default-avatar.jpg",
      social: {
        linkedin: "https://linkedin.com/in/david-certan",
        twitter: "https://twitter.com/davidcertan",
      },
    },
    {
      name: "Open Position",
      role: "Head of Technology",
      bio: "We're looking for a tech leader passionate about creating innovative financial solutions that make a real difference in people's lives.",
      image: "/avatars/default-avatar.jpg",
      social: {
        linkedin: "https://linkedin.com/company/smartdebtflow",
      },
    },
    {
      name: "Open Position",
      role: "AI Specialist",
      bio: "Join us in developing cutting-edge AI algorithms that help people pay off debt faster and achieve financial peace of mind.",
      image: "/avatars/default-avatar.jpg",
      social: {
        linkedin: "https://linkedin.com/company/smartdebtflow",
      },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-20 px-4 md:py-28 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-background z-0"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Smart Debt Flow
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10">
              We're on a mission to help everyone achieve financial freedom by
              making debt management simple, intelligent, and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Join Us Today</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Try Demo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
              <TabsTrigger value="journey">Our Journey</TabsTrigger>
              <TabsTrigger value="team">Our Team</TabsTrigger>
            </TabsList>

            {/* Mission Tab */}
            <TabsContent value="mission" className="space-y-16">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    At Smart Debt Flow, we believe financial freedom should be
                    within everyone's reach. Our mission is to transform how
                    people manage debt by combining AI technology with
                    easy-to-use tools that make paying off debt faster, smarter,
                    and less stressful.
                  </p>
                  <p className="text-lg text-muted-foreground mb-8">
                    We're dedicated to democratizing financial success by giving
                    you the same powerful strategies that financial advisors use
                    but in a simple app that anyone can understand and apply to
                    their own situation.
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      See How It Works <ArrowRight className="ml-2" size={18} />
                    </Link>
                  </Button>
                </div>
                <div className="relative h-[350px] rounded-xl overflow-hidden">
                  <Image
                    src="/images/about/mission.jpg"
                    alt="Our mission"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-10 text-center">
                  Our Values
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {values.map((value, index) => (
                    <ValueCard
                      key={index}
                      icon={value.icon}
                      title={value.title}
                      description={value.description}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Journey Tab */}
            <TabsContent value="journey" className="space-y-16">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Smart Debt Flow is a recent idea inspired by a simple
                    conviction: paying off debt shouldn't be complicated. Our
                    journey began with a vision to democratize financial
                    freedom, making debt elimination strategies available to
                    everyone, not just those who can afford expensive financial
                    advisors.
                  </p>
                  <p className="text-lg text-muted-foreground mb-8">
                    We're only getting started, and we're excited to keep
                    building tools that will help millions of people take
                    control of their finances and achieve peace of mind.
                  </p>
                </div>
                <div className="relative h-[350px] rounded-xl overflow-hidden">
                  <Image
                    src="/images/about/journey.jpg"
                    alt="Our journey"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-10">Key Milestones</h2>
                <div className="pl-4">
                  {milestones.map((milestone, index) => (
                    <Milestone
                      key={index}
                      year={milestone.year}
                      title={milestone.title}
                      description={milestone.description}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-16">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Team</h2>
                <p className="text-lg text-muted-foreground mb-10">
                  We're a small but passionate team dedicated to creating
                  technology that makes financial freedom accessible to
                  everyone. We combine expertise in artificial intelligence,
                  financial planning, and user experience design to build tools
                  that actually help people get out of debt faster.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {teamMembers.map((member, index) => (
                    <TeamMemberCard key={index} member={member} />
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
                <p className="text-muted-foreground mb-6">
                  We're always looking for talented people who are passionate
                  about helping others achieve financial freedom. If you're
                  excited about using technology to make a real difference in
                  people's lives, we'd love to hear from you.
                </p>
                <Button size="lg" asChild>
                  <Link href="/careers">View Open Positions</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Debt?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of others who are using Smart Debt Flow to pay off
            debt faster and achieve financial peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started - It's Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Try Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
