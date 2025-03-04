const DEBUG = true;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let response;

      // Debug environment bindings
      console.log("Environment bindings:", {
        hasAssets: !!env.ASSETS,
        hasStaticAssets: !!env.STATIC_ASSETS,
        pathname: url.pathname,
        url: url.toString(),
      });

      // Redirect apex domain to www
      if (url.hostname === "smartdebtflow.com") {
        const redirectUrl = new URL(url);
        redirectUrl.hostname = "www.smartdebtflow.com";
        return Response.redirect(redirectUrl.toString(), 301);
      }

      // Special handling for favicon.ico
      if (url.pathname === "/favicon.ico") {
        console.log("Handling favicon.ico request");
        // Always return a transparent 1x1 favicon to prevent browser errors
        return new Response(
          "AAABAAEAAQEAAAEAIAAwAAAAFgAAACgAAAABAAAAAgAAAAEAIAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
          {
            status: 200,
            headers: {
              "Content-Type": "image/x-icon",
              "Cache-Control": "public, max-age=86400",
            },
          }
        );
      }

      // Special handling for manifest files (both .json and .webmanifest)
      if (
        url.pathname === "/manifest.json" ||
        url.pathname === "/manifest.webmanifest"
      ) {
        console.log("Serving static manifest");
        // Instead of trying to fetch from KV or Assets, return a static manifest
        return serveStaticManifest(url);
      }

      // For all other requests, try to use the ASSETS binding if available
      if (env.ASSETS) {
        try {
          console.log(`Fetching asset: ${url.pathname}`);
          response = await env.ASSETS.fetch(request);
          console.log(`Asset fetch result: ${response.status}`);
        } catch (e) {
          console.error("Asset fetch error:", e);

          // If the asset is not found, serve index.html for client-side routing
          try {
            console.log("Falling back to index.html");
            response = await env.ASSETS.fetch(`${url.origin}/index.html`);
          } catch (err) {
            console.error("Failed to serve index.html:", err);
            return new Response(
              `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Service Unavailable</title>
                  <style>
                    body { font-family: sans-serif; padding: 2rem; text-align: center; }
                    h1 { color: #e53e3e; }
                  </style>
                </head>
                <body>
                  <h1>Service Temporarily Unavailable</h1>
                  <p>We're experiencing technical difficulties. Please try again in a few moments.</p>
                  <p>Error: ${err.message}</p>
                </body>
              </html>
            `,
              {
                status: 503,
                headers: { "Content-Type": "text/html;charset=UTF-8" },
              }
            );
          }
        }
      } else {
        console.error("ASSETS binding is missing");
        // Just serve a basic response if ASSETS binding is missing
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Configuration Error</title>
              <style>
                body { font-family: sans-serif; padding: 2rem; text-align: center; }
                h1 { color: #e53e3e; }
              </style>
            </head>
            <body>
              <h1>Configuration Error</h1>
              <p>Site assets not available. Please check your worker configuration.</p>
            </body>
          </html>
        `,
          {
            status: 500,
            headers: { "Content-Type": "text/html;charset=UTF-8" },
          }
        );
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

      // Set the correct content type based on the pathname
      const contentType = getContentType(url.pathname);
      if (contentType) {
        response.headers.set("Content-Type", contentType);
      }

      return response;
    } catch (e) {
      console.error(`Worker error: ${e.message}\n${e.stack}`);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Service Error</title>
            <style>
              body { font-family: sans-serif; padding: 2rem; text-align: center; }
              h1 { color: #e53e3e; }
              pre { text-align: left; background: #f7fafc; padding: 1rem; border-radius: 0.25rem; }
            </style>
          </head>
          <body>
            <h1>Service Error</h1>
            <p>We're experiencing technical difficulties. Please try again in a few moments.</p>
            ${DEBUG ? `<pre>${e.message}\n${e.stack}</pre>` : ""}
          </body>
        </html>
      `,
        {
          status: 500,
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        }
      );
    }
  },
};

/**
 * Serves a static manifest file for PWA support
 * @param {URL} url The request URL
 * @returns {Response} A response with the manifest JSON
 */
function serveStaticManifest(url) {
  const manifest = {
    name: "Smart Debt Flow",
    short_name: "SmartDebtFlow",
    description: "Manage your debt smartly",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

/**
 * Gets the content type based on file extension
 * @param {string} pathname The URL pathname
 * @returns {string|null} The content type or null if not determined
 */
function getContentType(pathname) {
  const extension = pathname.split(".").pop().toLowerCase();
  const contentTypes = {
    html: "text/html;charset=UTF-8",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    webp: "image/webp",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    webmanifest: "application/manifest+json",
  };

  return contentTypes[extension] || null;
}
