const DEBUG = true;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let response;

      // Debug environment bindings
      if (DEBUG) {
        console.log("Environment bindings:", {
          hasAssets: !!env.ASSETS,
          hasStaticAssets: !!env.STATIC_ASSETS,
          pathname: url.pathname,
        });
      }

      // Special handling for manifest files (both .json and .webmanifest)
      if (
        url.pathname === "/manifest.json" ||
        url.pathname === "/manifest.webmanifest"
      ) {
        // Instead of trying to fetch from KV or Assets, return a static manifest
        return serveStaticManifest(url);
      }

      // For all other requests, try to use the ASSETS binding if available
      if (env.ASSETS) {
        try {
          response = await env.ASSETS.fetch(request);
        } catch (e) {
          if (DEBUG) {
            console.error("Asset fetch error:", e);
          }

          // If the asset is not found, serve index.html for client-side routing
          try {
            response = await env.ASSETS.fetch(`${url.origin}/index.html`);
          } catch (err) {
            return new Response(`Failed to serve index.html: ${err.message}`, {
              status: 500,
              headers: { "Content-Type": "text/plain;charset=UTF-8" },
            });
          }
        }
      } else {
        // Just serve a basic response if ASSETS binding is missing
        return new Response(
          "Site assets not available. Please check your worker configuration.",
          {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
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
      if (DEBUG) {
        return new Response(`Error: ${e.message}\n${e.stack}`, {
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

// Helper function to serve static manifest
function serveStaticManifest(url) {
  // Hard-coded manifest content as a fallback
  const manifest = {
    name: "Smart Debt Flow",
    short_name: "DebtFlow",
    description: "Manage and track your debt payoff journey",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    icons: [
      {
        src: "/pwa-64x64.png",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "View your debt payoff progress",
      },
      {
        name: "Add Debt",
        url: "/dashboard/add-debt",
        description: "Add a new debt to track",
      },
    ],
    categories: ["finance", "productivity"],
    orientation: "any",
    prefer_related_applications: false,
    display_override: ["standalone", "window-controls-overlay"],
  };

  const manifestContent = JSON.stringify(manifest, null, 2);
  const contentType =
    url.pathname === "/manifest.json"
      ? "application/json"
      : "application/manifest+json";

  return new Response(manifestContent, {
    status: 200,
    headers: {
      "Content-Type": `${contentType};charset=UTF-8`,
      "X-XSS-Protection": "1; mode=block",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

// Helper function to determine content type
function getContentType(pathname) {
  const extension = pathname.split(".").pop().toLowerCase();

  const contentTypes = {
    html: "text/html;charset=UTF-8",
    css: "text/css;charset=UTF-8",
    js: "application/javascript;charset=UTF-8",
    json: "application/json;charset=UTF-8",
    webmanifest: "application/manifest+json;charset=UTF-8",
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
