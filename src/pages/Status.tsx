import { motion } from 'framer-motion';
import { 
  CheckCircle, AlertTriangle, Clock, Activity, Server, Database, 
  Shield, Globe, RefreshCw, ArrowUpRight, Bell, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function Status() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);
  
  // Update the current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitStatus('success');
      setSubscribeEmail('');
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1000);
  };
  
  const systems = [
    {
      name: "API Services",
      icon: Server,
      status: "operational",
      uptime: "100%",
      latency: "45ms",
      description: "Core API endpoints and services"
    },
    {
      name: "Web Application",
      icon: Globe,
      status: "operational",
      uptime: "100%",
      latency: "89ms",
      description: "User interface and frontend functionality"
    },
    {
      name: "Database",
      icon: Database,
      status: "operational",
      uptime: "100%",
      latency: "12ms",
      description: "Data storage and retrieval systems"
    },
    {
      name: "Authentication",
      icon: Shield,
      status: "operational",
      uptime: "100%",
      latency: "65ms",
      description: "Login, registration, and security services"
    },
    {
      name: "AI Analysis Engine",
      icon: Activity,
      status: "operational",
      uptime: "100%",
      latency: "110ms",
      description: "Debt optimization and financial analysis"
    }
  ];

  const allOperational = systems.every(system => system.status === "operational");

  const maintenanceEvents = [
    {
      id: "m-001",
      title: "Scheduled Database Optimization",
      date: "April 22, 2025",
      time: "01:00 - 03:00 AM EDT",
      status: "scheduled",
      impact: "minimal",
      description: "Routine database maintenance to optimize performance. Brief periods of increased response times may occur."
    }
  ];

  const incidents = [
    {
      id: "inc-001",
      date: "February 10, 2025",
      title: "API Performance Degradation",
      status: "resolved",
      duration: "23 minutes",
      time: "3:45 PM - 4:08 PM EDT",
      description: "Temporary increase in API response times due to network routing issue. Services continued to function with increased latency.",
      updates: [
        {
          time: "4:08 PM EDT",
          content: "Issue resolved. All systems operating normally."
        },
        {
          time: "3:55 PM EDT",
          content: "Identified network routing issue and implementing fix."
        },
        {
          time: "3:45 PM EDT",
          content: "Investigating reports of increased API response times."
        }
      ]
    },
    {
      id: "inc-002",
      date: "January 28, 2025",
      title: "Scheduled Maintenance",
      status: "completed",
      duration: "45 minutes",
      time: "2:00 AM - 2:45 AM EDT",
      description: "Planned system upgrade to improve platform performance. Completed ahead of schedule with no issues.",
      updates: [
        {
          time: "2:45 AM EDT",
          content: "Maintenance completed successfully. All systems operating normally."
        },
        {
          time: "2:00 AM EDT",
          content: "Beginning scheduled maintenance."
        }
      ]
    },
    {
      id: "inc-003",
      date: "January 15, 2025",
      title: "Authentication Service Latency",
      status: "resolved",
      duration: "15 minutes",
      time: "11:30 AM - 11:45 AM EDT",
      description: "Brief authentication delays during peak usage period. Issue resolved with no data loss or security concerns.",
      updates: [
        {
          time: "11:45 AM EDT",
          content: "Issue resolved. Authentication services operating normally."
        },
        {
          time: "11:35 AM EDT",
          content: "Identified capacity issue and adding resources."
        },
        {
          time: "11:30 AM EDT",
          content: "Investigating reports of authentication delays."
        }
      ]
    }
  ];

  const metrics = [
    {
      label: "30-Day Uptime",
      value: "99.98%",
      description: "Average uptime across all services"
    },
    {
      label: "Response Time",
      value: "64ms",
      description: "Average API response time"
    },
    {
      label: "Daily API Requests",
      value: "2.8M",
      description: "Average daily API call volume"
    },
    {
      label: "Incident-Free Days",
      value: "27",
      description: "Days since last incident"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-8 h-8 text-[#88B04B]" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                System Status
              </span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3 text-xl mb-2">
            {allOperational ? (
              <>
                <CheckCircle className="w-6 h-6 text-[#88B04B]" />
                <span>All Systems Operational</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <span>System Disruption Detected</span>
              </>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            Last updated: {formatDate(currentTime)} at {formatTime(currentTime)}
          </p>
        </motion.div>

        {/* Metrics Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col items-center text-center"
              >
                <h3 className="text-3xl font-bold text-[#88B04B] mb-2">{metric.value}</h3>
                <p className="text-gray-200 font-medium text-sm">{metric.label}</p>
                <p className="text-gray-400 text-xs mt-1">{metric.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Current Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-[#88B04B] mr-3" />
            Current Status
          </h2>
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
                      <p className="text-sm text-gray-400 mt-1">{system.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#88B04B]/10 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-[#88B04B]" />
                    <span className="text-sm font-medium text-[#88B04B]">Operational</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="text-sm">
                      <span className="text-gray-400 block text-xs mb-1">Uptime</span>
                      <span className="font-medium">{system.uptime}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400 block text-xs mb-1">Latency</span>
                      <span className="font-medium">{system.latency}</span>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="text-[#88B04B] hover:text-[#7a9d43] p-0 h-auto text-sm"
                  >
                    View History
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Upcoming Maintenance */}
        {maintenanceEvents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="w-5 h-5 text-[#88B04B] mr-3" />
              Upcoming Maintenance
            </h2>
            <div className="space-y-4">
              {maintenanceEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-blue-900/20 rounded-xl border border-blue-500/30 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full uppercase">
                        {event.status}
                      </span>
                      <h3 className="text-xl font-bold mt-2">{event.title}</h3>
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-gray-300 text-sm">{event.date}</p>
                      <p className="text-gray-300 text-sm">{event.time}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{event.description}</p>
                  <p className="text-sm">
                    <span className="text-gray-400">Expected impact: </span>
                    <span className="text-gray-300">{event.impact}</span>
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Incident History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Clock className="w-5 h-5 text-[#88B04B] mr-3" />
            Incident History
          </h2>
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white/5 rounded-xl border border-white/10 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full uppercase ${
                      incident.status === 'resolved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {incident.status}
                    </span>
                    <h3 className="text-xl font-bold mt-2">{incident.title}</h3>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-gray-300 text-sm">{incident.date}</p>
                    <p className="text-gray-300 text-sm">{incident.time}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{incident.description}</p>
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-sm font-bold mb-2 flex items-center">
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Updates
                  </h4>
                  <div className="space-y-3">
                    {incident.updates.map((update, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="text-xs text-gray-400 whitespace-nowrap pt-1">{update.time}</div>
                        <div className="text-sm text-gray-300 border-l border-white/10 pl-3">{update.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Subscribe to Updates */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-[#88B04B]" />
              <h2 className="text-2xl font-bold">Stay Informed</h2>
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl">
              Subscribe to receive notifications about system status updates and scheduled maintenance
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#88B04B]/50"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-[#88B04B] hover:bg-[#7a9d43] text-white"
                disabled={submitStatus === 'success'}
              >
                {submitStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              We'll only send notifications about important system changes and incidents.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 