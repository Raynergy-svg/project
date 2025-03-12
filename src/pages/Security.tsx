import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, Eye, Server, Key, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import Head from 'next/head';

export default function Security() {
  return (
    <Layout 
      title="Security - Smart Debt Flow" 
      description="Learn about how Smart Debt Flow protects your financial data and personal information."
    >
      <Head>
        <meta property="og:title" content="Security - Smart Debt Flow" />
        <meta
          property="og:description"
          content="Learn about our security practices and how we protect your financial data."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/security" />
      </Head>
      <div className="container mx-auto px-4 py-12 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Security Measures
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            How we protect your financial data and personal information
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: Lock,
              title: "Encryption",
              description: "AES-256 encryption for all sensitive data"
            },
            {
              icon: Shield,
              title: "Compliance",
              description: "SOC2 Type II certified security controls"
            },
            {
              icon: RefreshCcw,
              title: "Real-time Monitoring",
              description: "24/7 security monitoring and threat detection"
            },
            {
              icon: Key,
              title: "Access Control",
              description: "Multi-factor authentication and role-based access"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#88B04B]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Security Sections */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Server className="w-6 h-6 text-[#88B04B]" />
              Data Storage Security
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <span>All data is stored in secure, SOC2 certified data centers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <span>End-to-end encryption for all sensitive financial data</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCcw className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <span>Regular security audits and penetration testing</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-[#88B04B]" />
              Access Control
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <span>Multi-factor authentication for all accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <span>Role-based access control for internal systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <span>Automated suspicious activity detection</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#88B04B]" />
              Compliance & Certifications
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#88B04B]">Security Standards</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• SOC2 Type II Certified</li>
                    <li>• ISO 27001 Compliant</li>
                    <li>• PCI DSS Compliant</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#88B04B]">Regular Audits</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Quarterly Security Assessments</li>
                    <li>• Annual Penetration Testing</li>
                    <li>• Continuous Monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Report a Security Issue</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                If you believe you've found a security vulnerability, please report it to our security team:
              </p>
              <a
                href="mailto:support@smartdebtflow.com"
                className="text-[#88B04B] hover:text-[#7a9d43] transition-colors"
              >
                support@smartdebtflow.com
              </a>
            </div>
          </motion.section>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#88B04B]/10 px-4 py-2 rounded-full">
            <Shield className="w-5 h-5 text-[#88B04B]" />
            <span className="text-[#88B04B]">SOC2 Type II Certified</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 