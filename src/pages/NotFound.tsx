import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Check if this is a page that's referenced but not implemented
  const isPlaceholder = path.includes('verify-email') || 
                        path.includes('reset-password') || 
                        path.includes('forgot-password') ||
                        path.includes('savings-planner') ||
                        path.includes('insights') ||
                        path.includes('articles') ||
                        path.includes('settings/');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        {isPlaceholder ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Page Under Construction</h1>
            <p className="text-gray-600">
              This feature is coming soon. We're working hard to make it available.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
            <p className="text-gray-600">
              We couldn't find the page you're looking for. The page may have been moved or doesn't exist.
            </p>
          </>
        )}
        
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          
          <Button onClick={() => window.history.back()} variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          {isPlaceholder && (
            <Button asChild variant="default">
              <Link to="/dashboard">
                Dashboard
              </Link>
            </Button>
          )}
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            <p className="font-semibold">Development Note:</p>
            <p>This component is a placeholder. Create the real component at:</p>
            <code className="block mt-1 bg-blue-100 p-1 rounded font-mono">
              {path}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound; 