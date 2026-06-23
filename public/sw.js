self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Le respondemos "OK" a Chrome para que certifique que el SW está vivo
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => new Response("OK"))
  );
});