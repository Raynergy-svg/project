import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

export default function Privacy() {
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
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Your privacy and data security are our top priorities
          </p>
        </motion.div>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: "Data Protection",
              description: "We employ industry-leading security measures to protect your personal and financial information."
            },
            {
              icon: Lock,
              title: "Secure Storage",
              description: "All sensitive data is encrypted using AES-256 encryption and stored in secure, certified facilities."
            },
            {
              icon: Eye,
              title: "Data Privacy",
              description: "We never sell your personal information to third parties or use it for marketing purposes."
            },
            {
              icon: FileCheck,
              title: "Compliance",
              description: "We comply with all relevant data protection regulations and regularly audit our security measures."
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• Basic account information (name, email)</li>
                <li>• Financial information for debt analysis</li>
                <li>• Bank account connection data (read-only access)</li>
                <li>• Usage data to improve our services</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• Providing personalized debt management strategies</li>
                <li>• Analyzing your financial situation</li>
                <li>• Improving our AI algorithms</li>
                <li>• Ensuring platform security</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• Access your personal data</li>
                <li>• Request data deletion</li>
                <li>• Opt out of data collection</li>
                <li>• Export your data</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                If you have any questions about our privacy policy or how we handle your data, 
                please contact our Data Protection Officer at privacy@smartdebtflow.com
              </p>
            </div>
          </motion.section>
        </div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-16 text-gray-400"
        >
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </motion.div>
      </div>
    </div>
  );
} 