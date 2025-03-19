import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Heart, Users, Zap, GraduationCap, Globe, Brain } from "lucide-react";

// Static server component with no dynamic imports or fallbacks - simplifies the webpack loading
export default function CareersPage() {
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
      colorClass: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Finance & Advisory",
      description:
        "Create the financial strategies that help our users achieve freedom from debt.",
      positions: positions.filter((p) => p.department === "Finance & Advisory"),
      icon: Users,
      colorClass: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      name: "Design & Product",
      description:
        "Craft intuitive experiences that simplify complex financial concepts.",
      positions: positions.filter((p) => p.department === "Design & Product"),
      icon: Heart,
      colorClass: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      name: "Marketing & Growth",
      description:
        "Spread our mission to help more people achieve financial freedom.",
      positions: positions.filter((p) => p.department === "Marketing & Growth"),
      icon: Globe,
      colorClass: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header - No animations */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Join Our Mission
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Help us revolutionize debt management and empower millions to
            achieve financial freedom
          </p>
        </div>

        {/* Company Values - No animations */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Departments - No expandable sections or animations */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="space-y-8 max-w-4xl mx-auto">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="p-6 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-full w-12 h-12 flex items-center justify-center ${dept.colorClass}`}
                    >
                      <dept.icon className={`${dept.iconColor} w-6 h-6`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{dept.name}</h3>
                      <p className="text-muted-foreground">{dept.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Always show positions - no toggle */}
                <div className="divide-y border-t">
                  {positions
                    .filter((p) => p.department === dept.name)
                    .map((position) => (
                      <div
                        key={position.title}
                        className="p-6 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold">{position.title}</h4>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-2 mt-1">
                              <span>{position.location}</span>
                              <span>•</span>
                              <span>{position.type}</span>
                            </div>
                            <p className="mt-2 text-muted-foreground">
                              {position.description}
                            </p>
                          </div>
                          <Button 
                            className="text-primary bg-primary/10 hover:bg-primary/20 min-w-[120px]"
                            size="sm"
                          >
                            Apply
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA - No animations */}
        <div className="text-center max-w-3xl mx-auto bg-primary/5 p-8 rounded-xl border border-primary/10">
          <h2 className="text-2xl font-bold mb-4">Don't see a perfect fit?</h2>
          <p className="text-muted-foreground mb-6">
            We're always looking for talented individuals. Send us your resume
            and tell us why you'd be a great addition to our team.
          </p>
          <Button asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
