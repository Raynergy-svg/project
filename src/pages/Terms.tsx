import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, HelpCircle } from 'lucide-react';

export default function Terms() {
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
              Terms of Service
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using our services
          </p>
        </motion.div>

        {/* Important Notices */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: "Security",
              description: "We implement strict security measures to protect your data and financial information."
            },
            {
              icon: AlertCircle,
              title: "Responsibility",
              description: "Users are responsible for maintaining the confidentiality of their account credentials."
            },
            {
              icon: FileText,
              title: "Usage",
              description: "Our services must be used in accordance with applicable laws and regulations."
            },
            {
              icon: HelpCircle,
              title: "Support",
              description: "We provide customer support to help resolve any issues with our services."
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

        {/* Terms Sections */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">1. Account Terms</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• You must be 18 years or older to use our services</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• Accurate and complete information must be provided</li>
                <li>• One person may not create multiple accounts</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">2. Service Usage</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• Services must be used for lawful purposes only</li>
                <li>• No unauthorized access or interference with our systems</li>
                <li>• Respect the privacy and rights of other users</li>
                <li>• Follow all applicable laws and regulations</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">3. Payment Terms</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• Free trial period is available for new users</li>
                <li>• Subscription fees are billed in advance</li>
                <li>• Refunds are provided according to our refund policy</li>
                <li>• Price changes will be notified in advance</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">4. Termination</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-3 text-gray-300">
                <li>• Users may cancel their subscription at any time</li>
                <li>• We may terminate accounts for policy violations</li>
                <li>• Data retention after termination follows our privacy policy</li>
                <li>• Refunds for termination follow our refund policy</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                For any questions about these terms, please contact our support team at 
                support@smartdebtflow.com
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