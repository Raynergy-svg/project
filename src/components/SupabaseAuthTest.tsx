import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from './LoadingSpinner';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { 
  HCAPTCHA_SITE_KEY,
  handleCaptchaVerify,
  handleCaptchaExpire,
  verifyCaptchaPresent
} from '@/utils/captcha';

export const SupabaseAuthTest: React.FC = () => {
  const [testEmail, setTestEmail] = useState(`test_${Math.floor(Math.random() * 10000)}@example.com`);
  const [testPassword, setTestPassword] = useState('Password123!');
  const [testName, setTestName] = useState('Test User');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('signup');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // Add this to keep track of captcha verification
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        setCurrentUser(userData.user);
      }
    };
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          const { data } = await supabase.auth.getUser();
          setCurrentUser(data.user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle captcha verification
  const onCaptchaVerify = (token: string) => {
    handleCaptchaVerify(token, setCaptchaToken, setIsCaptchaVerified);
  };

  // Handle captcha expiration
  const onCaptchaExpire = () => {
    handleCaptchaExpire(setCaptchaToken, setIsCaptchaVerified);
  };

  const handleSignUp = async () => {
    try {
      setStatus('loading');
      setMessage('');

      // Check for captcha
      const captchaError = verifyCaptchaPresent(captchaToken);
      if (captchaError) {
        setStatus('error');
        setMessage(captchaError);
        return;
      }

      // Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: testName,
          },
          captchaToken: captchaToken,
        },
      });

      if (error) {
        setStatus('error');
        setMessage(`Error signing up: ${error.message}`);
        return;
      }

      if (data.user) {
        setStatus('success');
        if (data.session) {
          setMessage('Successfully signed up and signed in!');
          setCurrentUser(data.user);
        } else {
          setMessage('Successfully signed up! Please check your email for confirmation instructions.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSignIn = async () => {
    try {
      setStatus('loading');
      setMessage('');

      // Check for captcha
      const captchaError = verifyCaptchaPresent(captchaToken);
      if (captchaError) {
        setStatus('error');
        setMessage(captchaError);
        return;
      }

      // Proceed with signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
        options: {
          captchaToken: captchaToken,
        }
      });

      if (error) {
        setStatus('error');
        setMessage(`Error signing in: ${error.message}`);
        return;
      }

      if (data.user) {
        setStatus('success');
        setMessage('Successfully signed in!');
        setCurrentUser(data.user);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      setStatus('loading');
      setMessage('');

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setStatus('success');
      setMessage('User signed out successfully!');
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleGetUser = async () => {
    try {
      setStatus('loading');
      setMessage('');

      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (data.user) {
        setStatus('success');
        setMessage(`Current user: ${JSON.stringify(data.user, null, 2)}`);
      } else {
        setStatus('error');
        setMessage('No user is currently signed in');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Auth Test</CardTitle>
        <CardDescription>
          Test Supabase authentication functionality
        </CardDescription>
      </CardHeader>

      <CardContent>
        {currentUser ? (
          <div className="space-y-4">
            <Alert variant="success">
              <AlertTitle>Authenticated</AlertTitle>
              <AlertDescription>
                You are signed in as {currentUser.email}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleGetUser} variant="outline">
                Get User
              </Button>
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              
              <HCaptcha
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={onCaptchaVerify}
                onExpire={onCaptchaExpire}
              />
              
              <Button onClick={handleSignUp} className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Signing Up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
              </div>
              
              <HCaptcha
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={onCaptchaVerify}
                onExpire={onCaptchaExpire}
              />
              
              <Button onClick={handleSignIn} className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                Sign In
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {message && (
          <Alert variant={status === 'success' ? 'default' : 'destructive'} className="mt-4">
            <AlertTitle>{status === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">
              {message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        <div className="text-sm text-muted-foreground">
          Test the Supabase authentication flow directly to ensure it's working properly.
        </div>
      </CardFooter>
    </Card>
  );
}; 