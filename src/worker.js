import { getAssetFromKV, NotFoundError } from "@cloudflare/kv-asset-handler";

const DEBUG = false;

async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  try {
    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true,
      };
    }

    // First try serving static assets
    const page = await getAssetFromKV(event, options);
    const response = new Response(page.body, page);

    // Add security headers
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Feature-Policy", "none");

    return response;
  } catch (e) {
    // If an error occurred while serving static assets...
    if (!(e instanceof NotFoundError)) {
      return new Response("An unexpected error occurred", { status: 500 });
    }

    // If path is not a static asset, serve index.html for SPA routing
    try {
      options.mapRequestToAsset = (req) =>
        new Request(`${new URL(req.url).origin}/index.html`, req);
      const notFoundResponse = await getAssetFromKV(event, options);

      return new Response(notFoundResponse.body, {
        ...notFoundResponse,
        status: 200,
        headers: {
          ...notFoundResponse.headers,
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleEvent({
        request,
        env,
        ctx,
        waitUntil: ctx.waitUntil.bind(ctx),
      });
    } catch (e) {
      return new Response("Internal Error", { status: 500 });
    }
  },
};
