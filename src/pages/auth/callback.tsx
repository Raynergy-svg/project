import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Check } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(`Authentication error: ${errorDescription || error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authentication code found in the URL');
          return;
        }

        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setStatus('error');
          setMessage(`Error exchanging code for session: ${exchangeError.message}`);
          return;
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');

        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Authentication</h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center p-4">
            <LoadingSpinner className="h-10 w-10 mb-4" />
            <p className="text-center text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <Alert>
            <Check className="h-5 w-5 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 