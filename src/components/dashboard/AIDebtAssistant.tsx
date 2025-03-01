import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "How can I pay off my credit card debt faster?",
  "What's the snowball method for debt repayment?",
  "Should I consolidate my student loans?",
  "How to improve my credit score?"
];

export function AIDebtAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your AI debt assistant. How can I help with your financial journey today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (content: string = inputValue) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const generateAIResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('credit card')) {
      return "To pay off credit card debt faster, consider the avalanche method (focusing on highest interest rate first) or the snowball method (paying smallest balances first). Also, try to make more than the minimum payment each month and consider balance transfer options if you qualify for lower interest rates.";
    }
    
    if (lowerCaseMessage.includes('snowball')) {
      return "The debt snowball method involves paying off debts from smallest to largest, regardless of interest rate. This creates psychological wins as you eliminate debts quickly, building momentum. While you pay minimum payments on all debts, you put extra money toward the smallest debt until it's paid off, then roll that payment to the next smallest debt.";
    }
    
    if (lowerCaseMessage.includes('consolidate') || lowerCaseMessage.includes('student loan')) {
      return "Consolidating student loans can be beneficial if it simplifies payments or reduces your interest rate. Federal loan consolidation maintains government benefits but won't lower your rate. Private refinancing might lower rates but removes federal protections. Consider your specific situation, including loan types, rates, and whether you need income-driven repayment options.";
    }
    
    if (lowerCaseMessage.includes('credit score')) {
      return "To improve your credit score: 1) Pay all bills on time, 2) Reduce credit card balances (aim for <30% utilization), 3) Don't close old accounts, 4) Limit new credit applications, 5) Regularly check your credit report for errors. Consistency is key - positive changes typically take 3-6 months to reflect in your score.";
    }
    
    return "That's a great question about managing your finances. Would you like me to provide specific strategies for debt reduction, saving techniques, or perhaps budgeting tips tailored to your situation?";
  };

  return (
    <>
      {/* Chat button */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#88B04B] to-emerald-500 shadow-lg shadow-emerald-500/20 text-white"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
      
      {/* Chat modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px] rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 border border-white/10 shadow-xl backdrop-blur-sm flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-[#88B04B] to-emerald-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Debt Assistant</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-white/60">Online</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-[#88B04B] text-white rounded-tr-none' 
                        : 'bg-white/10 text-white rounded-tl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested prompts */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-white/70 text-sm mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-white/10 transition-colors py-1.5 px-3"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Insights panel */}
      <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">AI Debt Insights</h2>
            <p className="text-white/60">Personalized guidance for your financial journey</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => setIsOpen(true)}
          >
            <Sparkles className="w-4 h-4 text-[#88B04B]" />
            <span>Ask AI</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="font-medium text-white">Debt Reduction Strategy</h3>
            <p className="text-sm text-white/60 mt-1">
              Based on your current debt profile, the avalanche method would save you approximately $2,450 in interest compared to your current approach.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="text-[#88B04B] p-0 h-auto mt-2 gap-1"
              onClick={() => setIsOpen(true)}
            >
              <span>Learn more</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="font-medium text-white">Interest Rate Alert</h3>
            <p className="text-sm text-white/60 mt-1">
              Your credit card interest rate (24.99%) is above average. You may qualify for a balance transfer offer that could save you money.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="text-[#88B04B] p-0 h-auto mt-2 gap-1"
              onClick={() => setIsOpen(true)}
            >
              <span>Explore options</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 