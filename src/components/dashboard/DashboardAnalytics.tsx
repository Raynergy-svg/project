import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Activity, Award, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// Types for analytics data
interface FeatureUsage {
  name: string;
  count: number;
  lastUsed: Date;
}

interface AnalyticsData {
  sessionDuration: number;
  featuresUsed: FeatureUsage[];
  engagementScore: number;
  lastSession?: Date;
  totalSessions: number;
}

// Mock data for demonstration
const mockAnalyticsData: AnalyticsData = {
  sessionDuration: 25 * 60, // 25 minutes in seconds
  featuresUsed: [
    { name: 'Debt Payoff Calculator', count: 8, lastUsed: new Date() },
    { name: 'Budget Analysis', count: 5, lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { name: 'Savings Goals', count: 3, lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { name: 'Expense Tracking', count: 7, lastUsed: new Date(Date.now() - 12 * 60 * 60 * 1000) },
  ],
  engagementScore: 78,
  lastSession: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  totalSessions: 12,
};

// Format seconds to minutes and hours
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${seconds % 60}s`;
};

// Format date to relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

interface DashboardAnalyticsProps {
  className?: string;
  // In a real implementation, you might pass real analytics data here
  // analyticsData?: AnalyticsData;
}

export default function DashboardAnalytics({ className = '' }: DashboardAnalyticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  
  // In a real app, you would fetch actual analytics data
  useEffect(() => {
    // This would be replaced with actual data fetching
    const fetchAnalyticsData = async () => {
      // Simulate data fetching delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalyticsData(mockAnalyticsData);
    };
    
    fetchAnalyticsData();
    
    // Track current session duration
    const intervalId = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        sessionDuration: prev.sessionDuration + 1
      }));
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Chart colors based on usage count
  const getBarColor = (count: number) => {
    if (count >= 7) return '#88B04B';
    if (count >= 4) return '#4ECDC4';
    return '#FFD166';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#2A2A2A] rounded-xl border border-white/10 p-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Activity className="mr-2 h-5 w-5 text-[#88B04B]" />
          Your Dashboard Activity
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/70 hover:text-white flex items-center text-sm"
        >
          {isExpanded ? (
            <>
              Less Detail <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              More Detail <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-4 flex flex-col">
          <span className="text-white/60 text-sm mb-1 flex items-center">
            <Clock className="mr-1 h-4 w-4 text-[#88B04B]" /> Current Session
          </span>
          <span className="text-2xl font-bold text-white">
            {formatDuration(analyticsData.sessionDuration)}
          </span>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4 flex flex-col">
          <span className="text-white/60 text-sm mb-1 flex items-center">
            <Zap className="mr-1 h-4 w-4 text-[#88B04B]" /> Features Used
          </span>
          <span className="text-2xl font-bold text-white">
            {analyticsData.featuresUsed.length}
          </span>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4 flex flex-col">
          <span className="text-white/60 text-sm mb-1 flex items-center">
            <Award className="mr-1 h-4 w-4 text-[#88B04B]" /> Engagement Score
          </span>
          <span className="text-2xl font-bold text-white">
            {analyticsData.engagementScore}/100
          </span>
        </div>
      </div>
      
      {/* Feature usage chart */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-3">Most Used Features</h3>
        <div className="bg-black/20 rounded-lg p-4" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.featuresUsed.map(f => ({ name: f.name, count: f.count }))}>
              <XAxis dataKey="name" tick={{ fill: '#ffffff80' }} />
              <YAxis tick={{ fill: '#ffffff80' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar dataKey="count" name="Usage Count">
                {analyticsData.featuresUsed.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-white/10"
          >
            <h3 className="text-lg font-medium text-white mb-3">Feature Usage Details</h3>
            <div className="bg-black/20 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/60">
                    <th className="text-left pb-2">Feature</th>
                    <th className="text-right pb-2">Usage Count</th>
                    <th className="text-right pb-2">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.featuresUsed.map((feature, index) => (
                    <tr key={index} className="border-t border-white/5 text-white">
                      <td className="py-2">{feature.name}</td>
                      <td className="py-2 text-right">{feature.count}</td>
                      <td className="py-2 text-right">{formatRelativeTime(feature.lastUsed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-4 w-4 text-[#88B04B]" /> Ways to improve your experience
              </h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#88B04B]/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#88B04B]"></div>
                  </div>
                  <span>Try our Budget Analyzer for a comprehensive view of your spending patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#88B04B]/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#88B04B]"></div>
                  </div>
                  <span>Set up AI-powered alerts for unusual spending activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#88B04B]/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#88B04B]"></div>
                  </div>
                  <span>Connect more accounts to get a complete financial picture</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 