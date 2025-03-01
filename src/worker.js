const DEBUG = true;

export default {
  async fetch(request, env, ctx) {
    try {
      // Log available environment variables for debugging
      if (DEBUG) {
        console.log("Worker environment variables:");
        console.log("SUPABASE_URL available:", !!env.SUPABASE_URL);
        console.log("SUPABASE_ANON_KEY available:", !!env.SUPABASE_ANON_KEY);
        console.log("Environment:", env.ENVIRONMENT);

        // Add the values to the response headers for debugging
        const debugHeaders = {
          "X-Debug-Supabase-URL": env.SUPABASE_URL || "not-set",
          "X-Debug-Environment": env.ENVIRONMENT || "not-set",
        };
      }

      const url = new URL(request.url);
      let response;

      // Try to get the asset from the assets binding
      try {
        response = await env.ASSETS.fetch(request);
      } catch (e) {
        if (DEBUG) {
          console.error("Asset fetch error:", e);
        }
        // If the asset is not found, serve index.html for client-side routing
        response = await env.ASSETS.fetch(`${url.origin}/index.html`);
      }

      // Add security headers
      response = new Response(response.body, response);
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );

      // Add environment variables to the response for client-side use
      if (DEBUG) {
        // Create a script tag to inject environment variables into the client
        const envScript = `
          <script>
            window.ENV = {
              SUPABASE_URL: "${env.SUPABASE_URL || ""}",
              SUPABASE_ANON_KEY: "${env.SUPABASE_ANON_KEY || ""}",
              ENVIRONMENT: "${env.ENVIRONMENT || "development"}"
            };
            console.log("Environment variables injected by worker:", window.ENV);
          </script>
        `;

        // Only modify HTML responses
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          // Get the response text
          const text = await response.text();

          // Insert the script tag after the <head> tag
          const newText = text.replace(/<head>/, `<head>${envScript}`);

          // Create a new response with the modified HTML
          response = new Response(newText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }
      }

      return response;
    } catch (e) {
      if (DEBUG) {
        return new Response(`Error: ${e.message}\n\nStack: ${e.stack}`, {
          status: 500,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
        });
      }
      return new Response("Internal Error", {
        status: 500,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
      });
    }
  },
};
