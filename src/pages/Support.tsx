import { motion } from 'framer-motion';
import { HeadphonesIcon, HelpCircle, MessageCircle, Clock, FileQuestion, Mail, Shield, MessageSquare, ChevronRight, BookOpen, Ticket, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChat from '@/components/chat/AIChat';
import { useEffect } from 'react';
import { Link } from '@/empty-module';

export default function Support() {
  // Keep session active while on support page
  useEffect(() => {
    // Create a function to refresh the session activity
    const keepSessionActive = () => {
      // Dispatch a custom event that will be caught by the activity tracker
      window.dispatchEvent(new Event('activity'));
      
      // Also store a timestamp in sessionStorage as a backup mechanism
      sessionStorage.setItem('lastSupportActivity', Date.now().toString());
    };
    
    // Run immediately and then every 2 minutes
    keepSessionActive();
    const interval = setInterval(keepSessionActive, 2 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  // Handle the opening of the chat bubble
  const handleOpenChat = () => {
    document.getElementById('aiChatToggle')?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm shadow-xl">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Support Center</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* DebtFlow Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#88B04B] to-[#6A8F3D] rounded-lg shadow-xl mb-8 overflow-hidden"
        >
          <div className="md:flex items-center">
            <div className="md:w-3/5 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Meet Your DebtFlow Assistant
              </h2>
              <p className="text-white/90 mb-6 text-lg">
                Our AI-powered DebtFlow Assistant can help with debt strategies, payment questions, 
                account management, and technical support. Get instant answers 24/7, create support tickets, 
                and access personalized debt management guidance.
              </p>
              <button 
                onClick={handleOpenChat}
                className="bg-white text-[#88B04B] hover:bg-green-50 font-medium px-6 py-3 rounded-lg shadow transition duration-150 flex items-center"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with DebtFlow Assistant
              </button>
            </div>
            <div className="hidden md:flex md:w-2/5 justify-center items-center">
              <div className="p-8 text-center">
                <Bot className="h-40 w-40 text-white mx-auto mb-4" />
                <p className="text-white text-sm">AI-powered assistant</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Support Options */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
            className="bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <MessageSquare className="h-8 w-8 text-[#88B04B] mr-3" />
              <h3 className="text-xl font-semibold text-white">Live Chat</h3>
            </div>
            <p className="text-white/70 mb-4">
              Chat with our support team in real-time. We're available Monday to Friday, 9am to 5pm ET.
            </p>
            <button 
              onClick={handleOpenChat}
              className="inline-flex items-center text-[#88B04B] hover:text-[#A6C76F]"
            >
              Start a chat <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
            className="bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 text-[#88B04B] mr-3" />
              <h3 className="text-xl font-semibold text-white">Email Support</h3>
            </div>
            <p className="text-white/70 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@debtflow.com" 
              className="inline-flex items-center text-[#88B04B] hover:text-[#A6C76F]"
            >
              support@debtflow.com <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
            className="bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <HelpCircle className="h-8 w-8 text-[#88B04B] mr-3" />
              <h3 className="text-xl font-semibold text-white">Help Center</h3>
            </div>
            <p className="text-white/70 mb-4">
              Browse our knowledge base for tutorials, guides, and answers to common questions.
            </p>
            <Link 
              to="/support/help-center" 
              className="inline-flex items-center text-[#88B04B] hover:text-[#A6C76F]"
            >
              Visit Help Center <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
            className="bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Ticket className="h-8 w-8 text-[#88B04B] mr-3" />
              <h3 className="text-xl font-semibold text-white">Support Tickets</h3>
            </div>
            <p className="text-white/70 mb-4">
              Create and track support tickets for issues that require more detailed attention.
            </p>
            <Link 
              to="/support/tickets" 
              className="inline-flex items-center text-[#88B04B] hover:text-[#A6C76F]"
            >
              My Support Tickets <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
            className="bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-[#88B04B] mr-3" />
              <h3 className="text-xl font-semibold text-white">Debt Resources</h3>
            </div>
            <p className="text-white/70 mb-4">
              Access guides, calculators, and resources to help manage and reduce your debt effectively.
            </p>
            <Link 
              to="/resources/debt-guides" 
              className="inline-flex items-center text-[#88B04B] hover:text-[#A6C76F]"
            >
              View Resources <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        {/* Detailed Support Section */}
        <div className="bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How to Contact Us</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Email Support</h3>
              <p className="text-white/70 mb-2">
                For general inquiries and non-urgent support:
              </p>
              <a href="mailto:support@debtflow.com" className="text-[#88B04B] hover:text-[#A6C76F]">
                support@debtflow.com
              </a>
              <p className="text-white/70 mt-2">
                For billing and payment inquiries:
              </p>
              <a href="mailto:billing@debtflow.com" className="text-[#88B04B] hover:text-[#A6C76F]">
                billing@debtflow.com
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Live Chat Support</h3>
              <p className="text-white/70 mb-2">
                Chat with our AI assistant at any time, 24/7:
              </p>
              <button 
                onClick={handleOpenChat}
                className="inline-block bg-[#88B04B] text-white px-4 py-2 rounded hover:bg-[#6A8F3D]"
              >
                Start Chat Session
              </button>
            </div>
          </div>
        </div>
        
        {/* Support Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-lg p-4 text-center text-[#A6C76F]"
        >
          <p>24/7 AI Support Available</p>
        </motion.div>
      </main>
      
      <AIChat initialOpen={false} />
      <div id="aiChatToggle" className="hidden" />
    </div>
  );
} 