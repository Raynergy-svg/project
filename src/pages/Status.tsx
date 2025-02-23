import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, Activity, Server, Database, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Status() {
  const systems = [
    {
      name: "API",
      icon: Server,
      status: "operational",
      uptime: "99.99%",
      latency: "45ms"
    },
    {
      name: "Web App",
      icon: Globe,
      status: "operational",
      uptime: "99.98%",
      latency: "89ms"
    },
    {
      name: "Database",
      icon: Database,
      status: "operational",
      uptime: "99.99%",
      latency: "12ms"
    },
    {
      name: "Authentication",
      icon: Shield,
      status: "operational",
      uptime: "100%",
      latency: "65ms"
    }
  ];

  const incidents = [
    {
      date: "October 15, 2023",
      title: "API Performance Degradation",
      status: "resolved",
      duration: "23 minutes",
      description: "Temporary increase in API response times due to database optimization."
    },
    {
      date: "September 28, 2023",
      title: "Scheduled Maintenance",
      status: "completed",
      duration: "45 minutes",
      description: "Planned system upgrade to improve platform performance."
    },
    {
      date: "September 10, 2023",
      title: "Authentication Service Latency",
      status: "resolved",
      duration: "15 minutes",
      description: "Brief authentication delays during peak usage period."
    }
  ];

  const metrics = [
    {
      label: "30-Day Uptime",
      value: "99.99%"
    },
    {
      label: "Response Time",
      value: "45ms"
    },
    {
      label: "API Requests",
      value: "2.5M/day"
    },
    {
      label: "Active Users",
      value: "50k+"
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
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="w-8 h-8 text-[#88B04B]" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                System Status
              </span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3 text-xl">
            <CheckCircle className="w-6 h-6 text-[#88B04B]" />
            <span>All Systems Operational</span>
          </div>
        </motion.div>

        {/* Metrics Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white/5 rounded-xl border border-white/10 p-6 text-center"
              >
                <h3 className="text-3xl font-bold text-[#88B04B] mb-2">{metric.value}</h3>
                <p className="text-gray-300">{metric.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* System Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8">System Components</h2>
          <div className="space-y-4">
            {systems.map((system) => (
              <div
                key={system.name}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center">
                      <system.icon className="w-6 h-6 text-[#88B04B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{system.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-[#88B04B]" />
                        <span className="text-sm text-gray-300">Operational</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">Uptime</div>
                    <div className="font-bold text-[#88B04B]">{system.uptime}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Average Latency</span>
                    <span>{system.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Incident History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-8">Incident History</h2>
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div
                key={incident.title}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-bold">{incident.title}</h3>
                    </div>
                    <p className="text-gray-300">{incident.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">{incident.date}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{incident.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Subscribe to Updates */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Informed</h2>
            <p className="text-gray-300 mb-6">
              Subscribe to receive notifications about system status and incidents
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
              />
              <Button
                className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 