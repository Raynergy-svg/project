import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, CheckCircle, Clock, Globe, Server, ClipboardList, HelpCircle, Book, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import Head from 'next/head';

export default function Compliance() {
  const certifications = [
    {
      title: "SOC 2 Type II",
      description: "Annual independent audit verifying our security controls",
      validUntil: "December 2025"
    },
    {
      title: "ISO 27001",
      description: "Information security management system certification",
      validUntil: "November 2025"
    },
    {
      title: "GDPR Compliant",
      description: "Full compliance with EU data protection regulations",
      validUntil: "Ongoing"
    },
    {
      title: "PCI DSS",
      description: "Payment Card Industry Data Security Standard compliance",
      validUntil: "September 2025"
    },
    {
      title: "CCPA Compliant",
      description: "California Consumer Privacy Act compliance",
      validUntil: "Ongoing"
    },
    {
      title: "HIPAA Compliant",
      description: "Health Insurance Portability and Accountability Act compliance",
      validUntil: "Ongoing"
    },
    {
      title: "ISO 27018",
      description: "Protection of personally identifiable information (PII) in public clouds",
      validUntil: "October 2025"
    },
    {
      title: "NIST CSF",
      description: "National Institute of Standards and Technology Cybersecurity Framework",
      validUntil: "Ongoing"
    }
  ];

  const securityMeasures = [
    {
      title: "Data Encryption",
      measures: [
        "AES-256 encryption for data at rest",
        "TLS 1.3 for data in transit",
        "End-to-end encryption for sensitive data",
        "Zero-knowledge encryption for financial data",
        "Quantum-resistant encryption protocols"
      ]
    },
    {
      title: "Infrastructure Security",
      measures: [
        "Regular penetration testing",
        "24/7 security monitoring",
        "Automated vulnerability scanning",
        "Cloud security posture management",
        "Web application firewalls (WAF)",
        "DDoS protection systems"
      ]
    },
    {
      title: "Access Control",
      measures: [
        "Multi-factor authentication",
        "Role-based access control",
        "Regular access reviews",
        "Just-in-time access provisioning",
        "Principle of least privilege enforcement",
        "Biometric authentication for critical systems"
      ]
    }
  ];

  const complianceUpdates = [
    {
      date: "November 2024",
      title: "Zero Trust Architecture Implementation",
      status: "Completed",
      description: "Implemented comprehensive zero trust architecture across all systems"
    },
    {
      date: "September 2024",
      title: "CCPA Compliance Verification",
      status: "Completed",
      description: "Completed third-party assessment confirming full CCPA compliance"
    },
    {
      date: "July 2024",
      title: "Enhanced Data Privacy Controls",
      status: "Completed",
      description: "Implemented advanced data privacy controls exceeding regulatory requirements"
    },
    {
      date: "May 2024",
      title: "Annual SOC 2 Audit",
      status: "Completed",
      description: "Successfully completed annual SOC 2 Type II audit with zero findings"
    }
  ];

  const dataPrivacyPolicies = [
    {
      title: "Data Collection Limitations",
      description: "We only collect data that is necessary for providing our services. All data collection processes are transparently disclosed and require explicit user consent."
    },
    {
      title: "Data Retention Policies",
      description: "Financial data is retained only for the minimum period required by law. Users can request data deletion at any time through our self-service portal."
    },
    {
      title: "Third-Party Data Sharing",
      description: "We maintain strict controls over third-party data sharing. All partners must meet our rigorous security requirements and are regularly audited."
    },
    {
      title: "Data Subject Rights",
      description: "We fully support data subject rights including the right to access, correct, delete, and export personal data in compliance with global privacy regulations."
    },
    {
      title: "Breach Notification Protocol",
      description: "Our incident response team is prepared to notify affected users and relevant authorities within 72 hours of a confirmed data breach."
    }
  ];

  const internationalStandards = [
    {
      region: "Europe",
      standards: [
        "GDPR (General Data Protection Regulation)",
        "ePrivacy Directive",
        "NIS2 Directive"
      ]
    },
    {
      region: "North America",
      standards: [
        "CCPA (California)",
        "CPRA (California)",
        "PIPEDA (Canada)",
        "HIPAA (Healthcare)",
        "GLBA (Financial)"
      ]
    },
    {
      region: "Asia-Pacific",
      standards: [
        "PDPA (Singapore)",
        "APPI (Japan)",
        "Privacy Act (Australia)",
        "PDPA (Thailand)"
      ]
    }
  ];

  const auditProcess = [
    {
      stage: "Preparation",
      activities: [
        "Scope definition and planning",
        "Control identification and documentation",
        "Pre-audit readiness assessment"
      ]
    },
    {
      stage: "Assessment",
      activities: [
        "Independent auditor engagement",
        "Control testing and evidence collection",
        "Compliance gap analysis"
      ]
    },
    {
      stage: "Remediation",
      activities: [
        "Addressing identified gaps",
        "Implementing enhanced controls",
        "Control validation"
      ]
    },
    {
      stage: "Certification",
      activities: [
        "Final auditor review",
        "Certification issuance",
        "Public attestation"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do you protect my financial data?",
      answer: "We implement bank-level security measures including AES-256 encryption, multi-factor authentication, and zero-knowledge architecture to ensure your financial data remains secure and private."
    },
    {
      question: "Can I request deletion of my data?",
      answer: "Yes, you can request complete deletion of your data at any time through your account settings or by contacting our support team. We will process your request within 30 days as required by applicable regulations."
    },
    {
      question: "How often do you conduct security audits?",
      answer: "We conduct internal security audits quarterly and undergo independent third-party security assessments annually. Penetration tests are performed bi-annually by certified security professionals."
    },
    {
      question: "Do you share my data with third parties?",
      answer: "We only share your data with third parties when necessary to provide our services, with your explicit consent, or when legally required. All third-party partners are thoroughly vetted and contractually bound to maintain the same level of security and privacy standards."
    },
    {
      question: "How do you handle security incidents?",
      answer: "We maintain a comprehensive incident response plan that includes immediate containment, thorough investigation, appropriate notifications, and continuous improvement based on lessons learned."
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Security & Compliance</title>
      </Head>
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

          {/* Data Privacy Policies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">Data Privacy Policies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataPrivacyPolicies.map((policy) => (
                <div
                  key={policy.title}
                  className="bg-white/5 rounded-xl border border-white/10 p-6"
                >
                  <Server className="w-8 h-8 text-[#88B04B] mb-4" />
                  <h3 className="text-lg font-bold mb-2">{policy.title}</h3>
                  <p className="text-gray-300 text-sm">{policy.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* International Compliance Standards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">International Compliance Standards</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {internationalStandards.map((region) => (
                <div
                  key={region.region}
                  className="bg-white/5 rounded-xl border border-white/10 p-6"
                >
                  <Globe className="w-8 h-8 text-[#88B04B] mb-4" />
                  <h3 className="text-lg font-bold mb-4">{region.region}</h3>
                  <ul className="space-y-3">
                    {region.standards.map((standard) => (
                      <li key={standard} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                        <span>{standard}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Compliance Auditing Process */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">Compliance Auditing Process</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {auditProcess.map((stage) => (
                <div
                  key={stage.stage}
                  className="bg-white/5 rounded-xl border border-white/10 p-6"
                >
                  <ClipboardList className="w-8 h-8 text-[#88B04B] mb-4" />
                  <h3 className="text-lg font-bold mb-4">{stage.stage}</h3>
                  <ul className="space-y-3">
                    {stage.activities.map((activity) => (
                      <li key={activity} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
                        <span>{activity}</span>
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
            className="mb-16"
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

          {/* FAQs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl border border-white/10 p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <HelpCircle className="w-6 h-6 text-[#88B04B] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-lg">{faq.question}</h3>
                  </div>
                  <p className="text-gray-300 pl-9">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Compliance Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
              <Users className="w-12 h-12 text-[#88B04B] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Have Compliance Questions?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Our dedicated compliance and data protection team is available to address any questions or concerns you may have about our security practices or regulatory compliance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href="/support?department=compliance" 
                  className="inline-block px-6 py-3 bg-[#88B04B] text-white font-medium rounded-lg hover:bg-[#6A9A2D] transition-colors"
                >
                  Contact Compliance Team
                </a>
                <a 
                  href="tel:+18005551212" 
                  className="inline-block px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  Call Compliance Hotline
                </a>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
} 