import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const router = useRouter();
  const path = router.asPath;
  
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
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-amber-100 rounded-full">
            <AlertCircle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          {isPlaceholder ? (
            <>This feature is coming soon! We're working hard to implement it.</>
          ) : (
            <>The page you are looking for doesn't exist or has been moved.</>
          )}
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          Path: <code className="px-1 py-0.5 bg-gray-100 rounded">{path}</code>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 justify-center" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button asChild className="flex items-center gap-2 justify-center">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 