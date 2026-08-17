self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("mangaverse-cache").then((cache) => {
      return cache.addAll(["/", "/icon.png", "/manifest.json"]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  
  // Exclude image proxy and API routes from Service Worker to prevent cache bloat
  if (url.pathname.startsWith('/api/')) {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
