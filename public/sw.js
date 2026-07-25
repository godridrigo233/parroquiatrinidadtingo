const CACHE_NAME = 'parroquia-cache-v4'; // v4 — corrige addAll que mataba el SW

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
      // addAll falla si un solo archivo da 404, matando el SW.
      // Con allSettled, los archivos que sí se cacheen no bloquean la activación.
      return Promise.allSettled(
        OFFLINE_URLS.map((url) =>
          fetch(url, { cache: 'no-store' })
            .then((res) => { if (res.ok) return cache.put(url, res); else throw new Error(`HTTP ${res.status}`); })
        )
      );
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
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Parroquia Santísima Trinidad";
    const options = {
      body: data.body || "Tienes un nuevo aviso parroquial.",
      icon: "/assets/logo.webp",
      badge: "/assets/logo.webp",
      vibrate: [200, 100, 200],
      tag: "parish-notification",
      renotify: true,
      requireInteraction: false,
      data: {
        url: data.url || "/"
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // Si el payload es texto plano (no JSON), lo mostramos como título
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification(text.slice(0, 100), {
        icon: "/assets/logo.webp",
        badge: "/assets/logo.webp",
        tag: "parish-notification",
        data: { url: "/" }
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Intentar re-enfocar una pestaña existente en el mismo dominio
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then((focused) => {
            if (focused && urlToOpen !== "/") {
              client.postMessage({ type: "navigate", url: urlToOpen });
            }
          });
        }
      }
      // Si no hay pestaña abierta, abrir una nueva
      return clients.openWindow(urlToOpen);
    })
  );
});