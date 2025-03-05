import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, AlertCircle, Bot } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Message {
  id?: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggestedActions?: SuggestedAction[];
}

interface SuggestedAction {
  id: string;
  label: string;
  value: string;
}

interface AIChatProps {
  initialOpen?: boolean;
}

export default function AIChat({ initialOpen = false }: AIChatProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketInfo, setTicketInfo] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize chat session when component mounts
  useEffect(() => {
    if (isOpen && !sessionId && user) {
      initChatSession();
    }
  }, [isOpen, user]);

  const initChatSession = async () => {
    try {
      setIsTyping(true);
      const response = await axios.post('/api/chat/session', {
        userId: user?.id
      });
      
      setSessionId(response.data.sessionId);
      
      const initialMessage: Message = {
        sender: 'assistant',
        content: response.data.initialMessage.content,
        suggestedActions: response.data.initialMessage.suggestedActions
      };
      
      setMessages([initialMessage]);
      setSuggestedActions(response.data.initialMessage.suggestedActions || []);
      setIsTyping(false);
    } catch (err) {
      console.error('Error initializing chat session:', err);
      setError('Failed to initialize chat. Please try again later.');
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !user) return;
    
    const userMessage: Message = {
      sender: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSuggestedActions([]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await axios.post('/api/chat/message', {
        userId: user.id,
        sessionId,
        message: input
      });
      
      const aiMessage: Message = {
        sender: 'assistant',
        content: response.data.response.content,
        suggestedActions: response.data.response.suggestedActions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setSuggestedActions(response.data.response.suggestedActions || []);
      
      // Check if response indicates we should show the ticket form
      if (aiMessage.content.includes('support ticket') && 
          aiMessage.content.toLowerCase().includes('create') &&
          !showTicketForm) {
        handleShowTicketForm();
      }
      
      setIsTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedAction = (action: SuggestedAction) => {
    setInput(action.value);
    handleSend();
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleShowTicketForm = () => {
    setShowTicketForm(true);
    
    // Pre-fill ticket description with recent conversation
    const lastMessages = messages.slice(-4);
    const conversationSummary = lastMessages
      .map(msg => `${msg.sender === 'user' ? 'Me' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    setTicketInfo(prev => ({
      ...prev,
      description: conversationSummary
    }));
  };

  const handleSubmitTicket = async () => {
    if (!user || !sessionId) return;
    
    try {
      setIsTyping(true);
      
      const response = await axios.post('/api/chat/ticket', {
        userId: user.id,
        sessionId,
        subject: ticketInfo.subject,
        description: ticketInfo.description,
        category: ticketInfo.category,
        priority: ticketInfo.priority
      });
      
      // Add confirmation message
      const confirmationMessage: Message = {
        sender: 'assistant',
        content: `Your support ticket has been created successfully! Ticket #${response.data.ticketId} has been assigned to our team and we'll get back to you soon.`,
        suggestedActions: [
          { id: 'view_ticket', label: 'View Ticket', value: 'I want to view my ticket status' },
          { id: 'continue', label: 'Continue Chat', value: 'Let me ask something else' }
        ]
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      setSuggestedActions(confirmationMessage.suggestedActions || []);
      setShowTicketForm(false);
      setIsTyping(false);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create support ticket. Please try again.');
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg z-20 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 w-96 h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 border border-gray-200"
            ref={chatContainerRef}
          >
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={20} />
                <h3 className="font-medium">DebtFlow Assistant</h3>
              </div>
              <button onClick={toggleChat} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <button onClick={handleDismissError} className="text-gray-500 hover:text-gray-700">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Suggested actions */}
              {suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleSuggestedAction(action)}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm hover:bg-indigo-100 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Support ticket form */}
              {showTicketForm && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-gray-900">Create Support Ticket</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={ticketInfo.subject}
                      onChange={(e) => setTicketInfo(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={ticketInfo.description}
                      onChange={(e) => setTicketInfo(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
                      placeholder="Provide details about your issue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={ticketInfo.category}
                        onChange={(e) => setTicketInfo(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="general">General</option>
                        <option value="account">Account</option>
                        <option value="payment">Payment</option>
                        <option value="technical">Technical</option>
                        <option value="debt_strategy">Debt Strategy</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={ticketInfo.priority}
                        onChange={(e) => setTicketInfo(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitTicket}
                      className="px-3 py-1.5 bg-indigo-600 rounded-md text-sm text-white hover:bg-indigo-700"
                      disabled={!ticketInfo.subject || !ticketInfo.description}
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-md resize-none max-h-32 min-h-[2.5rem] text-sm"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`p-2 rounded-md ${
                    !input.trim() || isTyping
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your chat with our AI assistant is not reviewed by humans unless you request help.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 