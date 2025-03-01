import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, ArrowDown, User, Bot, ChevronUp, PaperclipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface SuggestedAction {
  label: string;
  onClick: () => void;
}

interface AIChatProps {
  initialOpen?: boolean;
  onClose?: () => void;
}

export function AIChat({ initialOpen = false, onClose }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session when component mounts
  useEffect(() => {
    if (isOpen && user && !sessionId) {
      initChatSession();
    }
  }, [isOpen, user]);

  const initChatSession = async () => {
    try {
      const response = await axios.post('/api/chat/session', {
        userId: user?.id,
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setMessages([
          {
            id: uuidv4(),
            content: response.data.greeting,
            role: 'assistant',
            timestamp: new Date(),
          },
        ]);
        
        if (response.data.suggestedActions) {
          setSuggestedActions(response.data.suggestedActions);
        }
      }
    } catch (err) {
      console.error('Error initializing chat session:', err);
      setError('Unable to start chat. Please try again later.');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setSuggestedActions([]);

    try {
      const response = await axios.post('/api/chat/message', {
        userId: user.id,
        sessionId,
        message: userMessage.content,
      });

      if (response.data.success) {
        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            content: response.data.response,
            role: 'assistant',
            timestamp: new Date(),
          },
        ]);

        // Set suggested actions if available
        if (response.data.suggestedActions && response.data.suggestedActions.length > 0) {
          setSuggestedActions(response.data.suggestedActions);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Add error message from AI
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: "I'm sorry, I couldn't process your message. Please try again later.",
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInput(action);
    handleSend();
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && !sessionId && user) {
      initChatSession();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <motion.button
        onClick={toggleChat}
        className={`flex items-center rounded-full p-3 shadow-lg ${
          isOpen ? 'bg-gray-700' : 'bg-[#88B04B]'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex flex-col h-[500px] max-h-[80vh] bg-gray-900 border border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-[#88B04B]" />
                  </div>
                  <h3 className="font-medium text-white">DebtFlow Assistant</h3>
                </div>
                <button
                  onClick={closeChat}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-[#88B04B] text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.role === 'user' ? 'text-[#D9EAC0]' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-white rounded-lg px-4 py-2 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-2 rounded-md text-sm">
                    {error}
                    <button
                      onClick={() => setError(null)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Suggested actions */}
                {suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedAction(action)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-full transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3 border-t border-gray-800 bg-gray-900">
                <div className="flex">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md px-3 py-2 focus:outline-none focus:border-[#88B04B] text-white placeholder-gray-400 resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="rounded-l-none bg-[#88B04B] hover:bg-[#76983F]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Your chat with our AI assistant is not reviewed by humans unless you request help.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 