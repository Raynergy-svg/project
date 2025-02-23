import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

const DEBUG = false;

async function handleEvent(event) {
  const url = new URL(event.request.url);

  try {
    // Check if the request is for a static asset
    const asset = await getAssetFromKV(event);

    // Add security headers
    const response = new Response(asset.body, asset);
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  } catch (e) {
    // For any error or if file is not found, serve index.html
    try {
      const page = await getAssetFromKV(event, {
        mapRequestToAsset: (req) =>
          new Request(`${new URL(req.url).origin}/index.html`, req),
      });

      return new Response(page.body, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          ...page.headers,
        },
      });
    } catch (e) {
      return new Response("Internal Server Error", {
        status: 500,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
      });
    }
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
      return new Response(`Server Error: ${e.message}`, {
        status: 500,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
      });
    }
  },
};
