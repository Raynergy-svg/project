import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createServerClient } from '@supabase/ssr';
import { GetServerSideProps } from 'next';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have a code in the URL
      const { code } = router.query;
      
      // If no code in the URL, redirect to sign in page
      if (!code) {
        router.push('/signin');
        return;
      }
      
      // If we have a code, wait 2 seconds and redirect to dashboard
      // The server-side logic will exchange the code for a session
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    };
    
    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  return (
    <Layout
      title="Authenticating | Smart Debt Flow"
      showNavbar={false}
      showFooter={false}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Authenticating...</h1>
          <p className="text-muted-foreground">
            Please wait while we complete your sign in.
          </p>
        </div>
      </div>
    </Layout>
  );
}

// Server-side props for authentication callback
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Create Supabase client
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return context.req.cookies[name];
        },
        set(name, value, options) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
        remove(name, options) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
      },
    }
  );

  // Check if we have a code in the URL
  const { code } = context.query;

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code as string);
  }

  // We let the client side redirect to the appropriate page
  return {
    props: {},
  };
} 