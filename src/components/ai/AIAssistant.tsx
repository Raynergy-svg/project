'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { queryAI, AIMessage } from '@/lib/ai/aiService';
import { useDebounce } from '@/hooks/useDebounce';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, SendIcon, Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function AIAssistant() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<AIMessage[]>([
    {
      sender: 'assistant',
      text: 'Hello! I\'m your financial AI assistant. How can I help you with debt management today?',
      timestamp: Date.now(),
    },
  ]);

  const handleSendQuery = async (userQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add the user's message to the conversation
      const userMessage: AIMessage = {
        sender: 'user',
        text: userQuery,
        timestamp: Date.now(),
      };
      
      setConversation(prev => [...prev, userMessage]);
      
      // Clear the input field
      setQuery('');
      
      // Query the AI
      const response = await queryAI({
        query: userQuery,
        userId: user?.id,
        history: conversation,
      });
      
      // Add the AI's response to the conversation
      const aiMessage: AIMessage = {
        sender: 'assistant',
        text: response,
        timestamp: Date.now(),
      };
      
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      handleSendQuery(query);
    }
  };

  const handleQuickQuery = (prefilledQuery: string) => {
    setQuery(prefilledQuery);
    // Don't automatically send to allow user to edit if desired
  };

  /**
   * Let users retry when there's an error
   */
  const handleRetry = () => {
    // Get the last user message, if any
    const lastUserMessage = [...conversation]
      .reverse()
      .find(msg => msg.sender === 'user');
      
    if (lastUserMessage) {
      // Retry with the last user message
      handleSendQuery(lastUserMessage.text);
    } else {
      // If no user message found, clear the error
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Financial AI Assistant
          </CardTitle>
          <CardDescription>
            Ask me anything about your debts, budget, or financial strategy.
          </CardDescription>
        </CardHeader>
        
        {error && (
          <Alert variant="destructive" className="mx-6 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <CardContent className="flex-grow overflow-y-auto space-y-4 mb-4">
          {/* Conversation display */}
          <div className="space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
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
            <form onSubmit={handleSubmit} className="flex gap-2">
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
    </div>
  );
} 