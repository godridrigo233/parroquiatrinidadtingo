const CACHE_NAME = 'parroquia-cache-v3'; // Subimos a v3 para activar la nueva lógica

// Rutas esenciales que siempre deben estar disponibles en el templo
const OFFLINE_URLS = [
  '/',
  '/assets/logo.webp',
  '/assets/hero-church.webp',
  '/index.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Stale-While-Revalidate (Sirve rápido desde caché, y actualiza en silencio por detrás)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Si está en caché, lo devolvemos DE INMEDIATO (carga instantánea en la iglesia)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 2. Si hay internet, actualizamos la caché en segundo plano
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si falla el internet y no había caché previa, no rompemos la app
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});