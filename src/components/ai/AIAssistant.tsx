import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { queryAI, AIQueryResponse } from '@/lib/ai/aiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Brain, SendIcon, Sparkles, MessagesSquare, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define Message interface for the conversation
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  isError?: boolean;
}

/**
 * AI Assistant component that provides a chat-like interface for users to interact with the AI
 */
export function AIAssistant() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([
    {
      id: 'ai-welcome',
      text: 'Hello! I\'m your financial AI assistant. How can I help you with your debt management today?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission for sending a query to the AI
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const currentQuery = query.trim();
      setQuery(''); // Clear input field
      await handleSendQuery(currentQuery);
    }
  };

  /**
   * Send a query to the AI and process the response
   */
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message to the conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: queryText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setConversation(prev => [...prev, userMessage]);

    // For development mode, mock context data
    const isDev = import.meta.env.DEV;
    const mockFinancialContext = isDev ? {
      income: 5000,
      debts: [
        { id: 'debt1', name: 'Credit Card', amount: 5000, interestRate: 22.99 },
        { id: 'debt2', name: 'Student Loan', amount: 25000, interestRate: 4.5 },
        { id: 'debt3', name: 'Car Loan', amount: 12000, interestRate: 3.9 }
      ],
      transactions: [
        { id: 'tx1', description: 'Grocery Store', amount: 150, category: 'Groceries', date: new Date().toISOString() },
        { id: 'tx2', description: 'Gas Station', amount: 40, category: 'Transportation', date: new Date().toISOString() },
        { id: 'tx3', description: 'Netflix', amount: 15, category: 'Entertainment', date: new Date().toISOString() }
      ]
    } : {};
    
    try {
      // Get user ID from auth context, using a mock ID in development if needed
      const userId = user?.id || (isDev ? 'dev-user-id' : undefined);
      
      // Wrapping the AI query in a try-catch block with direct fallback
      let response: AIQueryResponse | null = null;
      
      try {
        console.log('Sending query to AI service:', queryText);
        response = await queryAI(queryText, { 
          ...mockFinancialContext,
          request_type: 'general_query' 
        }, userId);
      } catch (queryError) {
        console.error('AIAssistant: Error querying AI:', queryError);
        
        // Display error in development mode for debugging
        if (isDev) {
          const devErrorMessage: Message = {
            id: `ai-error-${Date.now()}`,
            text: `[DEV] AI Service Error: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            isError: true,
          };
          setConversation(prev => [...prev, devErrorMessage]);
        }
        
        throw queryError; // Re-throw to be caught by the outer try-catch
      }
      
      // Check if we got a valid response
      if (!response || !response.success) {
        const errorMessage = response?.error || 'Failed to get a valid response from the AI service';
        throw new Error(errorMessage);
      }
      
      // Process the successful response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response.result || 'I processed your request but have no specific response.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI conversation:', error);
      
      // Set a user-friendly error message
      const errorMsg = error instanceof Error 
        ? error.message
        : 'An unexpected error occurred while processing your request';
        
      setError(errorMsg);
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        text: isDev 
          ? `I encountered a technical issue: ${errorMsg}`
          : 'I apologize, but I encountered a technical issue processing your request. Please try again later.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      
      setConversation(prev => [...prev, errorMessage]);
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