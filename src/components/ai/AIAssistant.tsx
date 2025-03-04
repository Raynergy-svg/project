import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { queryAI } from '@/lib/ai/aiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Brain, SendIcon, Sparkles, MessagesSquare, Loader2 } from 'lucide-react';

/**
 * AI Assistant component that provides a chat-like interface for users to interact with the AI
 */
export function AIAssistant() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your financial AI assistant. How can I help you with your debt management today?',
      timestamp: new Date(),
    },
  ]);

  /**
   * Handle sending a query to the AI
   */
  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user query to conversation
    setConversation(prev => [
      ...prev,
      {
        role: 'user',
        content: query,
        timestamp: new Date(),
      },
    ]);
    
    // Clear input and set loading state
    setQuery('');
    setIsLoading(true);
    
    try {
      // Send query to AI service
      const response = await queryAI(
        query,
        {
          // Additional context could be provided here
          request_type: 'general_query',
          previous_messages: conversation.slice(-5), // Send last 5 messages for context
        },
        user?.id
      );
      
      // Add AI response to conversation
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.result || response.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message to conversation
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again later.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle quick queries that we prefill for the user
   */
  const handleQuickQuery = (prefilledQuery: string) => {
    setQuery(prefilledQuery);
    // Don't automatically send to allow user to edit if desired
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Financial Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about debt management, financial planning, or get personalized advice
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto space-y-4 mb-4">
        {/* Conversation display */}
        <div className="space-y-4">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Input area */}
      <CardFooter className="border-t pt-4">
        <div className="w-full space-y-4">
          {/* Quick queries */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuery("What's the best way to pay off my credit cards?")}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Credit card strategy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuery("How do I improve my credit score?")}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Improve credit score
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuery("Should I consolidate my debts?")}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Debt consolidation
            </Button>
          </div>
          
          {/* Message input */}
          <form onSubmit={handleSendQuery} className="flex gap-2">
            <Input
              placeholder="Ask me about debt management, finances, or budgeting..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
} 