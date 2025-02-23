import { motion } from 'framer-motion';
import { Shield, Users, Target, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              About Smart Debt Flow
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            We're on a mission to help millions achieve financial freedom through intelligent debt management
          </p>
        </motion.div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 p-8 rounded-xl border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-300">
              Smart Debt Flow was founded with a clear purpose: to revolutionize how people manage and eliminate debt. 
              We combine cutting-edge AI technology with proven financial strategies to create personalized paths to 
              financial freedom.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 p-8 rounded-xl border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#88B04B]" />
                <span>Trust & Security First</span>
              </li>
              <li className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#88B04B]" />
                <span>User-Centered Innovation</span>
              </li>
              <li className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#88B04B]" />
                <span>Results-Driven Approach</span>
              </li>
              <li className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#88B04B]" />
                <span>Excellence in Service</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-12">Our Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "CEO & Founder",
                bio: "Former fintech executive with 15 years of experience in debt management solutions."
              },
              {
                name: "Michael Rodriguez",
                role: "CTO",
                bio: "AI/ML expert with a background in building secure financial platforms."
              },
              {
                name: "Emily Thompson",
                role: "Head of Customer Success",
                bio: "Certified financial advisor focused on helping users achieve their goals."
              }
            ].map((member) => (
              <div key={member.name} className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="w-20 h-20 rounded-full bg-[#88B04B]/20 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-[#88B04B] text-xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-[#88B04B] mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { label: "Active Users", value: "50k+" },
            { label: "Debt Eliminated", value: "$2M+" },
            { label: "Average Savings", value: "35%" },
            { label: "User Rating", value: "4.9/5" }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10 text-center"
            >
              <h3 className="text-3xl font-bold text-[#88B04B] mb-2">{stat.value}</h3>
              <p className="text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 