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

export function LlamaAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your Llama AI debt assistant. How can I help with your financial journey today?",
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
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        "How can I pay off my credit card debt faster?": 
          "To pay off credit card debt faster: 1) Pay more than the minimum payment, 2) Use the avalanche method (focus on highest interest first), 3) Consider balance transfers to lower-interest cards, 4) Create a budget to allocate more funds to debt repayment, and 5) Consider a side hustle for extra income dedicated to debt reduction.",
        
        "What's the snowball method for debt repayment?": 
          "The snowball method involves paying off your smallest debts first, regardless of interest rate. You make minimum payments on all debts, but put extra money toward the smallest balance. Once that's paid off, you roll that payment into the next smallest debt, creating momentum as you eliminate each debt. This method provides psychological wins that keep you motivated.",
        
        "Should I consolidate my student loans?": 
          "Consolidating student loans might be beneficial if: 1) You can secure a lower interest rate, 2) You want to simplify multiple payments into one, or 3) You need to lower monthly payments by extending the term. However, be cautious as you might lose federal loan benefits if consolidating with a private lender. I'd recommend comparing your current rates with consolidation offers before deciding.",
        
        "How to improve my credit score?": 
          "To improve your credit score: 1) Pay all bills on time, 2) Reduce credit card balances (aim for <30% utilization), 3) Don't close old credit accounts, 4) Limit new credit applications, 5) Regularly check your credit report for errors, and 6) Consider becoming an authorized user on someone's well-established account. Most improvements take 3-6 months to reflect in your score."
      };

      let responseContent = aiResponses[content];
      
      if (!responseContent) {
        responseContent = "That's a great question about your finances. While I don't have specific information about your personal situation, I can help guide you through debt management strategies. Would you like to know more about debt reduction methods, budgeting techniques, or how to prioritize payments?";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button 
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-[#88B04B] to-emerald-500 hover:from-emerald-500 hover:to-[#88B04B]"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] h-[500px] bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#88B04B] to-emerald-500 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Llama AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-white/60">Online</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 text-white/70" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.sender === 'user'
                        ? 'bg-[#88B04B] text-white rounded-tr-none'
                        : 'bg-white/10 text-white rounded-tl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-white/50 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-3 border-t border-white/10 bg-black/20">
                <p className="text-xs text-white/60 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="cursor-pointer hover:bg-white/10 transition-colors py-1 px-3"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/40">
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
                  placeholder="Ask about debt management..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debt insights panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#88B04B]/20">
              <Sparkles className="w-5 h-5 text-[#88B04B]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Llama AI Debt Insights</h2>
              <p className="text-white/60">Personalized guidance for your financial journey</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsOpen(true)}
          >
            Chat with AI
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="font-medium text-white mb-2">Debt Reduction Strategy</h3>
            <p className="text-sm text-white/70 mb-3">
              Based on your current debt profile, the Avalanche Method (paying highest interest first) could save you $3,245 in interest.
            </p>
            <Button variant="link" className="text-[#88B04B] p-0 h-auto" onClick={() => setIsOpen(true)}>
              Learn more
            </Button>
          </div>
          
          <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="font-medium text-white mb-2">Credit Score Impact</h3>
            <p className="text-sm text-white/70 mb-3">
              Your consistent payments have improved your credit score by 15 points in the last 3 months.
            </p>
            <Button variant="link" className="text-[#88B04B] p-0 h-auto" onClick={() => setIsOpen(true)}>
              Get tips
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
} 