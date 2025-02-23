import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

const DEBUG = true; // Temporarily enable debugging

async function handleEvent(event) {
  const url = new URL(event.request.url);

  try {
    // Add specific options for asset handling
    const options = {
      cacheControl: {
        browserTTL: 60 * 60 * 24, // 24 hours
        edgeTTL: 60 * 60 * 24 * 365, // 365 days
        bypassCache: DEBUG,
      },
      ASSET_NAMESPACE: event.env.STATIC_ASSETS,
      ASSET_MANIFEST: event.env.__STATIC_CONTENT_MANIFEST,
    };

    // First try to get the asset directly
    try {
      const asset = await getAssetFromKV(event, options);
      const response = new Response(asset.body, asset);

      // Add security headers
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );

      return response;
    } catch (e) {
      // Log the error for debugging
      console.error("Error serving asset:", e.message);

      // If it's not a static asset, try serving index.html
      const page = await getAssetFromKV(event, {
        ...options,
        mapRequestToAsset: (req) =>
          new Request(`${new URL(req.url).origin}/index.html`, req),
      });

      return new Response(page.body, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...page.headers,
        },
      });
    }
  } catch (e) {
    // Log the final error
    console.error("Fatal error:", e.message);

    return new Response(
      `Error loading page. Please try again. (${DEBUG ? e.message : ""})`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleEvent({
        request,
        env,
        waitUntil: ctx.waitUntil.bind(ctx),
      });
    } catch (e) {
      console.error("Unhandled error:", e.message);
      return new Response(
        `Server Error: ${DEBUG ? e.message : "Internal error"}`,
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            "Cache-Control": "no-store",
          },
        }
      );
    }
  },
};
