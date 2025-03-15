import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { runAuthDiagnostics } from '@/utils/auth-diagnostics';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthErrorBoundary component
 * 
 * This component provides a graceful fallback UI when authentication errors occur.
 * It monitors the auth state and displays a helpful error message when authentication fails.
 */
export default function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  const { authError, isLoading, refreshSession } = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Run diagnostics when an auth error occurs
  useEffect(() => {
    if (authError && !diagnosticResults && !isRunningDiagnostics) {
      handleRunDiagnostics();
    }
  }, [authError, diagnosticResults, isRunningDiagnostics]);

  // Function to run diagnostics
  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const results = await runAuthDiagnostics();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Function to retry authentication
  const handleRetry = async () => {
    setDiagnosticResults(null);
    await refreshSession();
  };

  // If there's no error, render children
  if (!authError) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default error UI
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 bg-gray-50 rounded-lg shadow-sm">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-6 h-6 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">
          Authentication Error
        </h2>
        
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {authError}
        </div>
        
        {isRunningDiagnostics ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Running diagnostics...</span>
          </div>
        ) : diagnosticResults ? (
          <div className="mb-4">
            <h3 className="mb-2 font-medium text-gray-700">Diagnostic Results:</h3>
            <ul className="pl-5 mb-4 space-y-1 text-sm list-disc">
              {!diagnosticResults.envCheck?.valid && (
                <li className="text-amber-700">Environment variables issue detected</li>
              )}
              {!diagnosticResults.connectionCheck?.connected && (
                <li className="text-amber-700">Connection to authentication service failed</li>
              )}
              {!diagnosticResults.sessionCheck?.valid && (
                <li className="text-amber-700">Session validation failed</li>
              )}
              {!diagnosticResults.clientCheck?.valid && (
                <li className="text-amber-700">Authentication client initialization issue</li>
              )}
              {diagnosticResults.success && (
                <li className="text-green-700">No critical issues detected. The error may be temporary.</li>
              )}
            </ul>
          </div>
        ) : null}
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          
          {!isRunningDiagnostics && !diagnosticResults && (
            <button
              onClick={handleRunDiagnostics}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Run Diagnostics
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
} 