const DEBUG = true;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let response;

      // Special handling for manifest.json
      if (url.pathname === "/manifest.json") {
        try {
          response = await env.STATIC_ASSETS.fetch(request);
        } catch (e) {
          // Fallback to the default assets binding
          response = await env.ASSETS.fetch(request);
        }
      } else {
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
      response.headers.set("Content-Type", getContentType(url.pathname));

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

// Helper function to determine content type
function getContentType(pathname) {
  const extension = pathname.split(".").pop().toLowerCase();

  const contentTypes = {
    html: "text/html;charset=UTF-8",
    css: "text/css;charset=UTF-8",
    js: "application/javascript;charset=UTF-8",
    json: "application/json;charset=UTF-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    webp: "image/webp",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
  };

  return contentTypes[extension] || "application/octet-stream";
}
