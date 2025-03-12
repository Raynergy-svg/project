import { motion } from 'framer-motion';
import { 
  CheckCircle, AlertTriangle, Clock, Activity, Server, Database, 
  Shield, Globe, RefreshCw, ArrowUpRight, Bell, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import Head from 'next/head';

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
      minute: '2-digit' 
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate subscription process
    setTimeout(() => {
      setSubmitStatus('success');
      setSubscribeEmail('');
    }, 1000);
  };

  // All systems working properly
  const allOperational = true;

  // Sample metrics data
  const metrics = [
    {
      label: "Uptime",
      value: "99.99%",
      description: "Last 30 days"
    },
    {
      label: "Response Time",
      value: "89ms",
      description: "Average"
    },
    {
      label: "Issues",
      value: "0",
      description: "Current"
    },
    {
      label: "API Calls",
      value: "1.2M",
      description: "Today"
    }
  ];

  // Sample systems data
  const systems = [
    {
      name: "API Services",
      description: "REST API endpoints for integrations",
      icon: Globe,
      uptime: "99.99%",
      latency: "85ms"
    },
    {
      name: "Web Application",
      description: "Frontend user interfaces",
      icon: Globe,
      uptime: "100%",
      latency: "92ms"
    },
    {
      name: "Database Servers",
      description: "Data storage and retrieval",
      icon: Database,
      uptime: "99.98%",
      latency: "78ms"
    },
    {
      name: "Authentication Services",
      description: "User login and session management",
      icon: Shield,
      uptime: "100%",
      latency: "65ms"
    }
  ];

  // Sample maintenance events
  const maintenanceEvents = [
    {
      id: "maint-001",
      title: "Database Optimization",
      description: "Scheduled maintenance to optimize database performance. Short period of read-only access expected.",
      date: "June 15, 2023",
      time: "2:00 AM - 3:30 AM EDT",
      status: "scheduled",
      impact: "Minimal - Brief read-only access"
    }
  ];

  // Sample incident data
  const incidents = [
    {
      id: "inc-002",
      title: "Elevated API Latency",
      description: "We experienced increased latency on API calls due to unexpected traffic surge.",
      date: "May 27, 2023",
      time: "3:15 PM - 4:45 PM EDT",
      status: "resolved",
      updates: [
        {
          time: "3:15 PM",
          content: "Investigating reports of increased API response times."
        },
        {
          time: "3:32 PM",
          content: "Identified cause as unexpected traffic surge. Adding additional capacity."
        },
        {
          time: "4:10 PM",
          content: "Additional servers deployed. Latency returning to normal levels."
        },
        {
          time: "4:45 PM",
          content: "Issue resolved. All systems operating normally."
        }
      ]
    }
  ];

  return (
    <Layout 
      title="System Status - Smart Debt Flow" 
      description="Check the current operational status of Smart Debt Flow services and systems."
    >
      <Head>
        <meta property="og:title" content="System Status - Smart Debt Flow" />
        <meta
          property="og:description"
          content="View real-time status of Smart Debt Flow services and systems."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartdebtflow.com/status" />
      </Head>
      
      <div className="py-12">
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  System Status
                </span>
              </h1>
            </div>
            <div className="flex items-center justify-center gap-3 text-xl mb-2">
              {allOperational ? (
                <>
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span>All Systems Operational</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <span>System Disruption Detected</span>
                </>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
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
                  className="bg-card rounded-xl border border-border p-6 flex flex-col items-center text-center shadow-sm"
                >
                  <h3 className="text-3xl font-bold text-primary mb-2">{metric.value}</h3>
                  <p className="font-medium text-sm">{metric.label}</p>
                  <p className="text-muted-foreground text-xs mt-1">{metric.description}</p>
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
              <CheckCircle className="w-5 h-5 text-primary mr-3" />
              Current Status
            </h2>
            <div className="space-y-4">
              {systems.map((system) => (
                <div
                  key={system.name}
                  className="bg-card rounded-xl border border-border p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <system.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{system.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{system.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Operational</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <span className="text-muted-foreground block text-xs mb-1">Uptime</span>
                        <span className="font-medium">{system.uptime}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground block text-xs mb-1">Latency</span>
                        <span className="font-medium">{system.latency}</span>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      className="text-primary hover:text-primary/80 p-0 h-auto text-sm"
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
                <Calendar className="w-5 h-5 text-primary mr-3" />
                Upcoming Maintenance
              </h2>
              <div className="space-y-4">
                {maintenanceEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-blue-900/10 rounded-xl border border-blue-500/30 p-6 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full uppercase">
                          {event.status}
                        </span>
                        <h3 className="text-xl font-bold mt-2">{event.title}</h3>
                      </div>
                      <div className="text-right md:text-left">
                        <p className="text-muted-foreground text-sm">{event.date}</p>
                        <p className="text-muted-foreground text-sm">{event.time}</p>
                      </div>
                    </div>
                    <p className="text-foreground mb-2">{event.description}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Expected impact: </span>
                      <span>{event.impact}</span>
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
              <Clock className="w-5 h-5 text-primary mr-3" />
              Incident History
            </h2>
            <div className="space-y-6">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-card rounded-xl border border-border p-6 shadow-sm"
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
                      <p className="text-muted-foreground text-sm">{incident.date}</p>
                      <p className="text-muted-foreground text-sm">{incident.time}</p>
                    </div>
                  </div>
                  <p className="mb-4">{incident.description}</p>
                  
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="text-sm font-bold mb-2 flex items-center">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Updates
                    </h4>
                    <div className="space-y-3">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">{update.time}</div>
                          <div className="text-sm border-l border-border pl-3">{update.content}</div>
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
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-primary/30 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Stay Informed</h2>
              </div>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Subscribe to receive notifications about system status updates and scheduled maintenance
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-card/80 border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={submitStatus === 'success'}
                >
                  {submitStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                We'll only send notifications about important system changes and incidents.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
} 