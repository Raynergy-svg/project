"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Zap,
  GraduationCap,
  Globe,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function CareersPage() {
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(
    null
  );

  const toggleDepartment = (deptName: string) => {
    if (expandedDepartment === deptName) {
      setExpandedDepartment(null);
    } else {
      setExpandedDepartment(deptName);
    }
  };

  const positions = [
    {
      title: "Head of Technology",
      department: "Engineering & AI",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Lead our technical vision and strategy to create innovative financial solutions that make a real difference in people's lives.",
    },
    {
      title: "AI Specialist",
      department: "Engineering & AI",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Develop cutting-edge AI algorithms that help people pay off debt faster and achieve financial peace of mind.",
    },
    {
      title: "Financial Advisor",
      department: "Finance & Advisory",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Create financial strategies that empower users to take control of their debt and build a secure future.",
    },
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering & AI",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Build the foundation of our platform with modern technologies to deliver exceptional user experiences.",
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering & AI",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Apply machine learning techniques to analyze financial data and create personalized debt reduction plans.",
    },
    {
      title: "Product Manager",
      department: "Design & Product",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Shape the future of our product with a user-first mindset and data-driven approach.",
    },
    {
      title: "UX/UI Designer",
      department: "Design & Product",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Create intuitive, beautiful interfaces that make complex financial concepts simple to understand.",
    },
    {
      title: "Marketing Specialist",
      department: "Marketing & Growth",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Share our story and mission with the world, helping more people discover financial freedom.",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "User-First Mindset",
      description:
        "We're dedicated to helping people achieve financial freedom through innovative solutions.",
    },
    {
      icon: Users,
      title: "Collaborative Culture",
      description:
        "Work with passionate individuals who share your commitment to excellence.",
    },
    {
      icon: Zap,
      title: "Innovation Driven",
      description:
        "We're constantly pushing boundaries in AI and financial technology.",
    },
    {
      icon: GraduationCap,
      title: "Growth & Learning",
      description:
        "Continuous learning and professional development opportunities.",
    },
    {
      icon: Globe,
      title: "Remote-First",
      description: "Work from anywhere while making a global impact.",
    },
    {
      icon: Brain,
      title: "AI Excellence",
      description:
        "Be at the forefront of applying AI to solve real financial problems.",
    },
  ];

  const departments = [
    {
      name: "Engineering & AI",
      description:
        "Build the technology that powers our AI-driven financial solutions.",
      positions: positions.filter((p) => p.department === "Engineering & AI"),
      icon: Brain,
    },
    {
      name: "Finance & Advisory",
      description:
        "Create the financial strategies that help our users achieve freedom from debt.",
      positions: positions.filter((p) => p.department === "Finance & Advisory"),
      icon: ChevronUp,
    },
    {
      name: "Design & Product",
      description:
        "Craft intuitive experiences that simplify complex financial concepts.",
      positions: positions.filter((p) => p.department === "Design & Product"),
      icon: Users,
    },
    {
      name: "Marketing & Growth",
      description:
        "Spread our mission to help more people achieve financial freedom.",
      positions: positions.filter((p) => p.department === "Marketing & Growth"),
      icon: Globe,
    },
  ];

  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Join Our Mission
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Help us revolutionize debt management and empower millions to
            achieve financial freedom
          </p>
        </motion.div>

        {/* Company Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Departments with Expandable Positions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Teams</h2>
          <div className="space-y-8 max-w-4xl mx-auto">
            {departments.map((dept) => (
              <motion.div
                key={dept.name}
                layout
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-colors flex justify-between items-center"
                  onClick={() => toggleDepartment(dept.name)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <dept.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{dept.name}</h3>
                      <p className="text-muted-foreground">
                        {dept.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium">
                      {dept.positions.length} positions
                    </div>
                    {expandedDepartment === dept.name ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDepartment === dept.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.3, delay: 0.1 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.2 },
                        },
                      }}
                      className="border-t border-border"
                    >
                      <div className="p-6 space-y-6">
                        {dept.positions.map((position) => (
                          <div key={position.title} className="group">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {position.title}
                              </h4>
                              <div className="flex gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {position.location}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  •
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {position.type}
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4">
                              {position.description}
                            </p>
                            <Button
                              variant="outline"
                              className="group-hover:border-primary group-hover:text-primary transition-colors"
                            >
                              Apply Now
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
