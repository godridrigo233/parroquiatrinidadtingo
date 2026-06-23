self.addEventListener('install', (e) => {
  self.skipWaiting(); // Se instala inmediatamente
});

self.addEventListener('activate', (e) => {
  // Cuando se activa, busca TODAS las cachés antiguas y las elimina sin piedad
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Borrando caché antigua:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Simplemente dejamos que la web funcione normal, pidiendo todo a Vercel.
  // Solo interceptamos la petición porque Chrome exige que haya un evento 'fetch' para habilitar la PWA.
  e.respondWith(fetch(e.request));
});