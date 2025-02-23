import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

async function handleEvent(event) {
  try {
    // Try to serve static assets
    return await getAssetFromKV(event);
  } catch (e) {
    // If the request is not for a static asset, serve the index.html
    try {
      const notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: (req) =>
          new Request(`${new URL(req.url).origin}/index.html`, req),
      });

      return new Response(notFoundResponse.body, {
        ...notFoundResponse,
        status: 200,
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
