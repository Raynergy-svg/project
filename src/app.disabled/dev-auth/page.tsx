'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IS_DEV } from '@/utils/environment';
import { signInWithPassword, signUp, devAuth } from '@/utils/auth-simple';
import { SUPABASE_BYPASS_TOKENS, generateBypassToken, getSupabaseCaptchaToken } from '@/utils/turnstile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/utils/supabase/client';
import { isSupabaseConfigured } from '@/utils/supabase/configureClient';

/**
 * Development Authentication Test Page
 * This page is only available in development mode and provides
 * tools to test authentication with and without captcha.
 */
export default function DevAuthPage() {
  const router = useRouter();
  
  // State for form inputs
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [captchaToken, setCaptchaToken] = useState('');
  
  // State for authentication status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBypassToken, setSelectedBypassToken] = useState(SUPABASE_BYPASS_TOKENS[0]);
  const [authDebugInfo, setAuthDebugInfo] = useState<any>(null);
  
  // Handle production mode (redirect to home)
  useEffect(() => {
    if (!IS_DEV) {
      router.push('/');
    }
    
    // Auto-populate a captcha token
    const populateCaptchaToken = async () => {
      try {
        const token = await getSupabaseCaptchaToken();
        setCaptchaToken(token);
      } catch (e) {
        console.error('Failed to get captcha token:', e);
      }
    };
    
    populateCaptchaToken();
  }, [router]);
  
  // Handle sign in
  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use our dev-signin API endpoint
      const response = await fetch('/api/auth/dev-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          captchaToken
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(`Sign-in error: ${result.error}`);
        return;
      }
      
      setSuccess('Sign-in successful');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('Sign-in error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sign up
  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await signUp(email, password, {
        captchaToken: captchaToken,
        userData: {
          name: 'Test User',
          role: 'user',
          is_dev_account: true
        }
      });
      
      if (result.success) {
        setSuccess('Sign up successful! Check your email for confirmation.');
      } else {
        setError(`Sign up failed: ${result.error}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dev auth (one-click auth)
  const handleDevAuth = async (role: 'admin' | 'user') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await devAuth(role);
      
      if (result.success) {
        setSuccess(`Dev auth successful as ${role}! Redirecting...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(`Dev auth failed: ${result.error}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update captcha token with selected bypass token
  const updateCaptchaToken = (token: string) => {
    setSelectedBypassToken(token);
    setCaptchaToken(token);
  };
  
  // Authentication debug handler
  const handleAuthDebug = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAuthDebugInfo(null);

    try {
      // Check environment variables
      const envInfo = {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set',
        SKIP_AUTH_CAPTCHA: process.env.SKIP_AUTH_CAPTCHA,
        SUPABASE_AUTH_CAPTCHA_DISABLE: process.env.SUPABASE_AUTH_CAPTCHA_DISABLE,
        DISABLE_TURNSTILE: process.env.DISABLE_TURNSTILE,
        IS_DEV
      };

      // Test Supabase connection
      const connectionTest = await supabase.from('profiles').select('count').limit(1);
      
      // Test direct API call with bypass token
      const directSignInResult = await fetch('/api/auth/dev-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          captchaToken: captchaToken || '1x00000000000000000000AA'
        })
      });
      
      const directSignInData = await directSignInResult.json();
      
      // Test auth library
      const authLibraryTest = await signInWithPassword(email, password, { 
        captchaToken: captchaToken || '1x00000000000000000000AA'
      });
      
      // Compile debug information
      const debugInfo = {
        environment: envInfo,
        connectionTest: {
          success: !connectionTest.error,
          error: connectionTest.error,
          data: connectionTest.data
        },
        directApiCall: {
          status: directSignInResult.status,
          data: directSignInData
        },
        authLibrary: authLibraryTest
      };
      
      setAuthDebugInfo(debugInfo);
      setSuccess('Debug information collected successfully');
    } catch (error) {
      console.error('Auth debug error:', error);
      setError('Error collecting debug information: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Dev sign-in handler (one-click auth)
  const handleDevSignIn = async (role: 'admin' | 'user' = 'user') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const testEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
      const testPassword = 'password123';
      
      // Get a captcha token for development
      const token = await getSupabaseCaptchaToken();
      
      // Use our dev-signin API endpoint
      const response = await fetch('/api/auth/dev-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          captchaToken: token
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(`Authentication error: ${result.error}`);
        return;
      }
      
      setSuccess(`Successfully signed in as ${role}`);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('Dev auth error:', error);
      setError('Authentication error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Dev Authentication Test</CardTitle>
          <CardDescription>
            This page allows you to test authentication flows in development mode.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="quick">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Auth</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Quick Auth Tab */}
            <TabsContent value="quick" className="space-y-4 py-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Development Mode Only</AlertTitle>
                <AlertDescription>
                  These one-click options only work in development mode.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => handleDevSignIn('admin')} 
                  disabled={loading}
                  className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 active:bg-[#6A8F3D] text-white"
                >
                  Sign in as Admin
                </Button>
                
                <Button 
                  onClick={() => handleDevSignIn('user')} 
                  disabled={loading}
                  className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 active:bg-[#6A8F3D] text-white"
                >
                  Sign in as Regular User
                </Button>
                
                <Button 
                  onClick={handleAuthDebug}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                >
                  Authentication Debug
                </Button>
              </div>
            </TabsContent>
            
            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="captcha">Captcha Token (Auto-populated for dev)</Label>
                  <Input
                    id="captcha"
                    type="text"
                    value={captchaToken}
                    onChange={(e) => setCaptchaToken(e.target.value)}
                    placeholder="Bypass token or captcha token"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSignIn} 
                disabled={loading} 
                className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 active:bg-[#6A8F3D] text-white"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </TabsContent>
            
            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-captcha">Captcha Token (Auto-populated for dev)</Label>
                  <Input
                    id="signup-captcha"
                    type="text"
                    value={captchaToken}
                    onChange={(e) => setCaptchaToken(e.target.value)}
                    placeholder="Bypass token or captcha token"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSignUp} 
                disabled={loading} 
                className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 active:bg-[#6A8F3D] text-white"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="mt-4 bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {authDebugInfo && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
              <pre className="bg-black/50 p-3 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(authDebugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            This page is only available in development mode.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 