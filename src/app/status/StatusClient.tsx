"use client";

import { motion } from 'framer-motion';
import { 
  CheckCircle, AlertTriangle, Clock, Activity, Server, Database, 
  Shield, Globe, RefreshCw, ArrowUpRight, Bell, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function StatusClient() {
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-card rounded-lg p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
                <span className="text-xs text-muted-foreground/70">{metric.description}</span>
              </div>
              <p className="text-4xl font-bold tracking-tight mb-1">{metric.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Systems Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Systems Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((system, index) => {
              const Icon = system.icon;
              return (
                <div 
                  key={index} 
                  className="flex p-4 bg-card rounded-lg border border-border/50 shadow-sm"
                >
                  <div className="mr-4 flex items-center justify-center bg-primary/10 rounded-full p-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium">{system.name}</h3>
                      <span className="text-primary font-medium">Operational</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{system.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span>Uptime: {system.uptime}</span>
                      <span>Latency: {system.latency}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Scheduled Maintenance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Scheduled Maintenance</h2>
          </div>
          
          {maintenanceEvents.length > 0 ? (
            <div className="space-y-4">
              {maintenanceEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-sm mb-3">{event.description}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {event.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border border-border bg-card/50 rounded-lg">
              <p className="text-muted-foreground">No scheduled maintenance at this time</p>
            </div>
          )}
        </motion.div>

        {/* Recent Incidents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Recent Incidents</h2>
          </div>
          
          {incidents.length > 0 ? (
            <div className="space-y-6">
              {incidents.map((incident) => (
                <div 
                  key={incident.id} 
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{incident.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                      Resolved
                    </span>
                  </div>
                  <p className="text-sm mb-3">{incident.description}</p>
                  <div className="flex gap-4 text-xs mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {incident.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {incident.time}
                    </span>
                  </div>
                  
                  <div className="relative border-l border-border pl-4 ml-1 space-y-4">
                    {incident.updates.map((update, index) => (
                      <div key={index} className="relative pb-4">
                        <div className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-primary" />
                        <p className="text-xs font-medium mb-1">{update.time}</p>
                        <p className="text-sm">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border border-border bg-card/50 rounded-lg">
              <p className="text-muted-foreground">No incidents reported in the last 90 days</p>
            </div>
          )}
        </motion.div>

        {/* Subscribe to Updates */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Subscribe to Status Updates</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Get notified when we're experiencing issues or during scheduled maintenance.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex gap-2 mx-auto max-w-md">
            <input
              type="email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <Button type="submit" disabled={submitStatus === 'success'}>
              {submitStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
          
          {submitStatus === 'success' && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-primary"
            >
              You've been successfully subscribed to status updates!
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
