import { motion } from 'framer-motion';
import { HeadphonesIcon, HelpCircle, MessageCircle, Clock, FileQuestion, PhoneCall, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIChat } from '@/components/chat/AIChat';

export default function Support() {
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
              Customer Support
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            We're here to help you on your journey to financial freedom
          </p>
        </motion.div>

        {/* Support Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: MessageCircle,
              title: "Live Chat",
              description: "Chat with our support team in real-time"
            },
            {
              icon: Mail,
              title: "Email Support",
              description: "Get answers within 24 hours via email"
            },
            {
              icon: PhoneCall,
              title: "Phone Support",
              description: "Talk to our experts Mon-Fri, 9am-5pm ET"
            },
            {
              icon: HelpCircle,
              title: "Help Center",
              description: "Browse our extensive knowledge base"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#88B04B]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Chat Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/10 rounded-xl border border-[#88B04B]/30 p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#88B04B]/30 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-[#88B04B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI Assistant Now Available</h3>
                <p className="text-gray-300">
                  Get instant answers to your questions with our new AI chat assistant. Our bot can help with account questions, 
                  debt strategies, and technical support 24/7.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => document.getElementById("chat-trigger")?.click()} 
              className="bg-[#88B04B] hover:bg-[#76983F] text-white px-6 py-2 rounded-md"
            >
              Chat Now
            </Button>
          </div>
        </motion.div>

        {/* Detailed Support Sections */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <HeadphonesIcon className="w-6 h-6 text-[#88B04B]" />
              Contact Options
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white">Email Support</p>
                    <p className="text-sm text-gray-400 mt-1">For general inquiries and non-urgent issues</p>
                    <a href="mailto:support@smartdebtflow.com" className="text-[#88B04B] hover:text-[#7a9d43] text-sm mt-1 inline-block">
                      support@smartdebtflow.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneCall className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white">Phone Support</p>
                    <p className="text-sm text-gray-400 mt-1">Available Monday to Friday, 9am to 5pm ET</p>
                    <a href="tel:+18005551234" className="text-[#88B04B] hover:text-[#7a9d43] text-sm mt-1 inline-block">
                      +1 (800) 555-1234
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white">Live Chat</p>
                    <p className="text-sm text-gray-400 mt-1">Get real-time assistance from our support team</p>
                    <Button 
                      className="mt-2 bg-[#88B04B] hover:bg-[#7a9d43] text-white text-sm py-1 px-3"
                      onClick={() => window.open('https://support.smartdebtflow.com/chat', '_blank')}
                    >
                      Start Chat
                    </Button>
                  </div>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#88B04B]" />
              Support Hours
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    M
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Monday</span>
                    <span>9:00 AM - 5:00 PM ET</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    T
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Tuesday</span>
                    <span>9:00 AM - 5:00 PM ET</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    W
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Wednesday</span>
                    <span>9:00 AM - 5:00 PM ET</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    T
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Thursday</span>
                    <span>9:00 AM - 5:00 PM ET</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    F
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Friday</span>
                    <span>9:00 AM - 5:00 PM ET</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    S
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Saturday</span>
                    <span>Email Support Only</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-1 flex items-center justify-center font-bold">
                    S
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Sunday</span>
                    <span>Email Support Only</span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FileQuestion className="w-6 h-6 text-[#88B04B]" />
              Frequently Asked Questions
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[#88B04B] mb-2">How do I reset my password?</h3>
                  <p className="text-gray-300">
                    You can reset your password by clicking on "Forgot Password" on the sign-in page. We'll send you an email with instructions to create a new password.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#88B04B] mb-2">How do I connect my bank account?</h3>
                  <p className="text-gray-300">
                    Go to the "Bank Connections" section in your dashboard. Click "Add Account" and follow the secure prompts to connect your financial institution.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#88B04B] mb-2">Is my financial data secure?</h3>
                  <p className="text-gray-300">
                    Yes, we use bank-level AES-256 encryption to protect all your sensitive data. We never store your bank credentials and are SOC2 Type II certified.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#88B04B] mb-2">How do I cancel my subscription?</h3>
                  <p className="text-gray-300">
                    You can cancel your subscription anytime by going to the "Billing" section in your account settings. Your access will continue until the end of your current billing period.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Report an Issue</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                If you've encountered a technical issue or have a suggestion for improving our platform, please let us know:
              </p>
              <form className="space-y-4">
                <div>
                  <label htmlFor="issue-type" className="block text-sm font-medium mb-1">Issue Type</label>
                  <select 
                    id="issue-type"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#88B04B]"
                  >
                    <option value="bug">Technical Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#88B04B]"
                    placeholder="Please describe the issue in detail..."
                  />
                </div>
                <Button className="bg-[#88B04B] hover:bg-[#7a9d43] text-white">
                  Submit Report
                </Button>
              </form>
            </div>
          </motion.section>
        </div>

        {/* Support Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#88B04B]/10 px-4 py-2 rounded-full">
            <Shield className="w-5 h-5 text-[#88B04B]" />
            <span className="text-[#88B04B]">24/7 Email Support Available</span>
          </div>
        </motion.div>
      </div>

      {/* AI Chat Component */}
      <AIChat initialOpen={false} />
    </div>
  );
} 