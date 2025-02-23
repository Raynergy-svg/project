const DEBUG = true;

export default {
  async fetch(request, env, ctx) {
    try {
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

      return response;
    } catch (e) {
      if (DEBUG) {
        return new Response(`Error: ${e.message}`, {
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
