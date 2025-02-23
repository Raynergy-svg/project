import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function Compliance() {
  const certifications = [
    {
      title: "SOC 2 Type II",
      description: "Annual independent audit verifying our security controls",
      validUntil: "December 2024"
    },
    {
      title: "ISO 27001",
      description: "Information security management system certification",
      validUntil: "November 2024"
    },
    {
      title: "GDPR Compliant",
      description: "Full compliance with EU data protection regulations",
      validUntil: "Ongoing"
    },
    {
      title: "PCI DSS",
      description: "Payment Card Industry Data Security Standard compliance",
      validUntil: "September 2024"
    }
  ];

  const securityMeasures = [
    {
      title: "Data Encryption",
      measures: [
        "AES-256 encryption for data at rest",
        "TLS 1.3 for data in transit",
        "End-to-end encryption for sensitive data"
      ]
    },
    {
      title: "Infrastructure Security",
      measures: [
        "Regular penetration testing",
        "24/7 security monitoring",
        "Automated vulnerability scanning"
      ]
    },
    {
      title: "Access Control",
      measures: [
        "Multi-factor authentication",
        "Role-based access control",
        "Regular access reviews"
      ]
    }
  ];

  const complianceUpdates = [
    {
      date: "March 2024",
      title: "Annual SOC 2 Audit",
      status: "Completed",
      description: "Successfully completed annual SOC 2 Type II audit with zero findings"
    },
    {
      date: "February 2024",
      title: "GDPR Assessment",
      status: "Completed",
      description: "External assessment confirmed full GDPR compliance"
    },
    {
      date: "January 2024",
      title: "Security Controls Update",
      status: "Completed",
      description: "Implemented enhanced security controls and monitoring"
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
              Security & Compliance
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Our commitment to protecting your data through industry-leading security standards
          </p>
        </motion.div>

        {/* Certifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8">Security Certifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.title}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <Shield className="w-8 h-8 text-[#88B04B] mb-4" />
                <h3 className="text-lg font-bold mb-2">{cert.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{cert.description}</p>
                <div className="flex items-center gap-2 text-sm text-[#88B04B]">
                  <Clock className="w-4 h-4" />
                  <span>Valid until: {cert.validUntil}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Security Measures */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8">Security Measures</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {securityMeasures.map((measure) => (
              <div
                key={measure.title}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <Lock className="w-8 h-8 text-[#88B04B] mb-4" />
                <h3 className="text-lg font-bold mb-4">{measure.title}</h3>
                <ul className="space-y-3">
                  {measure.measures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Recent Updates */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-8">Recent Compliance Updates</h2>
          <div className="space-y-6">
            {complianceUpdates.map((update) => (
              <div
                key={update.title}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-[#88B04B]" />
                    <div>
                      <h3 className="font-bold">{update.title}</h3>
                      <span className="text-sm text-gray-400">{update.date}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {update.status}
                  </span>
                </div>
                <p className="text-gray-300">{update.description}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
} 