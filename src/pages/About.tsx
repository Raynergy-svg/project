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
      year: "2020",
      title: "Our Beginning",
      description:
        "Smart Debt Flow started when our founders realized how hard it was for regular people to get out of debt without expensive financial advisors.",
    },
    {
      year: "2021",
      title: "Testing Our Idea",
      description:
        "We invited 500 people to try our early version. Their feedback helped us make the app better and easier to use.",
    },
    {
      year: "2022",
      title: "Official Launch",
      description:
        "We released Smart Debt Flow to the public with tools to help people understand their debt and make plans to pay it off faster.",
    },
    {
      year: "2022",
      title: "Growing Community",
      description:
        "We reached 10,000 users who together were working to pay off over $50 million in debt using our app.",
    },
    {
      year: "2023",
      title: "New Features",
      description:
        "We added AI-powered tools that automatically create payment plans and show you how to save money on interest payments.",
    },
    {
      year: "Present",
      title: "Making a Difference",
      description:
        "Today, our users are saving an average of 35% on interest and paying off debt 40% faster than they would with minimum payments.",
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      bio: "Former financial advisor with a passion for making financial literacy accessible to everyone.",
      image: "/assets/team/sarah.jpg",
      social: {
        linkedin: "https://linkedin.com/in/sarah-johnson",
        twitter: "https://twitter.com/sarahjohnson",
      },
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      bio: "Tech veteran with experience at major fintech companies, focused on building secure and scalable financial solutions.",
      image: "/assets/team/michael.jpg",
      social: {
        linkedin: "https://linkedin.com/in/michael-chen",
        github: "https://github.com/michaelchen",
      },
    },
    {
      name: "Aisha Patel",
      role: "Chief Financial Officer",
      bio: "Experienced financial strategist who believes in the power of data-driven decisions for financial wellness.",
      image: "/assets/team/aisha.jpg",
      social: {
        linkedin: "https://linkedin.com/in/aisha-patel",
      },
    },
    {
      name: "James Wilson",
      role: "Head of Product",
      bio: "Product leader focused on creating intuitive financial tools that empower people to take control of their debt.",
      image: "/assets/team/james.jpg",
      social: {
        linkedin: "https://linkedin.com/in/james-wilson",
        twitter: "https://twitter.com/jameswilson",
      },
    },
  ];

  const stats = [
    { label: "Users", value: "50,000+" },
    { label: "Debt Managed", value: "$250M+" },
    { label: "Average Savings", value: "$6,200" },
    { label: "Countries", value: "12" },
  ];

  return (
    <Layout>
      <Head>
        <title>About Smart Debt Flow | Our Mission to Help You Become Debt-Free</title>
        <meta
          name="description"
          content="Learn how Smart Debt Flow is helping thousands of people take control of their finances and break free from debt with AI-powered tools and simple strategies."
        />
      </Head>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-20">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Breaking Free From The Weight of Debt
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Smart Debt Flow helps you take control of your finances with easy-to-use tools that make paying off debt simpler and faster.
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
                We're on a mission to help people break free from debt and build a better financial future. We believe that:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Everyone deserves to understand their finances without needing a finance degree</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Smart technology should make managing money easier, not more complicated</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Getting out of debt shouldn't require expensive financial advisors</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>The path to financial freedom should be clear and achievable for everyone</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                Our users have reduced their debt by an average of 40% in their first year using Smart Debt Flow, and we're just getting started.
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
                  <span>Financial stress doesn't keep people up at night</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Everyone has the tools they need to make smart money decisions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Debt is a temporary situation, not a lifelong burden</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="text-primary mt-1 flex-shrink-0" />
                  <span>Financial freedom is achievable for everyone, regardless of their starting point</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                We're building Smart Debt Flow to be the most helpful, easy-to-use financial tool that actually makes a difference in people's lives.
              </p>
            </TabsContent>
          </Tabs>
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