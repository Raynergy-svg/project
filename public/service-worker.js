const CACHE_NAME = "smart-debt-flow-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const API_CACHE = "api-v1";
const IMAGE_CACHE = "image-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
];

// Assets to prefetch after main assets are loaded
const PREFETCH_ASSETS = [];

// Cache duration in seconds
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60, // 1 week
  dynamic: 24 * 60 * 60, // 1 day
  api: 5 * 60, // 5 minutes
  image: 3 * 24 * 60 * 60, // 3 days
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Register HTTP/2 Server Push
      self.registration.navigationPreload?.enable(),
    ])
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("smart-debt-flow-"))
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      // Start prefetching non-critical assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PREFETCH_ASSETS);
      }),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and cross-origin requests
  if (
    event.request.method !== "GET" ||
    !url.origin.includes(self.location.origin)
  ) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(event));
    return;
  }

  // Handle image requests
  if (isImageRequest(event.request)) {
    event.respondWith(handleImageRequest(event));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(event));
    return;
  }

  // Handle dynamic content
  event.respondWith(handleDynamicRequest(event));
});

async function handleApiRequest(event) {
  const cache = await caches.open(API_CACHE);

  try {
    // Try network first
    const response = await fetch(event.request);
    cache.put(event.request, response.clone());
    return response;
  } catch (error) {
    // Fall back to cache
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleImageRequest(event) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(event.request);

  if (cachedResponse) {
    // Return cached response and update cache in background
    event.waitUntil(updateImageCache(event.request, cache));
    return cachedResponse;
  }

  // If not in cache, fetch from network
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch (error) {
    // If offline and no cache, return placeholder
    return createImagePlaceholder();
  }
}

async function handleStaticRequest(event) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(event.request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(event.request);
    if (response.ok) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match("/offline.html");
  }
}

async function handleDynamicRequest(event) {
  // Try navigation preload first
  const preloadResponse = await event.preloadResponse;
  if (preloadResponse) {
    return preloadResponse;
  }

  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const response = await fetch(event.request);
    if (response.ok) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match("/offline.html");
  }
}

async function updateImageCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    console.error("Failed to update image cache:", error);
  }
}

function isImageRequest(request) {
  return (
    request.destination === "image" ||
    request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  );
}

function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname) || PREFETCH_ASSETS.includes(pathname);
}

function createImagePlaceholder() {
  // Create a simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#eee"/>
    <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#aaa">Image</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}

// Handle push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        data: data.url,
      })
    );
  }
});
