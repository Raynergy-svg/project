import { motion } from 'framer-motion';
import { HeadphonesIcon, HelpCircle, MessageCircle, Clock, FileQuestion, PhoneCall, Mail, Shield, MessageSquare, ChevronRight, Phone, BookOpen, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIChat } from '@/components/chat/AIChat';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* DebtFlow Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-xl mb-8 overflow-hidden"
        >
          <div className="md:flex items-center">
            <div className="md:w-3/5 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Meet Your DebtFlow Assistant
              </h2>
              <p className="text-indigo-100 mb-6 text-lg">
                Our AI-powered DebtFlow Assistant can help with debt strategies, payment questions, 
                account management, and technical support. Get instant answers 24/7, create support tickets, 
                and access personalized debt management guidance.
              </p>
              <button 
                onClick={() => document.getElementById('aiChatToggle')?.click()}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium px-6 py-3 rounded-lg shadow transition duration-150 flex items-center"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with DebtFlow Assistant
              </button>
            </div>
            <div className="hidden md:block md:w-2/5">
              <img 
                src="/images/ai-assistant.svg" 
                alt="AI Assistant" 
                className="h-80 w-full object-contain p-8" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </motion.div>
        
        {/* Support Options */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <MessageSquare className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Live Chat</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Chat with our support team in real-time. We're available Monday to Friday, 9am to 5pm ET.
            </p>
            <Link 
              to="/support/chat" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              Start a chat <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@debtflow.com" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              support@debtflow.com <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <Phone className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Phone Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Call us directly at our toll-free number, available Monday to Friday, 9am to 5pm ET.
            </p>
            <a 
              href="tel:+18005551234" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              +1 (800) 555-1234 <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <HelpCircle className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Help Center</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Browse our knowledge base for tutorials, guides, and answers to common questions.
            </p>
            <Link 
              to="/support/help-center" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              Visit Help Center <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <Ticket className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Support Tickets</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create and track support tickets for issues that require more detailed attention.
            </p>
            <Link 
              to="/support/tickets" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              My Support Tickets <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Debt Resources</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Access guides, calculators, and resources to help manage and reduce your debt effectively.
            </p>
            <Link 
              to="/resources/debt-guides" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              View Resources <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        {/* Detailed Support Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Contact Us</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-2">
                For general inquiries and non-urgent support:
              </p>
              <a href="mailto:support@debtflow.com" className="text-indigo-600 hover:text-indigo-800">
                support@debtflow.com
              </a>
              <p className="text-gray-600 mt-2">
                For billing and payment inquiries:
              </p>
              <a href="mailto:billing@debtflow.com" className="text-indigo-600 hover:text-indigo-800">
                billing@debtflow.com
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-2">
                Customer Service: Monday to Friday, 9am to 5pm ET
              </p>
              <a href="tel:+18005551234" className="text-indigo-600 hover:text-indigo-800">
                +1 (800) 555-1234
              </a>
              <p className="text-gray-600 mt-2">
                Billing Department: Monday to Friday, 9am to 4pm ET
              </p>
              <a href="tel:+18005555678" className="text-indigo-600 hover:text-indigo-800">
                +1 (800) 555-5678
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Live Chat Support</h3>
              <p className="text-gray-600 mb-2">
                Chat with a representative during business hours:
              </p>
              <Link 
                to="/support/chat" 
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Start Chat Session
              </Link>
            </div>
          </div>
        </div>
        
        {/* Support Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800"
        >
          <p>24/7 AI Support Available</p>
        </motion.div>
      </main>
      
      <AIChat initialOpen={false} />
      <div id="aiChatToggle" className="hidden" />
    </div>
  );
} 