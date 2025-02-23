import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

const DEBUG = true; // Temporarily enable debugging

async function handleEvent(event) {
  try {
    // Try to get the asset from KV
    let options = {};
    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true,
      };
    }

    const response = await getAssetFromKV(event, options);

    // Add security headers
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  } catch (e) {
    if (DEBUG) {
      console.error(e);
    }

    // Handle 404s and other errors
    const notFoundResponse = await getAssetFromKV(event, {
      mapRequestToAsset: (req) =>
        new Request(`${new URL(req.url).origin}/index.html`, req),
    });

    return new Response(notFoundResponse.body, {
      ...notFoundResponse,
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "X-XSS-Protection": "1; mode=block",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
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
