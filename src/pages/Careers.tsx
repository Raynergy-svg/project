import { motion } from 'framer-motion';
import { Heart, Users, Zap, GraduationCap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Careers() {
  const navigate = useNavigate();

  const handleApply = (position: string, department: string) => {
    console.log('Applying for:', position, 'in', department);
    const url = `/apply?position=${encodeURIComponent(position)}&department=${encodeURIComponent(department)}`;
    console.log('Navigating to:', url);
    navigate(url);
  };

  const positions = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote (US)",
      type: "Full-time",
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote (US)",
      type: "Full-time",
    },
    {
      title: "HR Manager",
      department: "Human Resources",
      location: "Remote (US)",
      type: "Full-time",
    },
    {
      title: "Financial Analyst",
      department: "Finance",
      location: "Remote (US)",
      type: "Full-time",
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "User-First Mindset",
      description: "We're dedicated to helping people achieve financial freedom through innovative solutions."
    },
    {
      icon: Users,
      title: "Collaborative Culture",
      description: "Work with passionate individuals who share your commitment to excellence."
    },
    {
      icon: Zap,
      title: "Innovation Driven",
      description: "We're constantly pushing boundaries in AI and financial technology."
    },
    {
      icon: GraduationCap,
      title: "Growth & Learning",
      description: "Continuous learning and professional development opportunities."
    },
    {
      icon: Globe,
      title: "Remote-First",
      description: "Work from anywhere while making a global impact."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Join Our Mission
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Help us revolutionize debt management and empower millions to achieve financial freedom
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
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Open Positions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {positions.map((position) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#88B04B]">{position.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-sm text-gray-300">{position.department}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-300">{position.location}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-300">{position.type}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleApply(position.title, position.department)}
                    className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white transition-colors"
                  >
                    Apply Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Benefits & Perks</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              "Competitive salary and equity",
              "Health, dental, and vision insurance",
              "Flexible vacation policy",
              "Remote work setup stipend",
              "Professional development budget",
              "401(k) matching",
              "Mental health benefits",
              "Regular team retreats"
            ].map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#88B04B]" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <p className="text-gray-300 mb-6">
            Don't see a position that matches your skills?
          </p>
          <Button
            onClick={() => handleApply("General Application", "Open Application")}
            className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
          >
            Send us your resume
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 