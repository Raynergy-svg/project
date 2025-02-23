import { motion } from 'framer-motion';
import { Download, Mail, Phone, FileText, Image, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Press() {
  const pressReleases = [
    {
      date: "October 20, 2023",
      title: "Smart Debt Flow Launches Revolutionary AI-Powered Debt Management Platform",
      excerpt: "Smart Debt Flow introduces groundbreaking artificial intelligence technology to help users manage and eliminate debt more effectively.",
      link: "#"
    },
    {
      date: "September 15, 2023",
      title: "Smart Debt Flow Secures $10M Series A Funding",
      excerpt: "Leading fintech investors back Smart Debt Flow's mission to revolutionize personal debt management through AI technology.",
      link: "#"
    },
    {
      date: "August 1, 2023",
      title: "Smart Debt Flow Reaches 50,000 Active Users Milestone",
      excerpt: "Rapid growth demonstrates strong market demand for AI-powered debt management solutions.",
      link: "#"
    }
  ];

  const mediaResources = [
    {
      title: "Brand Assets",
      description: "Download our logo, brand guidelines, and visual assets",
      icon: Image,
      link: "#"
    },
    {
      title: "Press Kit",
      description: "Access our comprehensive press kit with company information",
      icon: FileText,
      link: "#"
    },
    {
      title: "Awards & Recognition",
      description: "View our industry awards and achievements",
      icon: Award,
      link: "#"
    }
  ];

  const companyStats = [
    {
      label: "Active Users",
      value: "50,000+"
    },
    {
      label: "Debt Managed",
      value: "$100M+"
    },
    {
      label: "Success Rate",
      value: "92%"
    },
    {
      label: "Team Size",
      value: "50+"
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
              Press & Media
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Latest news, press releases, and media resources from Smart Debt Flow
          </p>
        </motion.div>

        {/* Company Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companyStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 rounded-xl border border-white/10 p-6 text-center"
              >
                <h3 className="text-3xl font-bold text-[#88B04B] mb-2">{stat.value}</h3>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Press Releases */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">Latest Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <motion.article
                key={release.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-[#88B04B]/30 transition-colors"
              >
                <span className="text-sm text-[#88B04B] mb-2 block">{release.date}</span>
                <h3 className="text-xl font-bold mb-3">{release.title}</h3>
                <p className="text-gray-300 mb-4">{release.excerpt}</p>
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                >
                  Read More
                  <FileText className="w-4 h-4 ml-2" />
                </Button>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Media Resources */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">Media Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mediaResources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-[#88B04B]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                  <resource.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                <p className="text-gray-300 mb-4">{resource.description}</p>
                <Button
                  variant="outline"
                  className="w-full border-white/10 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Press Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8">
            <h2 className="text-2xl font-bold mb-6">Press Contact</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#88B04B]" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:press@smartdebtflow.com" className="text-[#88B04B] hover:text-[#88B04B]/80">
                      press@smartdebtflow.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#88B04B]" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+1-555-0123" className="text-[#88B04B] hover:text-[#88B04B]/80">
                      +1 (555) 0123
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-300">
                  For press inquiries, please contact our media relations team. We aim to respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 