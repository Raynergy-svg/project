/**
 * Next.js App Router patch
 * This patches Next.js App Router to handle common issues
 */

if (typeof window !== 'undefined') {
  try {
    // Patch navigation issues with App Router
    const patchAppRouter = () => {
      // Handle undefined router object
      if (window.next && window.next.router === undefined) {
        window.next = window.next || {};
        window.next.router = window.next.router || {
          route: window.location.pathname,
          prefetch: () => Promise.resolve(),
          push: (url: string) => { window.location.href = url; return Promise.resolve(true); },
          replace: (url: string) => { window.location.replace(url); return Promise.resolve(true); },
          reload: () => { window.location.reload(); return Promise.resolve(true); },
          back: () => { window.history.back(); return Promise.resolve(true); },
          events: {
            on: () => {},
            off: () => {},
            emit: () => {}
          }
        };
      }
    };

    // Patch fetch for App Router RSC
    const originalFetch = window.fetch;
    window.fetch = async function patchedFetch(input, init) {
      try {
        return await originalFetch(input, init);
      } catch (error) {
        // Handle RSC fetch errors
        if (
          error.message?.includes('react-server-dom-webpack') ||
          String(input).includes('react-server-dom-webpack') ||
          String(input).includes('_next/rsc/')
        ) {
          console.warn('React Server Components fetch error suppressed:', error);
          // Return an empty RSC payload to avoid breaking the app
          return new Response(
            JSON.stringify({
              error: 'Fetch error suppressed',
              message: error.message || 'Unknown error'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }
    };

    // Apply patches
    patchAppRouter();
    
    // Listen for document ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchAppRouter);
    }
  } catch (e) {
    console.warn('Error in App Router patch:', e);
  }
} 