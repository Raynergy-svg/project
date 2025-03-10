import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createServerClient } from '@supabase/ssr';
import { GetServerSideProps } from 'next';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-adapter';
import { Layout } from '@/components/layout/Layout';

export default function SignOut() {
  const router = useRouter();
  const { logout, isLoading } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      if (!isLoading) {
        try {
          await logout();
          
          // Wait a moment to ensure logout is complete
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } catch (error) {
          console.error('Error signing out:', error);
          // Redirect to home page anyway
          router.push('/');
        }
      }
    };
    
    handleSignOut();
  }, [logout, router, isLoading]);

  return (
    <Layout
      title="Signing Out | Smart Debt Flow"
      showNavbar={false}
      showFooter={false}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Signing Out...</h1>
          <p className="text-muted-foreground">
            Please wait while we sign you out.
          </p>
        </div>
      </div>
    </Layout>
  );
}

// Server-side logout handler
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

  // Sign out the user server-side
  await supabase.auth.signOut();

  return {
    props: {},
  };
} 