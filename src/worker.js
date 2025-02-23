import {
  getAssetFromKV,
  NotFoundError,
  serveSinglePageApp,
} from "@cloudflare/kv-asset-handler";

const DEBUG = false;

async function handleEvent(event) {
  try {
    let options = {
      mapRequestToAsset: serveSinglePageApp,
    };

    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true,
      };
    }

    const page = await getAssetFromKV(event, options);

    // Allow the SPA to handle 404s
    const response = new Response(page.body, page);

    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Feature-Policy", "none");

    return response;
  } catch (e) {
    if (!(e instanceof NotFoundError)) {
      return new Response("An unexpected error occurred", { status: 500 });
    }

    // If the error is a NotFoundError, serve the SPA's index.html
    try {
      let notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: (req) =>
          new Request(`${new URL(req.url).origin}/index.html`, req),
      });

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
      const event = {
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
        env,
      };
      return await handleEvent(event);
    } catch (e) {
      return new Response("Internal Error", { status: 500 });
    }
  },
};
