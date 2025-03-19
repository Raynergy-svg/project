'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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
      className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-lg leading-relaxed">
        {description}
      </p>
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
      className="relative pl-10 pb-12 border-l-2 border-primary/50 last:border-0 last:pb-0"
    >
      <div className="absolute left-[-10px] top-0 w-5 h-5 rounded-full bg-primary shadow-lg" />
      <span className="inline-block mb-2 text-sm font-bold bg-primary/10 px-4 py-2 rounded-full text-primary">
        {year}
      </span>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-lg leading-relaxed">
        {description}
      </p>
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
      className="flex flex-col bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-72 w-full mb-6 overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
        <p className="text-primary font-medium mb-4">{member.role}</p>
        <p className="text-muted-foreground mb-6">{member.bio}</p>
        <div className="flex space-x-4">
          {member.social.linkedin && (
            <Link
              href={member.social.linkedin}
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
          )}
          {member.social.twitter && (
            <Link
              href={member.social.twitter}
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
          )}
          {member.social.github && (
            <Link
              href={member.social.github}
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function DynamicAboutPage() {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={isHeroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-b from-primary/10 to-background pt-24 pb-32 px-6"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About Smart Debt Flow
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to help everyone achieve financial freedom
              through smart technology and simple solutions.
            </p>
            <Button size="lg" className="rounded-full text-lg px-8">
              Join Our Mission <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} />
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Milestone key={index} {...milestone} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate
            about helping others achieve financial freedom.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full text-lg px-8"
          >
            View Open Positions <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>
    </div>
  );
}
