import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RefreshCw } from 'lucide-react';
import { createFallbackToken } from '@/utils/captcha';

interface FallbackCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
}

/**
 * A simple fallback captcha component that doesn't rely on external services
 * This should only be used when hCaptcha fails to load
 */
export const FallbackCaptcha: React.FC<FallbackCaptchaProps> = ({ onVerify, onError }) => {
  const [answer, setAnswer] = useState('');
  const [challenge, setChallenge] = useState<{question: string, answer: string}>({ question: '', answer: '' });
  const [error, setError] = useState('');

  // Generate a simple math challenge
  const generateChallenge = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, result;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        result = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 10) + 5;
        num2 = Math.floor(Math.random() * 5) + 1;
        result = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        result = num1 * num2;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        result = num1 + num2;
    }
    
    const question = `What is ${num1} ${operation} ${num2}?`;
    return { question, answer: result.toString() };
  };
  
  // Generate challenge on mount
  useEffect(() => {
    const newChallenge = generateChallenge();
    setChallenge(newChallenge);
    
    // Log to console that we're using the fallback
    console.warn('Using fallback captcha because hCaptcha could not load. This is less secure.');
  }, []);
  
  const refreshChallenge = () => {
    setAnswer('');
    setError('');
    const newChallenge = generateChallenge();
    setChallenge(newChallenge);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer === challenge.answer) {
      // Generate a simple mock token that's clearly not from hCaptcha
      const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const fallbackToken = createFallbackToken(seed);
      onVerify(fallbackToken);
    } else {
      setError('Incorrect answer. Please try again.');
      if (onError) {
        onError(new Error('Fallback captcha validation failed'));
      }
      refreshChallenge();
    }
  };
  
  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-800 font-medium">Fallback Challenge</span>
        <p className="text-xs text-yellow-700">hCaptcha could not load</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded border flex-1 text-center font-medium">
            {challenge.question}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={refreshChallenge}
            className="h-9 w-9"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="flex-1"
            required
          />
          <Button type="submit" className="whitespace-nowrap">
            Verify
          </Button>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          This is a fallback verification system. For security reasons, please enable JavaScript for *.hcaptcha.com domains.
        </p>
      </form>
    </div>
  );
}; 