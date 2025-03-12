import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
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
    {
      name: "Open Position",
      role: "Financial Advisor",
      bio: "Help us create financial strategies that empower users to take control of their debt and build a secure future.",
      image: "/avatars/default-avatar.jpg",
      social: {
        linkedin: "https://linkedin.com/company/smartdebtflow",
      },
    },
  ];

  const stats = [
    { label: "Beta Users", value: "100+" },
    { label: "Debt Insights Generated", value: "$500K+" },
    { label: "Projected Avg. Savings", value: "$4,300" },
    { label: "Customer Satisfaction", value: "94%" },
  ];

  return (
    <Layout>
      <Head>
        <title>About Smart Debt Flow | Our Mission to Help You Become Debt-Free</title>
        <meta
          name="description"
          content="Learn how Smart Debt Flow is using AI to help people achieve financial freedom and live stress-free lives by taking control of their debt."
        />
      </Head>

      <main className="container mx-auto px-4 py-12 pt-24 md:pt-28">
        {/* Hero Section */}
        <section className="mb-20 mt-8">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 pt-2 md:pt-0 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Achieve Financial Peace of Mind
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Smart Debt Flow was founded with a single mission: to help people achieve a stress-free life by using AI to take care of their debt.
            </p>
          </motion.div>
        </section>

        {/* Mission & Vision Tabs */}
        <section className="mb-20">
          <Tabs
            defaultValue="mission"
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-3xl mx-auto"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
              <TabsTrigger value="vision">Our Vision</TabsTrigger>
            </TabsList>
            <TabsContent value="mission" className="p-6 bg-card rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                Our mission is to leverage AI technology to eliminate the stress of debt management and guide people toward financial freedom. We believe that:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Managing debt shouldn't cause anxiety or sleepless nights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>AI can transform complex financial decisions into simple, actionable steps</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Everyone deserves access to intelligent financial tools, not just the wealthy</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Technology should serve people by creating meaningful improvements in their daily lives</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                Our early users are already seeing how AI-driven insights can transform their approach to debt management.
              </p>
            </TabsContent>
            <TabsContent value="vision" className="p-6 bg-card rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground mb-4">
                We envision a world where:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>People no longer feel overwhelmed by their financial obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>AI works behind the scenes to optimize your finances while you focus on living your life</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Financial stress is eliminated through intelligent automation and personalized strategies</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Everyone can access the benefits of AI-powered financial planning, regardless of their background</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                Smart Debt Flow is at the forefront of creating this future, where AI transforms financial management from a source of stress to a seamless background process.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        {/* Founder's Note */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto bg-card rounded-lg p-8 border border-border">
            <h2 className="text-3xl font-bold mb-6">A Note From Our Founder</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3">
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <Image
                    src="/avatars/default-avatar.jpg"
                    alt="David Certan"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <p className="italic text-muted-foreground mb-4">
                  "I founded Smart Debt Flow after seeing how many people struggle with the overwhelming burden of debt management. Financial stress shouldn't be a normal part of life. I believe that with the right AI tools, we can transform debt from a source of anxiety to just another aspect of life that's efficiently managed in the background."
                </p>
                <p className="italic text-muted-foreground mb-4">
                  "Our AI technology is designed to take the complexity out of debt repayment strategies, interest management, and financial planning. By putting these powerful tools in everyone's hands, we're working to create a world where financial peace of mind is the norm, not the exception."
                </p>
                <p className="font-medium">
                  - David Certan, Founder & CEO
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How We Help You Break Free From Debt</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tools make it simple to understand your debt and create a clear path to becoming debt-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Analysis</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Our smart AI looks at your debts and financial situation, then suggests the best way to pay them off faster and save money on interest.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Personalized debt payoff strategies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Save up to 35% on interest payments</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Financial Tools</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Our easy-to-use tools help you see exactly where your money is going and how to redirect it to pay off debt faster.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Debt payoff calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Visual progress tracking</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Financial Insights</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                We show you patterns in your spending and help you find money you can use to pay off debt faster without feeling deprived.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Spending pattern analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Debt-free date forecasting</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Smart Debt Flow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <ValueCard
                key={index}
                icon={value.icon}
                title={value.title}
                description={value.description}
              />
            ))}
          </div>
        </section>

        {/* Our Journey */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From a simple idea to helping thousands of people become debt-free.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <Milestone
                key={index}
                year={milestone.year}
                title={milestone.title}
                description={milestone.description}
              />
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're a group of finance experts, tech innovators, and people who've been in debt ourselves. We understand what you're going through.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 px-4 bg-card rounded-lg border border-border">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Debt-Free Journey?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of people who are taking control of their finances and working toward a debt-free future.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
} 